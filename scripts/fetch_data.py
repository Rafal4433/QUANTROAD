#!/usr/bin/env python3
"""
Fetch monthly market data from Yahoo Finance and append to gem/historical_data.json.
Run: pip install yfinance && python scripts/fetch_data.py
"""
import json
import datetime
import urllib.request
from pathlib import Path

try:
    import yfinance as yf
except ImportError:
    raise SystemExit("Zainstaluj: pip install yfinance")

TICKERS = {
    'usa':   'VTSMX',    # Vanguard Total Stock Market
    'exus':  'VGTSX',    # Vanguard Total International Stock
    'nq':    'QQQ',      # NASDAQ
    'em':    'VEIEX',    # Emerging Markets
    'btc':   'BTC-USD',  # Bitcoin
    'gld':   'GLD',      # Gold
    'epol':  'EPOL',     # Poland ETF
    'brk':   'BRK-B',    # Berkshire Hathaway Class B
    'bonds': 'VBMFX',    # Total Bond Market
    'tlt':   'TLT',      # Long-Term Treasury
    'shy':   'SHY',      # Short-Term Treasury
}

DATA_FILE = Path(__file__).parent.parent / 'gem' / 'historical_data.json'


def next_month(year, month):
    return (year + 1, 1) if month == 12 else (year, month + 1)


def is_valid_price(value):
    return value is not None and str(value) != 'nan'


def yahoo_chart_month_close(symbol, year, month):
    start = datetime.datetime(year, month, 1, tzinfo=datetime.timezone.utc)
    end_y, end_m = next_month(year, month)
    end_y, end_m = next_month(end_y, end_m)
    end = datetime.datetime(end_y, end_m, 1, tzinfo=datetime.timezone.utc)
    url = (
        f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}'
        f'?interval=1mo&period1={int(start.timestamp())}'
        f'&period2={int(end.timestamp())}&events=history&includeAdjustedClose=true'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=20) as response:
        payload = json.load(response)

    result = payload.get('chart', {}).get('result') or []
    if not result:
        return None

    timestamps = result[0].get('timestamp') or []
    adjclose = result[0].get('indicators', {}).get('adjclose', [{}])[0].get('adjclose') or []
    target = f'{year}-{month:02d}'
    for ts, value in zip(timestamps, adjclose):
        dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc)
        if dt.strftime('%Y-%m') == target and is_valid_price(value):
            return float(value)
    return None


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
                entry[field] = float(val) if is_valid_price(val) else None
            except Exception:
                entry[field] = None
            if entry[field] is None:
                try:
                    entry[field] = yahoo_chart_month_close(sym, cur_y, cur_m)
                except Exception:
                    entry[field] = None
        missing = [field for field in TICKERS if entry[field] is None]
        if missing:
            print(f"  Pominięto {key}: brak danych dla {', '.join(missing)}")
        else:
            data.append(entry)
            print(f"  Dodano {key}")
            added += 1
        cur_y, cur_m = next_month(cur_y, cur_m)

    if added:
        DATA_FILE.write_text(json.dumps(data, indent=2) + '\n')
        print(f"Zapisano {added} nowych miesięcy → {DATA_FILE}")
    else:
        print("Brak nowych danych.")


if __name__ == '__main__':
    main()
