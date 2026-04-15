import React from 'react';

const ASSET_UNIVERSE = [
  // ─ Equities
  { id: 'usa', ticker: 'VTSMX', name: 'US Total', type: 'USA' },
  { id: 'nq', ticker: 'QQQ', name: 'Nasdaq 100', type: 'USA' },
  { id: 'exus', ticker: 'VGTSX', name: 'Ex-US', type: 'Ex-US' },
  { id: 'em', ticker: 'VEIEX', name: 'Emerging', type: 'Ex-US' },
  { id: 'epol', ticker: 'EPOL', name: 'Poland', type: 'Ex-US' },
  { id: 'gld', ticker: 'GLD', name: 'Gold', type: 'Cmdty' },
  { id: 'btc', ticker: 'BTC-USD', name: 'Bitcoin', type: 'Crypto' },
  // ─ Bonds / Safe
  { id: 'shy', ticker: 'SHY', name: '1-3yr T-Bill', type: 'Safe' },
  { id: 'bonds', ticker: 'VBMFX', name: 'Agg Bond', type: 'Safe' },
  { id: 'tlt', ticker: 'TLT', name: '20yr+ T-Bond', type: 'Safe' },
];

const TYPE_ICONS = {
  USA: '🇺🇸',
  'Ex-US': '🌍',
  Safe: '🛡️',
  Crypto: '₿',
  Cmdty: '📀',
};

