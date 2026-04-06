import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import fs from 'fs';
import path from 'path';

// Proxies for the assets with long history
// VTSMX: Vanguard Total Stock Market (USA) since 1992
// VGTSX: Vanguard Total Intl Stock (Ex-US) since 1996
// VBMFX: Vanguard Total Bond Market (Bonds) since 1986
const TICKERS = {
  usa: 'VTSMX',     // Vanguard Total Stock Market (USA)
  exus: 'VGTSX',    // Vanguard Total Intl Stock (Ex-US)
  nq: 'QQQ',        // Invesco QQQ Trust (Nasdaq 100)
  em: 'VEIEX',      // Emerging Markets (Vanguard)
  btc: 'BTC-USD',   // Bitcoin
  gld: 'GLD',       // SPDR Gold Shares
  epol: 'EPOL',     // iShares MSCI Poland ETF (proxy for Polish EQ)
  bonds: 'VBMFX',   // Vanguard Total Bond Market (aggregate)
  tlt: 'TLT',       // iShares 20+ Year Treasury Bond ETF
  shy: 'SHY',       // iShares 1-3 Year Treasury Bond ETF (short-term bond proxy)
};

const START_DATE = '1998-01-01';

async function fetchHistoricalData() {
  console.log('Fetching historical data from Yahoo Finance...');
  const results = {};

  for (const [key, ticker] of Object.entries(TICKERS)) {
    console.log(`Fetching ${ticker} (${key})...`);
    try {
      const queryOptions = {
        period1: START_DATE,
        period2: new Date().toISOString().split('T')[0],
        interval: '1mo'
      };
      const data = await yahooFinance.chart(ticker, queryOptions);
      
      const priceMap = new Map();
      for (const row of data.quotes) {
        if (!row.date) continue;
        const dateStr = row.date.toISOString().substring(0, 7);
        if (row.adjclose !== null && row.adjclose !== undefined) {
          priceMap.set(dateStr, row.adjclose);
        } else if (row.close !== null && row.close !== undefined) {
          priceMap.set(dateStr, row.close);
        }
      }
      results[key] = priceMap;
    } catch (err) {
      console.error(`Error fetching ${ticker}:`, err.message);
    }
  }

  console.log('Aligning dates using USA (VTSMX) timeline as master...');
  if (!results.usa) {
      console.error('Failed to get USA dates. Aborting.');
      return;
  }
  const sortedDates = Array.from(results.usa.keys()).sort();

  if (sortedDates.length === 0) {
    console.error('Failed to align dates, no dates found.');
    return;
  }

  console.log(`Aligned data blocks from ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
  console.log(`Total months: ${sortedDates.length}`);

  const outputData = [];
  for (const date of sortedDates) {
    const entry = { date };
    for (const key of Object.keys(TICKERS)) {
      entry[key] = results[key].has(date) ? results[key].get(date) : null;
    }
    outputData.push(entry);
  }

  const outPath = path.resolve(process.cwd(), 'public', 'historical_data.json');
  fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`✅ Saved ${outputData.length} monthly records to public/historical_data.json`);
}

fetchHistoricalData();
