// Equity curve + drawdown — pure SVG, no Recharts.
// Y-axis shows real PLN portfolio value. Tooltip on hover, gridlines, year labels, legend.

function EquityCurveChart({ data, density = 'comfortable', showBench = true, showDrawdown = true, benchLabel = 'Benchmark' }) {
  if (!data || data.length === 0) return null;
  const wrapRef = React.useRef(null);
  const [W, setW] = React.useState(900);
  const padL = 76, padR = 24, padT = 24, padB = 28;
  const ddH = showDrawdown ? 120 : 0;
  const H = density === 'compact' ? 320 : 400;
  const equityH = H - ddH - (showDrawdown ? 28 : 0);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((es) => setW(Math.max(560, es[0].contentRect.width)));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // nice scale helpers
  function niceCeil(v, step){ return Math.ceil(v / step) * step; }
  function niceFloor(v, step){ return Math.floor(v / step) * step; }

  function niceStep(max) {
    if (max > 10_000_000) return 2_000_000;
    if (max >  5_000_000) return 1_000_000;
    if (max >  2_000_000) return   500_000;
    if (max >  1_000_000) return   200_000;
    if (max >    500_000) return   100_000;
    if (max >    200_000) return    50_000;
    if (max >    100_000) return    25_000;
    if (max >     50_000) return    10_000;
    return 5_000;
  }

  function fmtPLN(v) {
    if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
    if (v >=     1_000) return `${+(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 0)}k`;
    return String(v);
  }

  function fmtPLNFull(v) {
    return Math.round(v).toLocaleString('pl-PL') + ' PLN';
  }

  const hasInvested = data[0]?.invested != null;
  const hasGross = data[0]?.gross != null;
  const rawMax = Math.max(...data.map(d => Math.max(d.gem, d.msci, hasInvested ? d.invested : 0, hasGross ? d.gross : 0)));
  const rawMin = Math.min(...data.map(d => Math.min(d.gem, d.msci, hasInvested ? d.invested : d.gem)));
  const yStep = niceStep(rawMax);
  const yMax = niceCeil(rawMax * 1.04, yStep);
  const yMin = niceFloor(rawMin * 0.96, yStep);

  const rawDdMin = Math.min(...data.map(d => Math.min(d.gemDd, d.msciDd)));
  const ddStep = Math.abs(rawDdMin) > 30 ? 10 : 5;
  const ddMin = niceFloor(rawDdMin - ddStep * 0.4, ddStep);

  const xRange = data.length - 1;
  const startVal = data[0].gem; // initial capital (same for both since same DCA)

  const xAt = i => padL + (i / xRange) * (W - padL - padR);
  const yAt = v => padT + (1 - (v - yMin) / (yMax - yMin)) * equityH;
  const ddTop = padT + equityH + 28;
  const ddYAt = v => ddTop + (1 - (v - ddMin) / (0 - ddMin)) * ddH;

  const gemPath      = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.gem).toFixed(1)}`).join(' ');
  const benchPath    = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.msci).toFixed(1)}`).join(' ');
  const investedPath = hasInvested ? data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.invested).toFixed(1)}`).join(' ') : null;
  const costArea  = hasGross ? data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.gross).toFixed(1)}`).join(' ') + ' ' + data.slice().reverse().map((d, j) => `L${xAt(data.length - 1 - j).toFixed(1)},${yAt(d.gem).toFixed(1)}`).join(' ') + ' Z' : null;

  const gemDdPath   = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${ddYAt(d.gemDd).toFixed(1)}`).join(' ');
  const benchDdPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${ddYAt(d.msciDd).toFixed(1)}`).join(' ');
  const ddBaseline  = ddYAt(0);
  const gemDdArea   = `${gemDdPath} L${xAt(data.length - 1)},${ddBaseline} L${padL},${ddBaseline} Z`;
  const benchDdArea = `${benchDdPath} L${xAt(data.length - 1)},${ddBaseline} L${padL},${ddBaseline} Z`;

  // dd ticks
  const ddTickVals = [];
  for (let v = -ddStep; v >= ddMin; v -= ddStep) ddTickVals.push(v);

  // year ticks
  const yearTicks = [];
  data.forEach((d, i) => {
    if (d.date.getMonth() === 0 && d.date.getFullYear() % 2 === 0) yearTicks.push({ i, year: d.date.getFullYear() });
  });

  // y ticks (equity)
  const yTickVals = [];
  for (let v = yMin; v <= yMax; v += yStep) yTickVals.push(v);

  // hover
  const [hover, setHover] = React.useState(null);
  function onMove(e){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * W / rect.width;
    const i = Math.round(((x - padL) / (W - padL - padR)) * xRange);
    if (i >= 0 && i < data.length) setHover(i);
  }

  const last = data[data.length - 1];
  const lastBase    = hasInvested ? last.invested : startVal;
  const lastGemPct  = ((last.gem  / lastBase - 1) * 100);
  const lastMsciPct = ((last.msci / lastBase - 1) * 100);

  return (
    <div>
      <header className="flex items-baseline justify-between gap-3 flex-wrap px-5 pt-4 pb-1">
        <div className="k-meta">{data[0]?.label} – {data[data.length - 1]?.label}</div>
        <div className="flex items-center gap-x-4 gap-y-1 text-[13px] flex-wrap text-[var(--ink-dim)]">
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-[2.5px] border-[var(--ink)]"></span>GEM po kosztach</span>
          {hasGross && <span className="flex items-center gap-1.5"><span className="w-4 h-2 bg-[var(--cost)]"></span>koszty i podatek</span>}
          {showBench && <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-[var(--blue)]"></span>{benchLabel}</span>}
          {hasInvested && <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-[var(--ink-faint)]"></span>wpłacone</span>}
        </div>
      </header>

      <div ref={wrapRef} className="relative px-2">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {/* gridlines */}
          {yTickVals.map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--line)" strokeDasharray="2 4" />
              <text x={padL - 8} y={yAt(v) + 3} fill="var(--ink-mute)" fontSize="12" textAnchor="end" className="mono">{fmtPLN(v)}</text>
            </g>
          ))}

          {/* start-value baseline */}
          {yAt(startVal) >= padT && yAt(startVal) <= padT + equityH && (
            <>
              <line x1={padL} x2={W - padR} y1={yAt(startVal)} y2={yAt(startVal)} stroke="var(--line-2)" strokeDasharray="4 3" />
              <text x={padL - 8} y={yAt(startVal) - 3} fill="var(--ink-faint)" fontSize="12" textAnchor="end" className="mono">start</text>
            </>
          )}

          {/* year ticks */}
          {yearTicks.map(({ i, year }) => (
            <g key={year}>
              <line x1={xAt(i)} x2={xAt(i)} y1={padT} y2={padT + equityH} stroke="var(--line)" strokeDasharray="1 6" opacity=".6"/>
              <text x={xAt(i)} y={padT + equityH + 14} fill="var(--ink-mute)" fontSize="12" textAnchor="middle" className="mono">{year}</text>
            </g>
          ))}

          {/* invested line — pod krzywymi portfela */}
          {investedPath && (
            <path d={investedPath} stroke="var(--ink-faint)" strokeWidth="1.2" fill="none" strokeDasharray="4 3" opacity=".7" />
          )}

          {/* koszty i podatek: różnica między wynikiem bez kosztów i podatku a wynikiem GEM */}
          {costArea && <path d={costArea} fill="var(--cost)" fillOpacity="0.8" />}

          {/* bench */}
          {showBench && <path d={benchPath} stroke="var(--blue)" strokeWidth="1.8" fill="none" />}
          {/* gem */}
          <path d={gemPath} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinejoin="round" />

          {/* drawdown panel */}
          {showDrawdown && (
            <>

              {/* panel background */}
              <rect x={padL} y={ddTop} width={W - padL - padR} height={ddH}
                    fill="none" stroke="var(--line)" />

              {/* section divider label */}
              <text x={padL} y={padT + equityH + 18} fill="var(--ink-mute)" fontSize="12" className="mono" >
                Obsunięcie kapitału
              </text>
              <text x={W - padR} y={padT + equityH + 18} textAnchor="end" fill="var(--ink-faint)" fontSize="12" className="mono">
                niżej = gorzej
              </text>

              {/* dd gridlines */}
              {ddTickVals.map(v => (
                <g key={v}>
                  <line x1={padL} x2={W - padR} y1={ddYAt(v)} y2={ddYAt(v)} stroke="var(--line)" strokeDasharray="2 4" opacity=".5"/>
                  <text x={padL - 8} y={ddYAt(v) + 3} fill="var(--ink-mute)" fontSize="12" textAnchor="end" className="mono">{v}%</text>
                </g>
              ))}

              {/* baseline */}
              <line x1={padL} x2={W - padR} y1={ddBaseline} y2={ddBaseline} stroke="var(--line-2)" strokeWidth="1" />
              <text x={padL - 8} y={ddBaseline + 3} fill="var(--ink-dim)" fontSize="12" textAnchor="end" className="mono">0%</text>
              <text x={padL - 8} y={ddYAt(ddMin) + 9} fill="var(--ink-mute)" fontSize="12" textAnchor="end" className="mono">{Math.round(ddMin)}%</text>

              {/* bench area + line (red) */}
              <path d={benchDdArea} fill="var(--blue)" fillOpacity="0.2" />
              <path d={benchDdPath} stroke="var(--blue)" strokeWidth="1.2" fill="none" />

              {/* gem area + line (accent) */}
              <path d={gemDdPath} stroke="var(--ink)" strokeWidth="1.6" fill="none" />

              {/* hover crosshair on dd */}
              {hover != null && (
                <line x1={xAt(hover)} x2={xAt(hover)} y1={ddTop} y2={ddTop + ddH} stroke="var(--ink-faint)" pointerEvents="none"/>
              )}
            </>
          )}

          {/* hover */}
          {hover != null && (
            <g pointerEvents="none">
              <line x1={xAt(hover)} x2={xAt(hover)} y1={padT} y2={padT + equityH} stroke="var(--ink-faint)" />
              <circle cx={xAt(hover)} cy={yAt(data[hover].gem)} r="3" fill="var(--ink)" stroke="var(--bg)" strokeWidth="1.5"/>
              {showBench && <circle cx={xAt(hover)} cy={yAt(data[hover].msci)} r="3" fill="var(--blue)" stroke="var(--bg-1)" strokeWidth="1.5"/>}
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hover != null && (() => {
          const d = data[hover];
          const base    = hasInvested ? d.invested : startVal;
          const gemPct  = ((d.gem  / base - 1) * 100);
          const msciPct = ((d.msci / base - 1) * 100);
          const right = xAt(hover) > W / 2;
          const pos = right ? { right: `${((W - xAt(hover) + 12) / W) * 100}%` } : { left: `${((xAt(hover) + 12) / W) * 100}%` };
          return (
            <div className="absolute pointer-events-none bg-[var(--ink)] text-[var(--bg)] rounded-sm px-3 py-2 mono text-[13px] z-10"
                 style={{ ...pos, top: 12, width: 260 }}>
              <div className="mb-1.5">{d.label}</div>
              {hasGross && (
                <div className="flex justify-between gap-6">
                  <span>Bez kosztów i podatku</span>
                  <span className="tnum">{fmtPLNFull(d.gross)}</span>
                </div>
              )}
              {hasInvested && (
                <div className="flex justify-between gap-6 mb-1 pb-1 border-b border-current/30">
                  <span className="opacity-75">Wpłacone</span>
                  <span className="tnum opacity-75">{fmtPLNFull(d.invested)}</span>
                </div>
              )}
              <div className="flex justify-between gap-6">
                <span>GEM</span>
                <span className="tnum">{fmtPLNFull(d.gem)}
                  <span className="opacity-75 ml-1">({gemPct >= 0 ? '+' : ''}{gemPct.toFixed(1)}%)</span>
                </span>
              </div>
              {showBench && (
                <div className="flex justify-between gap-6">
                  <span className="opacity-75">{benchLabel}</span>
                  <span className="tnum">{fmtPLNFull(d.msci)}
                    <span className="opacity-75 ml-1">({msciPct >= 0 ? '+' : ''}{msciPct.toFixed(1)}%)</span>
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-6 mt-1.5 pt-1.5 border-t border-current/30">
                <span className="opacity-75">DD GEM</span>
                <span className="tnum opacity-75">{d.gemDd.toFixed(1)}%</span>
              </div>
              {showBench && (
                <div className="flex justify-between gap-6">
                  <span className="opacity-75">DD {benchLabel}</span>
                  <span className="tnum opacity-75">{d.msciDd.toFixed(1)}%</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

window.EquityCurveChart = EquityCurveChart;