function LightSlider({ label, value, min, max, step, onChange, displayValue, hint }) {
  return (
    <div className="sl-field">
      <div className="sl-slider-head">
        <label className="sl-label">{label}</label>
        <span className="sl-val">{displayValue || value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="sl-range"
      />
      {hint && <span className="sl-hint">{hint}</span>}
    </div>
  );
}

function LightInput({ label, value, onChange }) {
  return (
    <div className="sl-field">
      <label className="sl-label">{label}</label>
      <input
        type="number"
        className="sl-input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function SimulatorControls({ params, setParams }) {
  const setParam = (key) => (value) => setParams(p => ({ ...p, [key]: value }));

  const toggleRiskAsset = (id) => {
    setParams(p => {
      const current = new Set(p.riskAssets);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      if (current.size === 0) current.add(id);
      return { ...p, riskAssets: Array.from(current) };
    });
  };

  const toggleSafeAsset = (id) => {
    if (params.safeAsset === id) {
      setParams(p => ({ ...p, safeAsset: 'dynamic' }));
    } else {
      setParams(p => ({ ...p, safeAsset: id }));
    }
  };

  const riskAssets = ASSET_UNIVERSE.filter(a => a.type !== 'Safe');
  const safeAssets = ASSET_UNIVERSE.filter(a => a.type === 'Safe');
  const isDynamicSafe = params.safeAsset === 'dynamic';

  return (
    <div className="sim-light-wrapper">
      {/* SECTION 1: Asset Universe */}
      <section className="sl-panel sl-col-full">
        <h3 className="sl-title">Asset Universe</h3>
        
        <div className="sl-assets-divider">
          <div className="sl-assets-group">
            <h4 className="sl-group-title">Aktywa ryzykowne</h4>
            <div className="sl-chip-grid">
              {riskAssets.map(a => {
                const isActive = params.riskAssets.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleRiskAsset(a.id)}
                    className={`sl-chip sl-chip-risk ${isActive ? 'active' : ''}`}
                  >
                    <span className="sl-chip-icon">{TYPE_ICONS[a.type]}</span>
                    <span className="sl-chip-ticker">{a.ticker}</span>
                    <span className="sl-chip-name">{a.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="sl-helper-text">Kliknij aby włączyć do koszyka rozpatrywanego przez momentum.</p>
          </div>

          <div className="sl-assets-group">
            <h4 className="sl-group-title">Bezpieczna przystań</h4>
            <div className="sl-chip-grid">
              <button
                type="button"
                className={`sl-chip sl-chip-safe ${isDynamicSafe ? 'active' : ''}`}
                onClick={() => setParam('safeAsset')(isDynamicSafe ? 'shy' : 'dynamic')}
              >
                <span className="sl-chip-icon">🤖</span>
                <span className="sl-chip-ticker">DYN</span>
                <span className="sl-chip-name">Dynamiczny wybór</span>
              </button>
              {safeAssets.map(a => {
                const isActive = params.safeAsset === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleSafeAsset(a.id)}
                    className={`sl-chip sl-chip-safe ${isActive ? 'active' : ''} ${isDynamicSafe ? 'dim-safe' : ''}`}
                    disabled={isDynamicSafe}
                  >
                    <span className="sl-chip-icon">{TYPE_ICONS[a.type]}</span>
                    <span className="sl-chip-ticker">{a.ticker}</span>
                    <span className="sl-chip-name">{a.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="sl-helper-text">Aktywa ucieczkowe podczas fazy bear market. DYN: wybiera najlepsze bond momentum.</p>
          </div>
        </div>
      </section>

      {/* TWO COLUMNS CONTINUED */}
      <div className="sl-grid-2col">
        {/* SECTION 2: Trend & Benchmark */}
        <section className="sl-panel sl-stack">
          <h3 className="sl-title">Trend & Benchmark</h3>
          
          <div className="sl-field">
            <label className="sl-label">Benchmark</label>
            <div className="sl-segmented">
              <button
                type="button"
                className={`sl-seg-btn ${params.benchmark === 'MSCI' ? 'active' : ''}`}
                onClick={() => setParam('benchmark')('MSCI')}
              >
                MSCI World
              </button>
              <button
                type="button"
                className={`sl-seg-btn ${params.benchmark === 'SP500' ? 'active' : ''}`}
                onClick={() => setParam('benchmark')('SP500')}
              >
                S&P 500
              </button>
            </div>
          </div>

          <div className="sl-field sl-mt">
            <label className="sl-toggle" htmlFor="ensembleMomentum">
              <div className="sl-toggle-text">
                <span className="sl-toggle-head">Algorytm trendu</span>
                <span className="sl-toggle-sub">Momentum composite: 1M · 3M · 6M · 12M</span>
              </div>
              <div className="sl-toggle-switch-wrap">
                <input
                  type="checkbox"
                  id="ensembleMomentum"
                  name="ensembleMomentum"
                  checked={params.ensembleMomentum}
                  onChange={e => setParam('ensembleMomentum')(e.target.checked)}
                  className="sl-sr-only"
                />
                <div className={`sl-toggle-switch ${params.ensembleMomentum ? 'on' : 'off'}`}>
                  <div className="sl-toggle-knob" />
                </div>
              </div>
            </label>
          </div>

          {!params.ensembleMomentum && (
            <div className="sl-field sl-mt">
              <LightSlider
                label="Lookback Period"
                value={params.lookback || 12}
                min={1} max={36} step={1}
                onChange={setParam('lookback')}
                displayValue={`${params.lookback || 12} mc`}
              />
            </div>
          )}

          <div className="sl-field sl-mt">
            <LightSlider
              label="Whipsaw Buffer"
              value={params.whipsawBuffer || 0}
              min={0} max={10} step={0.5}
              onChange={setParam('whipsawBuffer')}
              displayValue={`${Number(params.whipsawBuffer || 0).toFixed(1)}%`}
              hint="Nadwyżka zwrotu wymagana do przełączenia stanu"
            />
          </div>
        </section>

        {/* SECTION 3: Ekonomia Portfela */}
        <section className="sl-panel sl-stack">
          <h3 className="sl-title">Ekonomia portfela</h3>
          
          <div className="sl-inner-grid-2">
            <LightInput label="Kapitał startowy (PLN)" value={params.initialCapital} onChange={setParam('initialCapital')} />
            <LightInput label="Miesięczne DCA (PLN)" value={params.monthlyDCA} onChange={setParam('monthlyDCA')} />
          </div>

          <div className="sl-mt">
            <LightSlider
              label="Margin Leverage"
              value={params.leverage || 1.0}
              min={1.0} max={3.0} step={0.1}
              onChange={setParam('leverage')}
              displayValue={`${Number(params.leverage || 1.0).toFixed(1)}×`}
            />
          </div>

          <div className="sl-inner-grid-2 sl-mt">
            <LightSlider 
              label="Opłata brokera" 
              value={params.brokerFee} 
              min={0} max={1} step={0.01} 
              onChange={setParam('brokerFee')} 
              displayValue={`${(params.brokerFee || 0).toFixed(2)}%`} 
            />
            <LightSlider 
              label="Spread FX" 
              value={params.fxSpread} 
              min={0} max={0.5} step={0.01} 
              onChange={setParam('fxSpread')} 
              displayValue={`${(params.fxSpread || 0).toFixed(2)}%`} 
            />
          </div>

          <div className="sl-mt-auto">
            <label className="sl-toggle" htmlFor="ikeActive">
              <div className="sl-toggle-text">
                <span className="sl-toggle-head">IKE / IKZE Shield</span>
                <span className="sl-toggle-sub">19% podatku od zysku zwolnione</span>
              </div>
              <div className="sl-toggle-switch-wrap">
                <input
                  type="checkbox"
                  id="ikeActive"
                  name="ikeActive"
                  checked={params.ikeActive}
                  onChange={e => setParam('ikeActive')(e.target.checked)}
                  className="sl-sr-only"
                />
                <div className={`sl-toggle-switch ${params.ikeActive ? 'on' : 'off'}`}>
                  <div className="sl-toggle-knob" />
                </div>
              </div>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
