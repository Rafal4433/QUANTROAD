import React from 'react';
import { Info } from 'lucide-react';

const ASSET_UNIVERSE = [
  // ─ Equities ───────────────────────────────────────────
  { id: 'usa',  ticker: 'VTSMX',   name: 'US Total Stock',       type: 'USA' },
  { id: 'nq',   ticker: 'QQQ',     name: 'Nasdaq 100',           type: 'USA' },
  { id: 'exus', ticker: 'VGTSX',   name: 'Global Ex-US',         type: 'Ex-US' },
  { id: 'em',   ticker: 'VEIEX',   name: 'Emerging Markets',     type: 'Ex-US' },
  { id: 'epol', ticker: 'EPOL',    name: 'Poland (EPOL)',        type: 'Ex-US' },
  { id: 'gld',  ticker: 'GLD',     name: 'Gold',                 type: 'Cmdty' },
  { id: 'btc',  ticker: 'BTC-USD', name: 'Bitcoin',              type: 'Crypto' },
  // ─ Bonds / Safe Assets ───────────────────────────────
  { id: 'shy',   ticker: 'SHY',   name: '1-3yr Treasury',        type: 'Safe' },
  { id: 'bonds', ticker: 'VBMFX', name: 'Agg Bond Market',       type: 'Safe' },
  { id: 'tlt',   ticker: 'TLT',   name: '20yr+ Treasury',        type: 'Safe' },
];

const BENCHMARK_OPTIONS = [
  { id: 'MSCI', label: 'MSCI World (60/40)' },
  { id: 'SP500', label: 'S&P 500 (100% US)' }
];

const TYPE_COLORS = {
  USA:    'var(--accent-primary)',
  'Ex-US':'var(--accent-blue)',
  Cmdty:  '#FFD700',
  Safe:   'var(--accent-warn)',
  Crypto: '#f7931a'
};

const TYPE_ICONS = {
  USA:    '🇺🇸',
  'Ex-US':'🌍',
  Safe:   '🛡️',
  Crypto: '₿',
};

function SliderControl({ label, value, min, max, step, onChange, displayValue, hint }) {
  return (
    <div className="slider-wrapper">
      <div className="slider-header">
        <span className="slider-title">{label}</span>
        <span className="slider-value">{displayValue || value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      {hint && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{hint}</div>
      )}
    </div>
  );
}

