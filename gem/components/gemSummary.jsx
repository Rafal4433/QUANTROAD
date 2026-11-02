// Domyślne parametry GEM i wspólne wyniki dla stron poza symulatorem.
// Liczby pochodzą z runBacktest, żadnego wyniku nie wpisujemy na stałe.

const GEM_DEFAULT_PARAMS = {
  riskAssets:      ['nq', 'em', 'gld'],
  safeAsset:       'dynamic',
  benchmark:       'SP500',
  lookback:        12,
  whipsawBuffer:   0,
  initialCapital:  50000,
  monthlyDCA:      1500,
  leverage:        1.0,
  brokerFee:       0,
  fxSpread:        0,
  ikeActive:       false,
  ensembleMomentum: true,
  startDate:       '2000-01-01',
  endDate:         '',
};

// Klasyczny wariant Antonacciego: USA albo rynki poza USA, obligacje, 12 miesięcy.
const GEM_CLASSIC_PARAMS = {
  riskAssets:       ['usa', 'exus'],
  safeAsset:        'bonds',
  benchmark:        'MSCI',
  ensembleMomentum: false,
};

let gemDataPromise = null;

function loadGemData() {
  if (!gemDataPromise) {
    gemDataPromise = fetch('historical_data.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  return gemDataPromise;
}

function formatGemMonth(dateKey) {
  const [year, month] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function formatGemAmount(value) {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)} mln PLN`
    : `${Math.round(value / 1_000)} tys. PLN`;
}

function lowestInRange(labels, series, from, to) {
  return labels.reduce((low, label, i) => (
    label >= from && label <= to ? Math.min(low, series[i]) : low
  ), 0);
}

function summarizeGem(historicalData) {
  const run = overrides => window.runBacktest({ ...GEM_DEFAULT_PARAMS, ...overrides, historicalData });
  const base = run({});
  const since2010 = run({ startDate: '2010-01-01' });
  const classic = run(GEM_CLASSIC_PARAMS);

  return {
    from:       formatGemMonth(base.labels[0]),
    to:         formatGemMonth(base.labels[base.labels.length - 1]),
    months:     base.metadata.months,
    deployed:   base.metadata.totalCapitalDeployed,
    benchLabel: 'S&P 500',
    curve:      base.portfolioValues,
    gem:        { ...base.kpi.gem, net: base.liquidation.gemFinalNet },
    bench:      { ...base.kpi.bench, net: base.liquidation.benchFinalNet },
    crisis: {
      gem:   lowestInRange(base.labels, base.drawdownSeries, '2007-01', '2009-12'),
      bench: lowestInRange(base.labels, base.benchDrawdownSeries, '2007-01', '2009-12'),
    },
    since2010: {
      gemNet:   since2010.liquidation.gemFinalNet,
      benchNet: since2010.liquidation.benchFinalNet,
    },
    classic: {
      gemNet:   classic.liquidation.gemFinalNet,
      benchNet: classic.liquidation.benchFinalNet,
    },
  };
}

function useGemSummary() {
  const [state, setState] = React.useState({ summary: null, failed: false });

  React.useEffect(() => {
    loadGemData()
      .then(data => setState({ summary: summarizeGem(data), failed: false }))
      .catch(() => setState({ summary: null, failed: true }));
  }, []);

  return state;
}

window.GEM_DEFAULT_PARAMS = GEM_DEFAULT_PARAMS;
window.loadGemData = loadGemData;
window.formatGemMonth = formatGemMonth;
window.formatGemAmount = formatGemAmount;
window.useGemSummary = useGemSummary;
