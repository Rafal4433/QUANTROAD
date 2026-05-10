// KPIRow with CAGR as hero, 3 supporting cards.

function MiniSpark({ values, color = 'var(--accent)' }){
  const w = 64, h = 18, pad = 1;
  const min = Math.min(...values), max = Math.max(...values);
  const path = values.map((v, i) => {
    const x = pad + (i/(values.length-1)) * (w - pad*2);
    const y = pad + (1 - (v - min)/(max - min || 1)) * (h - pad*2);
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="opacity-90">
      <path d={path} stroke={color} strokeWidth="1.4" fill="none"/>
    </svg>
  );
}

function KpiCard({ label, value, suffix, sub, delta, better, spark }) {
  const deltaCls = better ? 'text-[var(--accent)]' : 'text-[var(--bad)]';
  const valCls   = better ? 'text-[var(--ink)]'    : 'text-[var(--bad)]';
  return (
    <div className="border hairline rounded-xl bg-[var(--bg-1)] px-4 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-5 hover:border-[var(--line-2)] transition">
      <div className="min-w-0">
        <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">{label}</div>
        <div className={`mono text-[11px] tnum ${deltaCls} mt-1`}>{delta}</div>
        <div className="text-[10.5px] text-[var(--ink-faint)] mt-0.5">{sub}</div>
      </div>
      <div className="flex items-baseline gap-1 justify-end">
        <span className={`display text-[40px] tnum ${valCls}`}>{value}</span>
        {suffix && <span className="mono text-[12px] text-[var(--ink-mute)]">{suffix}</span>}
      </div>
      {spark ? <MiniSpark values={spark} color={better ? 'var(--accent)' : 'var(--bad)'} /> : <span className="w-[64px]"></span>}
    </div>
  );
}

function KPIRow({ kpis, finalNet, equityData, benchLabel = 'Benchmark', ikeActive = false }) {
  const equity = equityData || [];
  const cagrSeries  = equity.filter((_, i) => i % 6 === 0).map(d => d.gem);
  const ddSeries    = equity.filter((_, i) => i % 6 === 0).map(d => d.gemDd);
  const benchSeries = equity.filter((_, i) => i % 6 === 0).map(d => d.msci);

  // period badge from actual data length
  const years = equity.length > 0 ? Math.round(equity.length / 12) : null;
  const periodLabel = years ? `${years}-letnia` : '—';

  // CAGR
  const cagrDiff   = kpis.cagr.gem - kpis.cagr.bench;
  const cagrBetter = cagrDiff >= 0;
  const cagrDeltaTxt = cagrBetter
    ? `+${cagrDiff.toFixed(1)} pp vs ${benchLabel}`
    : `${cagrDiff.toFixed(1)} pp vs ${benchLabel}`;

  // MaxDD (higher = less negative = better for GEM)
  const ddDiff   = kpis.maxDd.gem - kpis.maxDd.bench;
  const ddBetter = ddDiff >= 0;
  const ddDeltaTxt = ddBetter
    ? `+${ddDiff.toFixed(1)} pp lepiej niż bench`
    : `${ddDiff.toFixed(1)} pp gorzej niż bench`;

  // Sharpe (higher = better)
  const sharpeDiff   = kpis.sharpe.gem - kpis.sharpe.bench;
  const sharpeBetter = sharpeDiff >= 0;
  const sharpeDeltaTxt = `${sharpeDiff >= 0 ? '+' : ''}${sharpeDiff.toFixed(2)} vs bench`;

  // Ulcer/UPI (lower = better; bench - gem > 0 means GEM is better)
  const ulcerDiff   = kpis.ulcer.bench - kpis.ulcer.gem;
  const ulcerBetter = ulcerDiff >= 0;
  const ulcerDeltaTxt = ulcerBetter
    ? `−${ulcerDiff.toFixed(1)} vs bench`
    : `+${Math.abs(ulcerDiff).toFixed(1)} vs bench`;

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* HERO — CAGR */}
      <div className="col-span-12 lg:col-span-6 border hairline rounded-xl bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-60 pointer-events-none"></div>
        <div className="relative p-5 flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></span>
              CAGR · roczna stopa zwrotu
            </div>
            {years && <div className="badge badge-buy">{periodLabel}</div>}
          </div>

          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex items-baseline gap-1">
              <span className={`display text-[88px] md:text-[104px] tnum ${cagrBetter ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                {kpis.cagr.gem.toFixed(1)}
              </span>
              <span className={`display text-[44px] tnum ${cagrBetter ? 'text-[var(--accent)]' : 'text-[var(--bad)]'}`}>%</span>
            </div>

            <div className="flex flex-col gap-2 pb-3">
              <span className={`mono text-[12px] tnum ${cagrBetter ? 'text-[var(--accent)]' : 'text-[var(--bad)]'}`}>
                {cagrDeltaTxt}
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mono text-[11px]">
                <span className="text-[var(--ink-mute)]">{benchLabel}</span>
                <span className="tnum text-[var(--ink-dim)]">{kpis.cagr.bench.toFixed(1)}%</span>
                <span className="text-[var(--ink-mute)]">Wartość netto</span>
                <span className="tnum text-[var(--ink-dim)]">{finalNet >= 1_000_000
                  ? `${(finalNet/1_000_000).toFixed(2)}M PLN`
                  : `${(finalNet/1_000).toFixed(0)}k PLN`}
                </span>
                {ikeActive && (
                  <>
                    <span className="text-[var(--ink-mute)]">Podatek IKE</span>
                    <span className="tnum text-[var(--accent)]">0 PLN</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* dual sparkline */}
          <div className="mt-auto pt-3 border-t hairline flex items-center gap-4">
            <span className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">trend equity</span>
            <div className="flex-1 relative h-[40px]">
              <DualSpark gem={cagrSeries} bench={benchSeries}/>
            </div>
          </div>
        </div>
      </div>

      {/* secondary kpis */}
      <div className="col-span-12 lg:col-span-6 grid grid-cols-1 gap-3">
        <KpiCard
          label="Maks. obsunięcie"
          value={kpis.maxDd.gem.toFixed(1)}
          suffix="%"
          better={ddBetter}
          delta={ddDeltaTxt}
          sub={`bench ${kpis.maxDd.bench.toFixed(1)}%`}
          spark={ddSeries}
        />
        <KpiCard
          label="Sharpe"
          value={kpis.sharpe.gem.toFixed(2)}
          better={sharpeBetter}
          delta={sharpeDeltaTxt}
          sub={`bench ${kpis.sharpe.bench.toFixed(2)}`}
          spark={cagrSeries.slice(8)}
        />
        <KpiCard
          label="Ulcer (UPI)"
          value={kpis.ulcer.gem.toFixed(1)}
          better={ulcerBetter}
          delta={ulcerDeltaTxt}
          sub={`bench ${kpis.ulcer.bench.toFixed(1)}`}
          spark={ddSeries.map(v => -v)}
        />
      </div>
    </div>
  );
}

function DualSpark({ gem, bench }){
  const w = 600, h = 40;
  const allMin = Math.min(...gem, ...bench);
  const allMax = Math.max(...gem, ...bench);
  const sx = i => (i/(gem.length-1))*w;
  const sy = v => (1 - (v - allMin)/(allMax - allMin)) * h;
  const gP = gem.map((v,i)=>`${i?'L':'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const bP = bench.map((v,i)=>`${i?'L':'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <path d={bP} stroke="var(--blue)" strokeWidth="1.2" fill="none" opacity=".55" vectorEffect="non-scaling-stroke"/>
      <path d={gP} stroke="var(--accent)" strokeWidth="1.4" fill="none" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

window.KPIRow = KPIRow;
