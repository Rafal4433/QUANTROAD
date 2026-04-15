import React from 'react';

const PLN = (v) => v != null ? `${v.toLocaleString('pl-PL')} PLN` : '—';
const PCT = (v) => v != null ? `${v > 0 ? '+' : ''}${v}%` : '—';

function MetaStat({ label, value, accent }) {
  return (
    <div style={{
      padding: '8px 12px',
      background: 'var(--bg-base)',
      border: `1px solid ${accent ? 'rgba(0,229,160,0.25)' : 'var(--border)'}`,
      borderRadius: '6px',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: accent ? '#5ef0b0' : 'rgba(255,255,255,0.9)' }}>
        {value}
      </div>
    </div>
  );
}

function CostSection({ title, color, rows }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: color, marginBottom: '8px',
      }}>
        {title}
      </div>
      {rows.map(({ label, pln, secondary, highlight, isReturn }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          padding: '5px 0',
          borderBottom: highlight ? 'none' : '1px solid rgba(255,255,255,0.06)',
          borderTop: highlight ? '1px solid rgba(255,255,255,0.12)' : 'none',
          marginTop: highlight ? '6px' : 0,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: highlight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
            {label}
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: highlight ? '13px' : '12px',
              fontWeight: highlight || isReturn ? 700 : 400,
              color: isReturn ? '#5ef0b0' : highlight ? '#ffffff' : 'rgba(255,255,255,0.75)',
            }}>
              {pln}
            </div>
            {secondary && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                {secondary}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CostBreakdown({ costs, metadata, liquidation, benchmark }) {
  if (!costs || !liquidation) return null;

  const benchLabel = benchmark === 'SP500' ? 'S&P 500' : 'MSCI World';
  const totalDeployed = metadata?.totalCapitalDeployed ?? 0;

  const gemRows = [
    { label: 'Opłaty brokera i spread', pln: `-${PLN(costs.brokerFeePLN + costs.fxSpreadPLN)}`, secondary: `Koszt` },
    { label: 'Zapłacony podatek',        pln: `-${PLN(costs.taxPaidPLN)}`, secondary: `Już zapłacony` },
    { label: 'Wartość końcowa (brutto)', pln: PLN(liquidation.gemFinalGross), secondary: `Niezrealizowane` },
    { label: 'Podatek likwidacyjny',     pln: `-${PLN(liquidation.gemPendingTax)}`, secondary: `Do zapłaty (19%)` },
    { label: 'Łączna wartość (netto)',   pln: PLN(liquidation.gemFinalNet), highlight: true },
    { label: 'Zwrot (brutto)',           pln: PCT(liquidation.gemReturnGross), isReturn: true },
    { label: 'Zwrot (netto)',            pln: PCT(liquidation.gemReturnNet), isReturn: true },
  ];

  const benchRows = [
    { label: 'Opłaty brokera i spread', pln: `-${PLN(costs.bBrokerFeePLN + costs.bFxSpreadPLN)}`, secondary: `Koszt` },
    { label: 'Zapłacony podatek',        pln: '-0 PLN', secondary: `Kup i trzymaj` },
    { label: 'Wartość końcowa (brutto)', pln: PLN(liquidation.benchFinalGross), secondary: `Niezrealizowane` },
    { label: 'Podatek likwidacyjny',     pln: `-${PLN(liquidation.benchPendingTax)}`, secondary: `Do zapłaty (19%)` },
    { label: 'Łączna wartość (netto)',   pln: PLN(liquidation.benchFinalNet), highlight: true },
    { label: 'Zwrot (brutto)',           pln: PCT(liquidation.benchReturnGross), isReturn: true },
    { label: 'Zwrot (netto)',            pln: PCT(liquidation.benchReturnNet), isReturn: true },
  ];

  return (
    <div className="chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header">
        <div className="chart-title">Podsumowanie wyników przy wyjściu</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
          Szczegółowe wartości przy pełnej likwidacji portfela
        </div>
      </div>

      {/* Summary stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
        <MetaStat label="Zainwestowany kapitał" value={`${Math.round(totalDeployed / 1000)}K PLN`} />
        <MetaStat label="Wartość GEM netto"      value={`${Math.round(liquidation.gemFinalNet / 1000)}K PLN`} accent />
      </div>

      {/* Two-column cost detail */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
        <CostSection title="Strategia GEM" color="var(--accent-warn)" rows={gemRows} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <CostSection title={benchLabel} color="var(--accent-blue)" rows={benchRows} />
      </div>
    </div>
  );
}
