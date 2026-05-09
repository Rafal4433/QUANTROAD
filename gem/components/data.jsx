// Mock data — GEM vs MSCI World 2010–2025. Realistic shapes (not real returns).
// Equity is normalized to 100 at start.

(function(){
  const months = [];
  const start = new Date(2010, 0, 1);
  for (let i = 0; i < 192; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push(d);
  }

  // hand-tuned monthly return generator
  function gen(seed, vol, drift, drawAt, drawMag){
    let v = 100; const out = [];
    let s = seed;
    function rand(){ s = (s*9301+49297)%233280; return s/233280; }
    for (let i = 0; i < months.length; i++){
      let r = (rand()-0.5)*vol*2 + drift;
      // drawdown events
      drawAt.forEach((da, idx) => {
        if (i >= da && i < da + 6) r -= drawMag[idx]/6;
      });
      v *= (1 + r);
      out.push(v);
    }
    return out;
  }

  // GEM: lower vol than 100% equity, avoids worst drawdowns by going to bonds
  const gemRaw = gen(7, 0.025, 0.0085, [22, 110, 145], [0.02, 0.04, 0.03]);
  const mscRaw = gen(13, 0.038, 0.0072, [22, 110, 145, 178], [0.18, 0.22, 0.16, 0.10]);

  const equity = months.map((d, i) => ({
    date: d,
    label: d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' }),
    year: d.getFullYear(),
    gem: gemRaw[i],
    msci: mscRaw[i],
    // drawdown from running max
  }));

  // compute drawdowns
  let gMax = -Infinity, mMax = -Infinity;
  equity.forEach(p => {
    gMax = Math.max(gMax, p.gem); mMax = Math.max(mMax, p.msci);
    p.gemDd = (p.gem / gMax - 1) * 100;
    p.msciDd = (p.msci / mMax - 1) * 100;
  });

  const log = [
    { date: '2025-09-01', kind: 'KUP', asset: 'VTSMX', roc: 18.4, tax: 0,    note: 'mom 1M·3M·6M·12M = 18.4%' },
    { date: '2025-09-01', kind: 'SPRZEDAJ', asset: 'GLD', roc: 11.2, tax: 1840, note: 'rotacja → equity, podatek Belki' },
    { date: '2025-08-01', kind: 'TRZYMAJ', asset: 'VTSMX', roc: 16.1, tax: 0, note: 'sygnał > bufor histerezy 3%' },
    { date: '2025-07-01', kind: 'KUP', asset: 'VTSMX', roc: 14.7, tax: 0, note: 'wyjście z SHY (T-bill)' },
    { date: '2025-06-01', kind: 'SPRZEDAJ', asset: 'VTSMX', roc: -2.1, tax: 0, note: 'mom < bench, do SHY' },
    { date: '2025-05-01', kind: 'KUP', asset: 'SHY', roc: 4.1, tax: 0, note: 'safe haven – obligacje 1-3Y' },
    { date: '2025-04-01', kind: 'ZAPŁAĆ', asset: 'FX spread', roc: 0, tax: 124, note: 'spread 0.18% USD/PLN' },
    { date: '2025-03-01', kind: 'TRZYMAJ', asset: 'VEIEX', roc: 9.4, tax: 0, note: 'mom 9.4% > bench 7.1%' },
    { date: '2025-02-01', kind: 'KUP', asset: 'VEIEX', roc: 9.4, tax: 0, note: 'rotacja z VTSMX → EM' },
    { date: '2025-01-01', kind: 'SPRZEDAJ', asset: 'VTSMX', roc: 6.2, tax: 2410, note: 'realizacja, IKE shield wył.' },
    { date: '2024-12-01', kind: 'TRZYMAJ', asset: 'VTSMX', roc: 12.8, tax: 0, note: '' },
    { date: '2024-11-01', kind: 'KUP', asset: 'VTSMX', roc: 12.8, tax: 0, note: 'reakcja po wyborach US' },
    { date: '2024-10-01', kind: 'SPRZEDAJ', asset: 'BTC', roc: 142.0, tax: 18650, note: 'wycofanie pozycji ryzyka' },
    { date: '2024-09-01', kind: 'TRZYMAJ', asset: 'BTC', roc: 134.2, tax: 0, note: 'mom 134% — najwyższy w koszyku' },
  ];

  const costs = {
    gem: {
      brokerFees: 8420,
      taxesPaid: 41280,
      gross: 612400,
      finalTax: 18960,
      net: 552220,
      grossReturn: 51.0,
      netReturn: 38.1,
    },
    bench: {
      brokerFees: 1240,
      taxesPaid: 0,
      gross: 482300,
      finalTax: 73140,
      net: 409160,
      grossReturn: 20.6,
      netReturn: 2.3,
    },
  };

  const kpis = {
    cagr:    { gem: 11.8, bench: 8.1 },
    maxDd:   { gem: -14.2, bench: -33.7 },
    sharpe:  { gem: 1.04, bench: 0.62 },
    ulcer:   { gem: 3.4,  bench: 9.1 },
  };

  window.MockData = { equity, months, log, costs, kpis };
})();
