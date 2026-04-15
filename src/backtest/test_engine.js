import { runBacktest } from './gemEngine.js';
import fs from 'fs';
try {
  const data = JSON.parse(fs.readFileSync('./public/historical_data.json'));
  const r = runBacktest({ historicalData: data, riskAssets: ['usa', 'exus'], safeAsset: 'shy', lookback: 12, startDate: '2000-01-01', initialCapital: 50000, monthlyDCA: 1500, brokerFee: 0, fxSpread: 0, benchmark: 'SP500', ikeActive: false });
  console.log('Success, final portfolio:', r.metadata.finalPortfolioValue);
} catch(e) { console.error('Engine error:', e); }