function Toggle({ label, sublabel, value, onChange }) {
  return (
    <div className={`toggle-row ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
      <div>
        <div className="toggle-label">{label}</div>
        {sublabel && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {sublabel}
          </div>
        )}
      </div>
      <div className={`toggle-switch ${value ? 'on' : ''}`} />
    </div>
  );
}

function NumInput({ label, value, onChange, prefix, suffix }) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
          }}>{prefix}</span>
        )}
        <input
          type="number"
          className="num-input"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ paddingLeft: prefix ? '28px' : '12px', paddingRight: suffix ? '32px' : '12px' }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <select
        className="num-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingLeft: '12px', paddingRight: '12px', appearance: 'auto', color: 'var(--text-primary)', cursor: 'pointer' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const YEARS = Array.from({length: 24}, (_, i) => {
  const y = 2000 + i;
  return { label: `${y}`, value: `${y}-01-01` };
});

export function Sidebar({ params, setParams, sidebarOpen }) {
  const setParam = (key) => (value) => setParams(p => ({ ...p, [key]: value }));

  const toggleAsset = (id, isSafe) => {
    if (isSafe) {
      // Safe assets: only one can be active at a time (becomes the safe asset)
      // If clicking the current safeAsset, switch to dynamic mode
      if (params.safeAsset === id) {
        setParams(p => ({ ...p, safeAsset: 'dynamic' }));
      } else {
        setParams(p => ({ ...p, safeAsset: id }));
      }
    } else {
      // Risk assets: toggle in/out of riskAssets array
      setParams(p => {
        const current = new Set(p.riskAssets);
        if (current.has(id)) current.delete(id);
        else current.add(id);
        if (current.size === 0) current.add(id);
        return { ...p, riskAssets: Array.from(current) };
      });
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* ── Asset Universe ──────────────────────────────── */}
      <div>
        <div className="section-label">GEM Universe</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Risk assets compete · Safe asset shelters capital
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {ASSET_UNIVERSE.map(a => {
            const isSafe = a.type === 'Safe';
            const isSelected = isSafe
              ? params.safeAsset === a.id || (params.safeAsset === 'dynamic' && ['shy','bonds','tlt'].includes(a.id))
              : params.riskAssets.includes(a.id);
            const isSafeActive = isSafe && params.safeAsset === a.id;
            const isDynamic    = isSafe && params.safeAsset === 'dynamic';
            const borderColor  = isSafeActive
              ? TYPE_COLORS[a.type]
              : isDynamic && isSafe
                ? `${TYPE_COLORS[a.type]}88`
                : isSelected ? TYPE_COLORS[a.type] : 'transparent';

            return (
              <div
                className="asset-card"
                key={a.ticker}
                onClick={() => toggleAsset(a.id, isSafe)}
                style={{ cursor: 'pointer', border: `2px solid ${borderColor}` }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      background: `${TYPE_COLORS[a.type]}18`,
                      border: `1px solid ${TYPE_COLORS[a.type]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
                      color: TYPE_COLORS[a.type], flexShrink: 0,
                    }}
                  >
                    {TYPE_ICONS[a.type] ?? '📊'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="asset-ticker">{a.ticker}</div>
                    <div className="asset-name">{a.name}</div>
                  </div>
                </div>
                <div>
                  {isSafe ? (
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      color: isSafeActive ? TYPE_COLORS[a.type] : isDynamic ? `${TYPE_COLORS[a.type]}88` : 'var(--text-muted)',
                      textAlign: 'right', lineHeight: 1.3,
                    }}>
                      {isSafeActive ? 'SAFE' : isDynamic ? 'DYN' : 'SET'}
                    </div>
                  ) : (
                    <div className={`toggle-switch ${isSelected ? 'on' : ''}`} style={{ transform: 'scale(0.8)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Dynamic mode notice */}
        {params.safeAsset === 'dynamic' && (
          <div style={{
            marginTop: '8px', padding: '6px 8px',
            background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.2)',
            borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--accent-warn)',
          }}>
            🔄 Dynamic: best momentum bond selected each month
          </div>
        )}
      </div>

      <div className="divider" />


      {/* ── Benchmark ────────────────────────────────────── */}
      <div>
        <div className="section-label">Benchmark Setup</div>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          {BENCHMARK_OPTIONS.map(b => (
            <button
              key={b.id}
              className={`tab-btn ${params.benchmark === b.id ? 'active' : ''}`}
              onClick={() => setParam('benchmark')(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── Momentum Settings ────────────────────────────── */}
      <div>
        <div className="section-label">Momentum Configuration</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SliderControl
            label="Lookback Period"
            value={params.lookback || 12}
            min={1}
            max={36}
            step={1}
            onChange={setParam('lookback')}
            displayValue={`${params.lookback || 12} mo`}
            hint="Months to look back for momentum"
          />
          <SliderControl
            label="Whipsaw Buffer (Hysteresis)"
            value={params.whipsawBuffer || 0}
            min={0}
            max={10}
            step={0.5}
            onChange={setParam('whipsawBuffer')}
            displayValue={`${Number(params.whipsawBuffer || 0).toFixed(1)}%`}
            hint="Min. % difference required to switch assets"
          />
        </div>
      </div>

      <div className="divider" />

      {/* ── DCA & Leverage Settings ──────────────────────── */}
      <div>
        <div className="section-label">DCA & Leverage Parameters</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SliderControl
            label="Margin Leverage"
            value={params.leverage || 1.0}
            min={1.0}
            max={3.0}
            step={0.1}
            onChange={setParam('leverage')}
            displayValue={`${Number(params.leverage || 1.0).toFixed(1)}x`}
            hint="Portfolio leverage (4% borrow cost)"
          />
          <NumInput
            label="Initial Capital"
            value={params.initialCapital}
            onChange={setParam('initialCapital')}
            prefix="zł"
            suffix="PLN"
          />
          <NumInput
            label="Monthly DCA"
            value={params.monthlyDCA}
            onChange={setParam('monthlyDCA')}
            prefix="+"
            suffix="PLN"
          />
        </div>
      </div>

      <div className="divider" />

      {/* ── Transaction Costs ─────────────────────────────── */}
      <div>
        <div className="section-label">Transaction Costs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SliderControl
            label="Broker Fee"
            value={params.brokerFee}
            min={0}
            max={1}
            step={0.01}
            onChange={setParam('brokerFee')}
            displayValue={`${params.brokerFee.toFixed(2)}%`}
          />
          <SliderControl
            label="FX Spread"
            value={params.fxSpread}
            min={0}
            max={0.5}
            step={0.01}
            onChange={setParam('fxSpread')}
            displayValue={`${params.fxSpread.toFixed(2)}%`}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            padding: '6px 8px', background: 'var(--bg-base)',
            borderRadius: '6px', border: '1px solid var(--border)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Total per trade</span>
            <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>
              {(params.brokerFee + params.fxSpread).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── Tax Shield ────────────────────────────────────── */}
      <div>
        <div className="section-label">Tax Shield</div>
        <Toggle
          label="Konto IKE / IKZE"
          sublabel={params.ikeActive ? '✓ 19% Belka tax waived' : 'Belka 19% CGT applies'}
          value={params.ikeActive}
          onChange={setParam('ikeActive')}
        />
        {params.ikeActive && (
          <div style={{
            marginTop: '8px', padding: '8px 12px',
            background: 'rgba(0,229,160,0.05)',
            border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-primary)', lineHeight: 1.5
            }}>
              IKE limit: 23,472 PLN/yr<br />
              IKZE limit: 9,388 PLN/yr<br />
              Tax-deferred compounding active
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)',
          lineHeight: 1.6, textAlign: 'center', borderTop: '1px solid var(--border)',
          paddingTop: '12px',
        }}>
          Educational simulation only.<br />
          Not financial advice. Past results ≠ future returns.<br />
          Data sourced from Yahoo Finance
        </div>
      </div>
    </aside>
  );
}
