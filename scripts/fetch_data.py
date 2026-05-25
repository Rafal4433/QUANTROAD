#!/usr/bin/env python3
"""
Fetch monthly market data from Yahoo Finance and append to gem/historical_data.json.
Run: pip install yfinance && python scripts/fetch_data.py
"""
import json
import datetime
from pathlib import Path

try:
    import yfinance as yf
except ImportError:
    raise SystemExit("Zainstaluj: pip install yfinance")

TICKERS = {
    'usa':   'VTI',      # Vanguard Total Stock Market
    'exus':  'VEU',      # Vanguard FTSE All-World ex-US
    'nq':    'QQQ',      # NASDAQ
    'em':    'EEM',      # Emerging Markets
    'btc':   'BTC-USD',  # Bitcoin
    'gld':   'GLD',      # Gold
    'epol':  'EPOL',     # Poland ETF
    'brk':   'BRK-B',    # Berkshire Hathaway Class B
    'bonds': 'BND',      # Total Bond Market
    'tlt':   'TLT',      # Long-Term Treasury
    'shy':   'SHY',      # Short-Term Treasury
}

DATA_FILE = Path(__file__).parent.parent / 'gem' / 'historical_data.json'


def next_month(year, month):
    return (year + 1, 1) if month == 12 else (year, month + 1)


def main():
    data = json.loads(DATA_FILE.read_text())

    last_y, last_m = map(int, data[-1]['date'].split('-'))
    start_y, start_m = next_month(last_y, last_m)
    fetch_start = datetime.date(start_y, start_m, 1)

    today = datetime.date.today()
    cutoff = datetime.date(today.year, today.month, 1)

    if fetch_start >= cutoff:
        print("Dane są aktualne.")
        return

    # Pobierz dane dla wszystkich tickerów naraz
    symbols = list(TICKERS.values())
    end_date = datetime.date(cutoff.year + (1 if cutoff.month == 12 else 0),
                             1 if cutoff.month == 12 else cutoff.month + 1, 1)

    print(f"Pobieram dane od {fetch_start} do {cutoff} ...")
    raw = yf.download(symbols, start=fetch_start.isoformat(),
                      end=end_date.isoformat(), interval='1mo',
                      auto_adjust=True, progress=False)

    closes = raw['Close'] if 'Close' in raw else raw

    added = 0
    cur_y, cur_m = start_y, start_m
    while datetime.date(cur_y, cur_m, 1) < cutoff:
        key = f'{cur_y}-{cur_m:02d}'
        entry = {'date': key}
        for field, sym in TICKERS.items():
            try:
                val = closes[sym].get(f'{key}-01') or closes[sym].get(key)
                entry[field] = float(val) if val is not None and str(val) != 'nan' else None
            except Exception:
                entry[field] = None
        data.append(entry)
        print(f"  Dodano {key}")
        added += 1
        cur_y, cur_m = next_month(cur_y, cur_m)

    if added:
        DATA_FILE.write_text(json.dumps(data, indent=2))
        print(f"Zapisano {added} nowych miesięcy → {DATA_FILE}")
    else:
        print("Brak nowych danych.")


if __name__ == '__main__':
    main()
