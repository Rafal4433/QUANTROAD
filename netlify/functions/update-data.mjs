import YahooFinance from 'yahoo-finance2';
import { getStore } from '@netlify/blobs';

const yahooFinance = new YahooFinance();

const TICKERS = {
  usa: 'VTSMX',
  exus: 'VGTSX',
  nq: 'QQQ',
  em: 'VEIEX',
  btc: 'BTC-USD',
  gld: 'GLD',
  epol: 'EPOL',
  bonds: 'VBMFX',
  tlt: 'TLT',
  shy: 'SHY',
};

const START_DATE = '1998-01-01';

export const config = {
  schedule: '0 6 * * *', // codziennie 06:00 UTC (08:00 CET)
};

export default async function handler() {
  console.log('[update-data] Fetching historical data from Yahoo Finance...');
  const results = {};

  for (const [key, ticker] of Object.entries(TICKERS)) {
    console.log(`[update-data] Fetching ${ticker} (${key})...`);
    try {
      const data = await yahooFinance.chart(ticker, {
        period1: START_DATE,
        period2: new Date().toISOString().split('T')[0],
        interval: '1mo',
      });

      const priceMap = new Map();
      for (const row of data.quotes) {
        if (!row.date) continue;
        const dateStr = row.date.toISOString().substring(0, 7);
        if (row.adjclose != null) {
          priceMap.set(dateStr, row.adjclose);
        } else if (row.close != null) {
          priceMap.set(dateStr, row.close);
        }
      }
      results[key] = priceMap;
    } catch (err) {
      console.error(`[update-data] Error fetching ${ticker}:`, err.message);
    }
  }

  if (!results.usa) {
    console.error('[update-data] Failed to get USA data. Aborting.');
    return new Response('Failed to fetch USA data', { status: 500 });
  }

  const sortedDates = Array.from(results.usa.keys()).sort();
  console.log(`[update-data] Aligned ${sortedDates.length} months: ${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`);

  const outputData = [];
  for (const date of sortedDates) {
    const entry = { date };
    for (const key of Object.keys(TICKERS)) {
      entry[key] = results[key]?.has(date) ? results[key].get(date) : null;
    }
    outputData.push(entry);
  }

  const store = getStore('historical-data');
  await store.set('data', JSON.stringify(outputData));
  console.log(`[update-data] ✅ Saved ${outputData.length} records to Netlify Blobs`);

  return new Response(`Updated ${outputData.length} monthly records`, { status: 200 });
}
