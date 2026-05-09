// Equity curve + drawdown — pure SVG, no Recharts.
// Tooltip on hover, gridlines, year labels, legend.

function EquityCurveChart({ data, density = 'comfortable', showBench = true, showDrawdown = true, benchLabel = 'Benchmark' }) {
  if (!data || data.length === 0) return null;
  const wrapRef = React.useRef(null);
  const [W, setW] = React.useState(900);
  const padL = 56, padR = 24, padT = 24, padB = 28;
  const ddH = showDrawdown ? 120 : 0;
  const H = density === 'compact' ? 320 : 400;
  const equityH = H - ddH - (showDrawdown ? 28 : 0);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((es) => setW(Math.max(640, es[0].contentRect.width)));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // domain — nice rounded scales
  function niceCeil(v, step){ return Math.ceil(v / step) * step; }
  function niceFloor(v, step){ return Math.floor(v / step) * step; }

  const rawMax = Math.max(...data.map(d => Math.max(d.gem, d.msci)));
  const rawMin = Math.min(...data.map(d => Math.min(d.gem, d.msci)));
  const yStep = rawMax > 800 ? 200 : rawMax > 400 ? 100 : 50;
  const yMax = niceCeil(rawMax * 1.04, yStep);
  const yMin = Math.max(0, niceFloor(Math.min(100, rawMin) - yStep * 0.1, yStep));

  const rawDdMin = Math.min(...data.map(d => Math.min(d.gemDd, d.msciDd)));
  const ddStep = Math.abs(rawDdMin) > 30 ? 10 : 5;
  const ddMin = niceFloor(rawDdMin - ddStep * 0.4, ddStep);

  const xRange = data.length - 1;

  const xAt = i => padL + (i / xRange) * (W - padL - padR);
  const yAt = v => padT + (1 - (v - yMin) / (yMax - yMin)) * equityH;
  const ddTop = padT + equityH + 28;
  const ddYAt = v => ddTop + (1 - (v - ddMin) / (0 - ddMin)) * ddH;

  const gemPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.gem).toFixed(1)}`).join(' ');
  const benchPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.msci).toFixed(1)}`).join(' ');
  const gemArea = `${gemPath} L${xAt(data.length - 1)},${padT + equityH} L${padL},${padT + equityH} Z`;

  const gemDdPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${ddYAt(d.gemDd).toFixed(1)}`).join(' ');
  const benchDdPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${ddYAt(d.msciDd).toFixed(1)}`).join(' ');
  const ddBaseline = ddYAt(0);
  const gemDdArea = `${gemDdPath} L${xAt(data.length - 1)},${ddBaseline} L${padL},${ddBaseline} Z`;
  const benchDdArea = `${benchDdPath} L${xAt(data.length - 1)},${ddBaseline} L${padL},${ddBaseline} Z`;

  // dd ticks
  const ddTickVals = [];
  for (let v = -ddStep; v >= ddMin; v -= ddStep) ddTickVals.push(v);

  const worstGemDd = Math.min(...data.map(d => d.gemDd));
  const worstBenchDd = Math.min(...data.map(d => d.msciDd));
  const worstGemIdx = data.findIndex(d => d.gemDd === worstGemDd);
  const worstBenchIdx = data.findIndex(d => d.msciDd === worstBenchDd);

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
    const x = e.clientX - rect.left;
    const i = Math.round(((x - padL) / (W - padL - padR)) * xRange);
    if (i >= 0 && i < data.length) setHover(i);
  }

  const last = data[data.length - 1];
  const lastGem = ((last.gem / 100 - 1) * 100);
  const lastMsci = ((last.msci / 100 - 1) * 100);

  return (
    <div className="border hairline rounded-xl bg-[var(--bg-1)] overflow-hidden">
      <header className="flex items-end justify-between px-5 pt-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-[.12em] text-[var(--ink-mute)]">
            <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            backtest · {data[0]?.label} → {data[data.length - 1]?.label}
          </div>
          <h2 className="text-[15px] font-medium mt-1.5 text-[var(--ink)]">Krzywa kapitału</h2>
        </div>
        <div className="flex items-center gap-5 text-[12px] mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-[var(--accent)]"></span>
            <span className="text-[var(--ink-dim)]">GEM</span>
            <span className="text-[var(--accent)] tnum">+{lastGem.toFixed(1)}%</span>
          </div>
          {showBench && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-0.5 bg-[var(--blue)] opacity-80"></span>
              <span className="text-[var(--ink-dim)]">{benchLabel}</span>
              <span className="text-[var(--blue)] tnum">+{lastMsci.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </header>

      <div ref={wrapRef} className="relative px-2">
        <svg width={W} height={H} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {/* gridlines */}
          {yTickVals.map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--line)" strokeDasharray="2 4" />
              <text x={padL - 8} y={yAt(v) + 3} fill="var(--ink-mute)" fontSize="10" textAnchor="end" className="mono">{v}</text>
            </g>
          ))}
          {/* baseline */}
          <line x1={padL} x2={W - padR} y1={yAt(100)} y2={yAt(100)} stroke="var(--line-2)" />

          {/* year ticks */}
          {yearTicks.map(({ i, year }) => (
            <g key={year}>
              <line x1={xAt(i)} x2={xAt(i)} y1={padT} y2={padT + equityH} stroke="var(--line)" strokeDasharray="1 6" opacity=".6"/>
              <text x={xAt(i)} y={padT + equityH + 14} fill="var(--ink-mute)" fontSize="10" textAnchor="middle" className="mono">{year}</text>
            </g>
          ))}

          {/* gem area */}
          <defs>
            <linearGradient id="gemFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={gemArea} fill="url(#gemFill)" />

          {/* bench */}
          {showBench && <path d={benchPath} stroke="var(--blue)" strokeWidth="1.4" fill="none" opacity=".75" />}
          {/* gem */}
          <path d={gemPath} stroke="var(--accent)" strokeWidth="1.8" fill="none" />

          {/* drawdown panel */}
          {showDrawdown && (
            <>
              <defs>
                <linearGradient id="ddGemFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.28"/>
                </linearGradient>
                <linearGradient id="ddBenchFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bad)" stopOpacity="0"/>
                  <stop offset="100%" stopColor="var(--bad)" stopOpacity="0.32"/>
                </linearGradient>
              </defs>

              {/* panel background */}
              <rect x={padL} y={ddTop} width={W - padL - padR} height={ddH}
                    fill="rgba(255,255,255,0.015)" stroke="var(--line)" />

              {/* section divider label */}
              <text x={padL} y={padT + equityH + 18} fill="var(--ink-mute)" fontSize="10" className="mono" letterSpacing="2">
                DRAWDOWN · obsunięcie kapitału
              </text>
              <text x={W - padR} y={padT + equityH + 18} textAnchor="end" fill="var(--ink-faint)" fontSize="10" className="mono">
                niżej = gorzej
              </text>

              {/* dd gridlines */}
              {ddTickVals.map(v => (
                <g key={v}>
                  <line x1={padL} x2={W - padR} y1={ddYAt(v)} y2={ddYAt(v)} stroke="var(--line)" strokeDasharray="2 4" opacity=".5"/>
                  <text x={padL - 8} y={ddYAt(v) + 3} fill="var(--ink-mute)" fontSize="10" textAnchor="end" className="mono">{v}%</text>
                </g>
              ))}

              {/* baseline */}
              <line x1={padL} x2={W - padR} y1={ddBaseline} y2={ddBaseline} stroke="var(--line-2)" strokeWidth="1" />
              <text x={padL - 8} y={ddBaseline + 3} fill="var(--ink-dim)" fontSize="10" textAnchor="end" className="mono">0%</text>
              <text x={padL - 8} y={ddYAt(ddMin) + 9} fill="var(--ink-mute)" fontSize="10" textAnchor="end" className="mono">{Math.round(ddMin)}%</text>

              {/* bench area + line (red) */}
              <path d={benchDdArea} fill="url(#ddBenchFill)" />
              <path d={benchDdPath} stroke="var(--bad)" strokeWidth="1.4" fill="none" opacity=".85" />

              {/* gem area + line (accent) */}
              <path d={gemDdArea} fill="url(#ddGemFill)" />
              <path d={gemDdPath} stroke="var(--accent)" strokeWidth="1.8" fill="none" />

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
              <circle cx={xAt(hover)} cy={yAt(data[hover].gem)} r="3" fill="var(--accent)" stroke="var(--bg-1)" strokeWidth="1.5"/>
              {showBench && <circle cx={xAt(hover)} cy={yAt(data[hover].msci)} r="3" fill="var(--blue)" stroke="var(--bg-1)" strokeWidth="1.5"/>}
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hover != null && (() => {
          const d = data[hover];
          const tx = Math.min(W - 200, Math.max(8, xAt(hover) + 12));
          return (
            <div className="absolute pointer-events-none bg-[var(--bg-2)] border hairline-2 rounded-md px-3 py-2 mono text-[11px] shadow-lg"
                 style={{ left: tx, top: 12 }}>
              <div className="text-[var(--ink-mute)] uppercase tracking-wider mb-1">{d.label}</div>
              <div className="flex justify-between gap-6"><span className="text-[var(--accent)]">GEM</span><span className="tnum">{d.gem.toFixed(1)}</span></div>
              {showBench && <div className="flex justify-between gap-6"><span className="text-[var(--blue)]">MSCI</span><span className="tnum">{d.msci.toFixed(1)}</span></div>}
              <div className="flex justify-between gap-6 mt-1 pt-1 border-t hairline">
                <span className="text-[var(--ink-mute)]">DD GEM</span><span className="tnum text-[var(--bad)]">{d.gemDd.toFixed(1)}%</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

window.EquityCurveChart = EquityCurveChart;
