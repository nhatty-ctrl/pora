import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

type Screen = 'disc' | 'earn' | 'prof' | 'pers' | 'camp' | 'join' | 'new' | 'wd' | 'dev';
type CampaignTab = 'd' | 'j' | 'c';
type PersonalTab = 'c' | 'r' | 'p' | 'i' | 's';
type PersonalSettingsTab = 'd' | 'v' | 'b';
type DevTab = 'asc' | 'sdk';

interface Card {
  id: number;
  b: string;
  l: string;
  e: string;
}

const CATEGORIES = [
  'All Categories',
  'Productivity',
  'Photo and video',
  'Finance',
  'Social',
  'Games',
  'Health',
  'Education',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REGIONAL_PAYMENTS = [
  'Alipay',
  'Bancontact',
  'FPX',
  'iDEAL',
  'Konbini',
  'PayNow',
  'Pix',
  'Przelewy24',
  'Swish',
  'TWINT',
  'UPI',
  'WeChat Pay',
  'Zip',
];

const NOTIFICATIONS = [
  {
    title: 'Palazzo Lens',
    time: '4d',
    text: 'You’re approved to promote this campaign',
    quote: '',
    bg: '#e4d8ff',
    icon: 'ti-aperture',
  },
  {
    title: 'Tidal',
    time: 'Oct 20',
    text: 'sent an announcement for Tidal: Reward update',
    quote:
      'Thank you for sharing your links. The revenue share goes up this week, and we’ve had an incredible response from creators so far.',
    bg: '#cfe8dc',
    icon: 'ti-wave-sine',
  },
  {
    title: 'Palazzo Lens',
    time: 'Oct 18',
    text: 'Your first subscriber paid',
    quote: 'That’s $5.00 earned. It will be payable after the 30-day refund hold.',
    bg: '#e4d8ff',
    icon: 'ti-aperture',
  },
  {
    title: 'umi',
    time: 'Oct 15',
    text: 'Your payout of $48.50 was sent',
    quote: 'It should reach your account within 2 to 3 business days.',
    bg: '#fff',
    icon: '',
  },
  {
    title: 'Pocket Ledger',
    time: 'Oct 12',
    text: 'paused this campaign',
    quote: 'Subscriptions from today won’t earn a share until the founder resumes it.',
    bg: '#ffe1c8',
    icon: 'ti-notebook',
  },
];

const SDK_STEPS = [
  {
    title: 'Install the SDK',
    code: '<span class="c2">// Swift Package Manager (placeholder URL)</span>\n<span class="g2">https://github.com/umi/umi-ios</span>',
  },
  {
    title: 'Configure it at launch',
    code: '<span class="k">Umi</span>.configure(appKey: <span class="g2">"umi_app_pl_8f2kQ4mT9x"</span>)',
  },
  {
    title: 'Resolve the referral',
    code: '<span class="k">Umi</span>.resolveReferral()\n<span class="c2">// If nothing arrives, let people type a creator code:</span>\n<span class="k">Umi</span>.claimCreatorCode(code)',
  },
  {
    title: 'Bind and report purchases',
    code: '<span class="k">Umi</span>.bind(appAccountToken: token)\n<span class="c2">// after a purchase</span>\n<span class="k">Umi</span>.reportTransaction(transaction.id)',
  },
];

function generatePoints(seed: number, base: number, count = 28): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(
      base *
        (0.62 +
          0.26 * Math.sin(i / 3.4 + seed) +
          0.12 * Math.sin(i / 1.4 + seed * 2) +
          i * 0.007)
    );
  }
  return arr;
}

function formatVal(v: number, prefix: string): string {
  const r =
    v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v < 10 ? v.toFixed(1) : Math.round(v).toString();
  return prefix + r;
}

function formatMoney(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function renderQrSvg(seed: number, size: number) {
  const N = 29;
  let sd = seed;
  const rnd = () => {
    sd = (sd * 9301 + 49297) % 233280;
    return sd / 233280;
  };
  const m: boolean[][] = [];
  for (let y = 0; y < N; y++) {
    m[y] = [];
    for (let x = 0; x < N; x++) {
      m[y][x] = rnd() > 0.52;
    }
  }
  const fp = (ox: number, oy: number) => {
    for (let y = -1; y < 8; y++) {
      for (let x = -1; x < 8; x++) {
        const X = ox + x;
        const Y = oy + y;
        if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
        m[Y][X] =
          x >= 0 &&
          x < 7 &&
          y >= 0 &&
          y < 7 &&
          (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
      }
    }
  };
  fp(0, 0);
  fp(N - 7, 0);
  fp(0, N - 7);

  const rects: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (m[y][x]) rects.push({ x, y });
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 29 29" shapeRendering="crispEdges">
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1} height={1} fill="#0a0a0a" />
      ))}
    </svg>
  );
}

interface ChartConfig {
  vw: number;
  vh: number;
  dts: string[];
  empty: boolean;
  em?: string;
  order: string[];
  defs: Record<string, { n: string; d: number[]; p: string }>;
}

interface BreadcrumbItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {idx > 0 && <i className="ti ti-chevron-right bc-sep" />}
            {item.onClick && !isLast ? (
              <button
                type="button"
                className="bc-link"
                onClick={item.onClick}
              >
                {item.icon && <i className={`ti ${item.icon}`} style={{ fontSize: 15 }} />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span className={isLast ? 'bc-current' : 'bc-link'} style={!isLast ? { cursor: 'default' } : undefined}>
                {item.icon && (
                  <i
                    className={`ti ${item.icon}`}
                    style={{ fontSize: 15, color: isLast ? '#C9B8FF' : '#8d8d92' }}
                  />
                )}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface AccentTooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
  maxWidth?: number;
  align?: 'center' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

function AccentTooltip({
  text,
  children,
  placement = 'top',
  maxWidth = 240,
  align = 'center',
  className,
  style,
}: AccentTooltipProps) {
  const [show, setShow] = useState(false);
  const isTop = placement === 'top';

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...(isTop
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            ...(align === 'center'
              ? { left: '50%', transform: 'translateX(-50%)' }
              : align === 'left'
              ? { left: 0 }
              : { right: 0 }),
            background: '#C9B8FF',
            color: '#0a0a0a',
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: '17px',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(201, 184, 255, 0.35)',
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth,
            zIndex: 60,
            pointerEvents: 'none',
            textAlign: align === 'center' ? 'center' : 'left',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              ...(isTop
                ? {
                    top: '100%',
                    borderColor: '#C9B8FF transparent transparent transparent',
                  }
                : {
                    bottom: '100%',
                    borderColor: 'transparent transparent #C9B8FF transparent',
                  }),
              ...(align === 'center'
                ? { left: '50%', transform: 'translateX(-50%)' }
                : align === 'left'
                ? { left: 14 }
                : { right: 14 }),
              borderWidth: 5,
              borderStyle: 'solid',
            }}
          />
        </div>
      )}
    </div>
  );
}

function SvgChart({
  title,
  config,
  currentKey,
  onSelectKey,
}: {
  title?: string;
  config: ChartConfig;
  currentKey: string;
  onSelectKey: (k: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(config.vw || 600);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isNarrow = containerWidth < 600;
  const vw = Math.max(containerWidth, 260);
  const vh = isNarrow ? 190 : 240;

  const { dts, empty, em, order, defs } = config;
  const def = defs[currentKey] || defs[order[0]];
  const data = def.d;
  const n = data.length;

  const X0 = 24;
  const W = Math.max(vw - 84, 100);
  const Y0 = 16;
  const H = vh - 60;

  const mx = useMemo(() => {
    return Math.max(...data) * 1.15;
  }, [data]);

  const points = useMemo(() => {
    return data.map((v, i) => [X0 + (i * W) / (n - 1), Y0 + H - (v / mx) * H] as [number, number]);
  }, [data, mx, X0, W, Y0, H, n]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    let p = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length - 1; i++) {
      const a = (points[i][0] + points[i + 1][0]) / 2;
      const b = (points[i][1] + points[i + 1][1]) / 2;
      p += ` Q${points[i][0]} ${points[i][1]} ${a} ${b}`;
    }
    const L = points[points.length - 1];
    p += ` L${L[0]} ${L[1]}`;
    return p;
  }, [points]);

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (empty || !svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * vw;
    const idx = Math.max(0, Math.min(n - 1, Math.round(((x - X0) / W) * (n - 1))));
    setHoverIndex(idx);
  };

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    if (empty || !svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = ((touch.clientX - rect.left) / rect.width) * vw;
    const idx = Math.max(0, Math.min(n - 1, Math.round(((x - X0) / W) * (n - 1))));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const displayedDts = useMemo(() => {
    if (!isNarrow || dts.length <= 3) {
      return dts.map((t, i) => ({
        t,
        x: X0 + (i * W) / (dts.length - 1),
        align: (i === 0 ? 'start' : i === dts.length - 1 ? 'end' : 'middle') as 'start' | 'end' | 'middle',
      }));
    }
    const mid = Math.floor((dts.length - 1) / 2);
    return [
      { t: dts[0], x: X0, align: 'start' as const },
      { t: dts[mid], x: X0 + (mid * W) / (dts.length - 1), align: 'middle' as const },
      { t: dts[dts.length - 1], x: X0 + W, align: 'end' as const },
    ];
  }, [dts, isNarrow, X0, W]);

  const activePt = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  // Date calculation for the active hover point
  const hoverDateStr = useMemo(() => {
    if (hoverIndex === null) return '';
    if (dts.length > 0 && dts[0]) {
      const parts = dts[0].split(' ');
      const month = parts[0];
      const startDay = parseInt(parts[1], 10) || 1;
      const d = new Date(2026, month === 'Sep' ? 8 : 9, startDay + hoverIndex);
      const mName = d.toLocaleDateString('en-US', { month: 'short' });
      return `${mName} ${d.getDate()}`;
    }
    return `Day ${hoverIndex + 1}`;
  }, [hoverIndex, dts]);

  // Extract key comparison metrics: Earned & Subscribers and supporting data
  const metricComparison = useMemo(() => {
    if (hoverIndex === null) return null;

    const earnedKey = Object.keys(defs).find(
      k => k === 'ea' || k === 'er' || k === 'rev' || defs[k].p === '$'
    );
    const subKey = Object.keys(defs).find(
      k => k === 'su' || k === 'sub' || k === 'sb' || defs[k].n.toLowerCase().includes('sub')
    );
    const clickKey = Object.keys(defs).find(
      k => k === 'clk' || k === 'ck' || defs[k].n.toLowerCase().includes('click')
    );
    const refKey = Object.keys(defs).find(
      k => k === 'ref' || k === 'rf' || defs[k].n.toLowerCase().includes('refer')
    );

    const earnedVal = earnedKey ? defs[earnedKey].d[hoverIndex] : null;
    const subVal = subKey ? defs[subKey].d[hoverIndex] : null;
    const clickVal = clickKey ? defs[clickKey].d[hoverIndex] : null;
    const refVal = refKey ? defs[refKey].d[hoverIndex] : null;

    const earnedFormatted = earnedVal !== null ? `$${earnedVal.toFixed(2)}` : null;
    const subFormatted = subVal !== null ? `${Math.round(subVal)}` : null;
    const avgPerSub =
      earnedVal !== null && subVal && subVal > 0 ? `$${(earnedVal / subVal).toFixed(2)}` : null;

    return {
      earnedKey,
      subKey,
      clickKey,
      refKey,
      earnedVal,
      subVal,
      clickVal,
      refVal,
      earnedFormatted,
      subFormatted,
      avgPerSub,
    };
  }, [hoverIndex, defs]);

  return (
    <div ref={containerRef} style={{ width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, minHeight: 38 }}>
        {title ? <div className="h2">{title}</div> : <div />}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <div className="dd">
            <div
              className="btn sm"
              style={{ minWidth: 140, justifyContent: 'space-between' }}
              onClick={e => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <span>{def.n}</span>
              <i className="ti ti-chevron-down" style={{ fontSize: 14 }} />
            </div>
            <div className={`dm ${menuOpen ? 'on' : ''}`}>
              {order.map(k => (
                <div
                  key={k}
                  className={k === currentKey ? 'on' : ''}
                  onClick={e => {
                    e.stopPropagation();
                    onSelectKey(k);
                    setMenuOpen(false);
                  }}
                >
                  {defs[k].n}
                </div>
              ))}
            </div>
          </div>
          <div className="btn sm" style={{ minWidth: 100 }}>
            {isNarrow ? '14 days' : 'Last 28 days'}
            <i className="ti ti-chevron-down" style={{ fontSize: 14 }} />
          </div>
        </div>
      </div>

      <div className="gr" style={{ marginTop: 16 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${vw} ${vh}`}
          style={{ width: '100%', height: vh, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={() => setHoverIndex(null)}
        >
          {empty ? (
            <>
              {[0, 1, 2].map(g => {
                const y = Y0 + (g * H) / 2;
                return <line key={g} x1={X0} x2={X0 + W} y1={y} y2={y} stroke="#1d1d20" />;
              })}
              <text
                x={vw / 2}
                y={Y0 + H / 2 - 4}
                fill="#a6a6aa"
                fontSize="16"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="Inter,sans-serif"
              >
                No data yet
              </text>
              <text
                x={vw / 2}
                y={Y0 + H / 2 + 18}
                fill="#6f6f74"
                fontSize="13"
                textAnchor="middle"
                fontFamily="Inter,sans-serif"
              >
                {em || 'Waiting for the first subscription.'}
              </text>
            </>
          ) : (
            <>
              {[0, 1, 2].map(g => {
                const y = Y0 + (g * H) / 2;
                return (
                  <g key={g}>
                    <line x1={X0} x2={X0 + W} y1={y} y2={y} stroke="#1d1d20" />
                    <text
                      x={vw - 12}
                      y={y + 4}
                      fill="#7d7d82"
                      fontSize="12"
                      fontFamily="Inter,sans-serif"
                      textAnchor="end"
                    >
                      {formatVal(mx * (1 - g / 2), def.p)}
                    </text>
                  </g>
                );
              })}
              {displayedDts.map((item, idx) => (
                <text
                  key={idx}
                  x={item.x}
                  y={vh - 12}
                  fill="#7d7d82"
                  fontSize="12"
                  fontFamily="Inter,sans-serif"
                  textAnchor={item.align}
                >
                  {item.t}
                </text>
              ))}
              <path d={pathD} fill="none" stroke="#C9B8FF" strokeWidth="2.5" />
              {activePt && (
                <>
                  <line
                    y1={Y0}
                    y2={Y0 + H}
                    x1={activePt[0]}
                    x2={activePt[0]}
                    stroke="#C9B8FF"
                    strokeOpacity="0.4"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={activePt[0]}
                    cy={activePt[1]}
                    r="9"
                    fill="rgba(201, 184, 255, 0.25)"
                  />
                  <circle
                    cx={activePt[0]}
                    cy={activePt[1]}
                    r="5"
                    fill="#C9B8FF"
                    stroke="#0a0a0a"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </>
          )}
        </svg>

        {activePt && hoverIndex !== null && !empty && metricComparison && (
          <div
            className={`tip ${activePt[1] > vh * 0.44 ? 'tip-above' : 'tip-below'}`}
            style={{
              display: 'block',
              left: `${Math.min(Math.max((activePt[0] / vw) * 100, 18), 82)}%`,
              top: `${(activePt[1] / vh) * 100}%`,
              transform: activePt[1] > vh * 0.44 ? 'translate(-50%, calc(-100% - 14px))' : 'translate(-50%, 14px)',
            }}
          >
            {/* Header: Date + Day Index */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="ti ti-calendar" style={{ fontSize: 13, color: '#32294e' }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', color: '#1a1628' }}>
                  {hoverDateStr}
                </span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(23, 20, 31, 0.12)', padding: '2px 6px', borderRadius: 4, color: '#1d192c' }}>
                Day {hoverIndex + 1} of {n}
              </span>
            </div>

            {/* Primary active metric prominent display */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0 8px', borderBottom: '1px solid rgba(23, 20, 31, 0.16)' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#382f54', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {def.n}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.1, marginTop: 2, letterSpacing: '-0.5px' }}>
                  {def.p === '$' ? `$${def.d[hoverIndex].toFixed(2)}` : Math.round(def.d[hoverIndex]).toLocaleString()}
                </div>
              </div>
              {metricComparison.avgPerSub && def.p === '$' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#4a3d6f' }}>Per Sub</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1628' }}>{metricComparison.avgPerSub}</div>
                </div>
              )}
            </div>

            {/* Comparison Grid: Earned vs Subscribers */}
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
              {metricComparison.earnedFormatted && (
                <div
                  style={{
                    background: currentKey === metricComparison.earnedKey ? 'rgba(23, 20, 31, 0.16)' : 'rgba(23, 20, 31, 0.08)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: currentKey === metricComparison.earnedKey ? '1px solid rgba(23, 20, 31, 0.25)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#382f54', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-coin" style={{ fontSize: 10 }} />
                    Earned
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>
                    {metricComparison.earnedFormatted}
                  </span>
                </div>
              )}

              {metricComparison.subFormatted && (
                <div
                  style={{
                    background: currentKey === metricComparison.subKey ? 'rgba(23, 20, 31, 0.16)' : 'rgba(23, 20, 31, 0.08)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: currentKey === metricComparison.subKey ? '1px solid rgba(23, 20, 31, 0.25)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#382f54', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-users" style={{ fontSize: 10 }} />
                    Subscribers
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>
                    {metricComparison.subFormatted}
                  </span>
                </div>
              )}

              {metricComparison.clickVal !== null && (
                <div
                  style={{
                    background: currentKey === metricComparison.clickKey ? 'rgba(23, 20, 31, 0.16)' : 'rgba(23, 20, 31, 0.08)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: currentKey === metricComparison.clickKey ? '1px solid rgba(23, 20, 31, 0.25)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#382f54', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-cursor-text" style={{ fontSize: 10 }} />
                    Clicks
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>
                    {Math.round(metricComparison.clickVal)}
                  </span>
                </div>
              )}

              {metricComparison.refVal !== null && (
                <div
                  style={{
                    background: currentKey === metricComparison.refKey ? 'rgba(23, 20, 31, 0.16)' : 'rgba(23, 20, 31, 0.08)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: currentKey === metricComparison.refKey ? '1px solid rgba(23, 20, 31, 0.25)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#382f54', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-user-plus" style={{ fontSize: 10 }} />
                    Referred
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>
                    {Math.round(metricComparison.refVal)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [cur, setCur] = useState<Screen>('disc');
  const [dtab, setDtab] = useState<CampaignTab>('d');
  const [ptab, setPtab] = useState<PersonalTab>('c');
  const [snTab, setSnTab] = useState<PersonalSettingsTab>('d');
  const [devTab, setDevTab] = useState<DevTab>('asc');

  // Window width for mobile adaptation
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breakpoint definitions: sm < 640, md 640-899, lg 900-1199, xl >= 1200
  const isSm = windowWidth < 640;
  const isMd = windowWidth >= 640 && windowWidth < 900;
  const isLg = windowWidth >= 900 && windowWidth < 1200;
  const isXl = windowWidth >= 1200;
  const isBelow900 = windowWidth < 900;
  const isMobile = isSm; // backwards compatibility alias for any remaining references

  // App core state
  const [campaignState, setCampaignState] = useState({
    nm: 'Palazzo Lens',
    asc: true,
    sdk: true,
    fund: true,
  });

  // Financial state
  const [bal, setBal] = useState(99.5);
  const [paid, setPaid] = useState(88.5);
  const [cards, setCards] = useState<Card[]>([
    { id: 1, b: 'VISA', l: 'Visa ••••4417', e: '08/28' },
  ]);
  const [selCard, setSelCard] = useState(1);
  const [nextCardId, setNextCardId] = useState(2);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [csel, setCsel] = useState<Record<string, number>>({ 'All Categories': 1 });

  // Calendar in Discover
  const [calYm, setCalYm] = useState<[number, number]>([2026, 9]);

  // Overlays
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Profile
  const [profName, setProfName] = useState('Maya Chen');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [editFirstName, setEditFirstName] = useState('Maya');
  const [editLastName, setEditLastName] = useState('Chen');
  const [editDesc, setEditDesc] = useState('');

  // Personal creators approval state
  const [creatorApprovals, setCreatorApprovals] = useState<Record<string, 'approved' | 'declined' | null>>({});

  // Campaign public page
  const [joinRequested, setJoinRequested] = useState(false);

  // Creator claim page
  const [codeClaimed, setCodeClaimed] = useState(false);
  const [claimingLoading, setClaimingLoading] = useState(false);
  const [claimData, setClaimData] = useState<{ link: string; code: string; seed: number } | null>(null);

  // Withdraw screen form
  const [withdrawAmount, setWithdrawAmount] = useState('99.50');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [addCardError, setAddCardError] = useState('');

  // New campaign form
  const [newCampName, setNewCampName] = useState('');
  const [startDateStr, setStartDateStr] = useState('Tue, Oct 27');
  const [endDateStr, setEndDateStr] = useState('Tue, Oct 27');
  const [startTimeStr, setStartTimeStr] = useState('10:30 AM');
  const [endTimeStr, setEndTimeStr] = useState('11:30 AM');
  const [datePickerTarget, setDatePickerTarget] = useState<'s' | 'e' | null>(null);

  // Developer console
  const [devBundleId, setDevBundleId] = useState('');
  const [devIssuerId, setDevIssuerId] = useState('');
  const [devKeyId, setDevKeyId] = useState('');
  const [devKeyUploaded, setDevKeyUploaded] = useState(false);
  const [devError, setDevError] = useState('');
  const [devTesting, setDevTesting] = useState(false);
  const [devTestStatus, setDevTestStatus] = useState('');

  // Chart Metric Keys
  const [earnMetric, setEarnMetric] = useState('ea');
  const [insightMetric, setInsightMetric] = useState('rev');
  const [joinMetric, setJoinMetric] = useState('er');

  // Copy feedback
  const [copiedAppKey, setCopiedAppKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isLive = campaignState.asc && campaignState.sdk && campaignState.fund;

  // Toast auto-clear
  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => {
      setToastMsg(t => (t === text ? '' : t));
    }, 1800);
  };

  const closeAllOverlays = () => {
    setNotifOpen(false);
    setMoreMenuOpen(false);
    setSettingsModalOpen(false);
    setDatePickerTarget(null);
  };

  const navigateTo = (scr: Screen, opt?: string) => {
    closeAllOverlays();
    setCur(scr);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scr === 'pers' && opt) {
      setPtab((opt as PersonalTab) || 'c');
    }
    if (scr === 'dev' && opt) {
      setDevTab((opt as DevTab) || 'asc');
    }
    if (scr === 'wd') {
      setWithdrawDone(false);
      setWithdrawError('');
      setWithdrawAmount(bal.toFixed(2));
      setAddCardOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__umiNav = {
        setScreen: (s: Screen, opt?: string) => navigateTo(s, opt),
        openNotif: () => setNotifOpen(true),
        closeNotif: () => setNotifOpen(false),
        openSettings: () => setSettingsModalOpen(true),
        closeSettings: () => setSettingsModalOpen(false),
      };
    }
  });

  // Calendar days generation
  const calDays = useMemo(() => {
    const [y, m] = calYm;
    const f = new Date(y, m, 1).getDay();
    const dm = new Date(y, m + 1, 0).getDate();
    const pd = new Date(y, m, 0).getDate();
    const rows: { text: number; isGray: boolean; isTarget: boolean }[][] = [];

    for (let r = 0; r < 6; r++) {
      const row: { text: number; isGray: boolean; isTarget: boolean }[] = [];
      for (let c = 0; c < 7; c++) {
        const d = r * 7 + c - f + 1;
        let text = d;
        let isGray = false;
        let isTarget = false;
        if (d < 1) {
          text = pd + d;
          isGray = true;
        } else if (d > dm) {
          text = d - dm;
          isGray = true;
        } else if (y === 2026 && m === 9 && d === 27) {
          isTarget = true;
        }
        row.push({ text, isGray, isTarget });
      }
      rows.push(row);
    }
    return rows;
  }, [calYm]);

  // Discover campaigns list filter
  const allCampaignsData = [
    {
      t: 'Palazzo Lens',
      bg: '#e4d8ff',
      ic: 'ti-aperture',
      c: 'Photo and video',
      sub: '20% of subscription revenue · Ends Nov 27',
      by: 'Maya Chen · Photo and video',
      d: 'Palazzo Lens turns ordinary shots into polished portraits in seconds. Creators earn a share of every subscription they bring in, with no minimum audience and no exclusivity,… ',
    },
    {
      t: 'Tidal',
      bg: '#cfe8dc',
      ic: 'ti-wave-sine',
      c: 'Productivity',
      sub: '25% of subscription revenue · Ends Dec 3',
      by: 'Dawit Bekele · Productivity',
      d: 'Tidal is a focus timer that follows your natural energy through the day. Share your link, earn a share of every subscription, and watch results arrive in real time,… ',
      nw: true,
    },
    {
      t: 'Lumen Habit',
      bg: '#ffd9e8',
      ic: 'ti-sun',
      c: 'Health',
      sub: '15% of subscription revenue · Ends Nov 30',
      by: 'Hana Mulugeta · Health',
      d: 'Lumen Habit helps people build small routines that stick, with gentle reminders and weekly summaries. A great fit for wellness and lifestyle creators,… ',
      nw: true,
    },
  ];

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const isAll = Boolean(csel['All Categories']);
    return allCampaignsData.filter(item => {
      const matchQuery = !q || item.t.toLowerCase().includes(q);
      const matchCat = isAll || Boolean(csel[item.c]);
      return matchQuery && matchCat;
    });
  }, [searchQuery, csel]);

  // Chart configs
  const earnChartConfig: ChartConfig = useMemo(
    () => ({
      vw: 984,
      vh: 280,
      dts: ['Sep 29', 'Oct 5', 'Oct 11', 'Oct 17', 'Oct 23'],
      empty: false,
      em: '',
      order: ['ea', 'su'],
      defs: {
        ea: { n: 'Earned', d: generatePoints(5, 7.4), p: '$' },
        su: { n: 'Paying subscribers', d: generatePoints(6, 0.7), p: '' },
      },
    }),
    []
  );

  // Note: Insights bug fixed - when !isLive, empty is explicitly true!
  const insightChartConfig: ChartConfig = useMemo(
    () => ({
      vw: 984,
      vh: 280,
      dts: ['Sep 29', 'Oct 5', 'Oct 11', 'Oct 17', 'Oct 23'],
      empty: !isLive,
      em: 'Waiting for the first subscription.',
      order: ['rev', 'clk', 'ref', 'sub'],
      defs: {
        rev: { n: 'Attributed revenue', d: generatePoints(1, 172), p: '$' },
        clk: { n: 'Link clicks', d: generatePoints(2, 640), p: '' },
        ref: { n: 'Referred users', d: generatePoints(3, 42), p: '' },
        sub: { n: 'Paying subscribers', d: generatePoints(4, 7.6), p: '' },
      },
    }),
    [isLive]
  );

  const joinChartConfig: ChartConfig = useMemo(
    () => ({
      vw: 820,
      vh: 260,
      dts: ['Oct 14', 'Oct 20', 'Oct 27'],
      empty: !codeClaimed,
      em: 'Claim your code to start tracking.',
      order: ['er', 'ck', 'rf', 'sb'],
      defs: {
        er: { n: 'Earned', d: generatePoints(7, 3.2, 14), p: '$' },
        ck: { n: 'Link clicks', d: generatePoints(8, 15, 14), p: '' },
        rf: { n: 'Referred users', d: generatePoints(9, 4.4, 14), p: '' },
        sb: { n: 'Paying subscribers', d: generatePoints(10, 1.3, 14), p: '' },
      },
    }),
    [codeClaimed]
  );

  // Setup progress steps in Personal Insights
  const setupSteps = [
    { label: 'Campaign created', action: '' },
    { label: 'Connect App Store', action: 'Connect App Store', done: campaignState.asc },
    { label: 'Add the SDK', action: 'Open SDK setup', done: campaignState.sdk },
    { label: 'Fund wallet', action: 'Add funds', done: campaignState.fund },
  ];
  let firstIncomplete = -1;
  for (let i = 0; i < setupSteps.length; i++) {
    const isDone = i === 0 || setupSteps[i].done;
    if (!isDone && firstIncomplete < 0) {
      firstIncomplete = i;
      break;
    }
  }

  // Handle claiming creator code
  const handleClaimCode = () => {
    if (claimingLoading || codeClaimed) return;
    setClaimingLoading(true);
    setTimeout(() => {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let r = '';
      for (let i = 0; i < 5; i++) r += chars[Math.floor(Math.random() * chars.length)];
      const link = 'umi.link/pl-' + r;
      const code = 'MAYA-' + r.toUpperCase();
      let sd = 0;
      for (let i = 0; i < link.length; i++) sd = (sd * 31 + link.charCodeAt(i)) % 233280;

      setClaimData({ link, code, seed: sd || 7 });
      setCodeClaimed(true);
      setClaimingLoading(false);
    }, 600);
  };

  // Nav Item Active Index
  const railActiveIdx =
    cur === 'disc' || cur === 'camp' || cur === 'join' || cur === 'new'
      ? 0
      : cur === 'earn' || cur === 'wd'
      ? 2
      : cur === 'prof'
      ? 3
      : -1;

  // Add sidebar rail across all sections
  const isSidebarScreen = true;

  return (
    <div
      id="w"
      onClick={() => {
        if (moreMenuOpen) setMoreMenuOpen(false);
        if (datePickerTarget) setDatePickerTarget(null);
      }}
    >
      <div
        id="s"
        className={`${notifOpen ? 'no nc ' : ''}${settingsModalOpen ? 'so ' : ''}`}
      >
        {/* ================= SECTION A: SIDEBAR RAIL (350 CSS px wide) ================= */}
        {isSidebarScreen && (
          <div className="rail" data-a={railActiveIdx}>
            <svg
              style={{ position: 'absolute', left: 16, top: 20 }}
              width="26"
              height="26"
              viewBox="0 0 30 30"
              fill="#C9B8FF"
            >
              <ellipse cx="15" cy="8" rx="4.6" ry="7" />
              <ellipse cx="15" cy="22" rx="4.6" ry="7" />
              <ellipse cx="8" cy="15" rx="7" ry="4.6" />
              <ellipse cx="22" cy="15" rx="7" ry="4.6" />
            </svg>

            <div className="rl">
              {/* 0: Campaigns */}
              <div
                className={`it ${(cur === 'disc' || cur === 'camp' || cur === 'join' || cur === 'new') && !notifOpen ? 'a' : ''}`}
                onClick={() => navigateTo('disc')}
              >
                <i className="ti ti-speakerphone" />
                <span className="t">Campaigns</span>
              </div>

              {/* 1: Notifications */}
              <div
                className={`it ${notifOpen ? 'a' : ''}`}
                onClick={() => {
                  setMoreMenuOpen(false);
                  setNotifOpen(!notifOpen);
                }}
              >
                <i className="ti ti-bell" />
                <span className="t">Notifications</span>
              </div>

              {/* 2: Earnings */}
              <div
                className={`it ${(cur === 'earn' || cur === 'wd') && !notifOpen ? 'a' : ''}`}
                onClick={() => navigateTo('earn')}
              >
                <i className="ti ti-coin" />
                <span className="t">Earnings</span>
              </div>

              {/* 3: Profile */}
              <div
                className={`it ${cur === 'prof' && !notifOpen ? 'a' : ''}`}
                onClick={() => navigateTo('prof')}
              >
                <span
                  className="av"
                  style={{ width: 24, height: 24, background: '#9be3c6', gap: 3 }}
                >
                  <b style={{ width: 4, height: 8 }} />
                  <b style={{ width: 4, height: 8 }} />
                </span>
                <span className="t">Profile</span>
              </div>
              {/* On sm: 5th item in bottom tab bar */}
              {isSm && (
                <div
                  className={`it ${moreMenuOpen ? 'a' : ''}`}
                  id="mb"
                  onClick={e => {
                    e.stopPropagation();
                    setMoreMenuOpen(!moreMenuOpen);
                  }}
                >
                  <i className="ti ti-menu-2" />
                  <span className="t">More</span>
                </div>
              )}
            </div>

            {/* Bottom More menu button for desktop / tablet */}
            {!isSm && (
              <div
                className="it rail-more"
                id="mb"
                onClick={e => {
                  e.stopPropagation();
                  setMoreMenuOpen(!moreMenuOpen);
                }}
              >
                <i className="ti ti-menu-2" />
                <span className="t">More</span>
              </div>
            )}
          </div>
        )}

        {/* ================= SCREEN 1: CAMPAIGNS (disc) ================= */}
        <div className={`scr ${cur === 'disc' ? 'on' : ''}`} id="disc">
          <div className="layout-a-main">
            <div className="camp-grid">
              {/* Main text column */}
              <div className="camp-main">
                <div
                  className="hh"
                  style={{
                    height: 'auto',
                    minHeight: 42,
                    display: 'flex',
                    flexDirection: isSm ? 'column' : 'row',
                    alignItems: isSm ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isSm ? '100%' : 'auto', gap: 12 }}>
                    <div className="h1">Campaigns</div>
                    {/* On md: "New Campaign" moves to page header */}
                    {isMd && (
                      <div className="nb" style={{ margin: 0 }} onClick={() => navigateTo('new')} title="Create new campaign">
                        <i className="ti ti-plus" style={{ fontSize: 15 }} />
                        New Campaign
                      </div>
                    )}
                  </div>
                  {/* Search: full width on sm, standard width on md/lg/xl */}
                  <div style={{ position: 'relative', width: isSm ? '100%' : 260 }}>
                    <i
                      className="ti ti-search"
                      style={{ position: 'absolute', left: 12, top: 11, fontSize: 16, color: '#6f6f74' }}
                    />
                    <input
                      id="sq"
                      className="srch"
                      style={{ width: '100%' }}
                      placeholder="Search campaigns"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Categories Horizontal Chip Row: 36px tall */}
                {isSm && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      padding: '8px 0 14px',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {CATEGORIES.map(cat => {
                      const isSelected = Boolean(csel[cat]);
                      return (
                        <div
                          key={cat}
                          style={{
                            height: 36,
                            padding: '0 14px',
                            borderRadius: 18,
                            background: isSelected ? '#C9B8FF' : '#1e1e22',
                            color: isSelected ? '#0a0a0a' : '#d4d4d8',
                            fontSize: 14,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onClick={() => {
                            if (cat === 'All Categories') setCsel({ 'All Categories': 1 });
                            else {
                              setCsel(prev => {
                                const copy = { ...prev };
                                delete copy['All Categories'];
                                if (copy[cat]) delete copy[cat];
                                else copy[cat] = 1;
                                if (Object.keys(copy).length === 0) return { 'All Categories': 1 };
                                return copy;
                              });
                            }
                          }}
                        >
                          {cat}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tabs: Discover / Joined / Created */}
                <div className="tbs" id="dt" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
                  <div
                    className={`tb ${dtab === 'd' ? 'a' : ''}`}
                    onClick={() => setDtab('d')}
                  >
                    Discover
                  </div>
                <div
                  className={`tb ${dtab === 'j' ? 'a' : ''}`}
                  onClick={() => setDtab('j')}
                >
                  Joined
                </div>
                <div
                  className={`tb ${dtab === 'c' ? 'a' : ''}`}
                  onClick={() => setDtab('c')}
                >
                  Created
                </div>
              </div>

              {/* Campaign list */}
              <div id="lst">
                {dtab === 'd' && (
                  <>
                    <div className="sh">
                      <span>Featured</span>
                      <span style={{ display: 'flex', gap: 24, fontSize: 18, color: '#8d8d92' }}>
                        <i className="ti ti-chevron-left" style={{ cursor: 'pointer' }} />
                        <i className="ti ti-chevron-right" style={{ cursor: 'pointer' }} />
                      </span>
                    </div>

                    {/* Palazzo Lens Featured */}
                    {filteredCampaigns
                      .filter(c => c.t === 'Palazzo Lens')
                      .map(o => (
                        <div
                          key={o.t}
                          className="ci"
                          onClick={() => navigateTo('camp')}
                        >
                          <div className="ch">
                            <div className="tl ctl" style={{ background: o.bg }}>
                              <i className={`ti ${o.ic}`} />
                            </div>
                            <div style={{ paddingTop: 4 }}>
                              <div className="ctt">
                                {o.t}
                                <span className="vb">
                                  <i className="ti ti-check" />
                                </span>
                              </div>
                              <div className="cs">{o.sub}</div>
                            </div>
                          </div>
                          <div className="cm">
                            <i className="ti ti-user" style={{ fontSize: 16 }} />
                            {o.by}
                          </div>
                          <div className="cd">
                            {o.d}
                            <b style={{ fontWeight: 600, color: '#fff' }}>see more</b>
                          </div>
                        </div>
                      ))}

                    <div
                      className="sh"
                      style={{
                        borderBottom: '1px solid #161618',
                        paddingBottom: 16,
                        height: 48,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span>New this week</span>
                    </div>

                    {filteredCampaigns
                      .filter(c => c.t !== 'Palazzo Lens')
                      .map(o => (
                        <div
                          key={o.t}
                          className="ci"
                          onClick={() => navigateTo('camp')}
                        >
                          <div className="ch">
                            <div className="tl ctl" style={{ background: o.bg }}>
                              <i className={`ti ${o.ic}`} />
                            </div>
                            <div style={{ paddingTop: 4 }}>
                              <div className="ctt">
                                {o.t}
                                <span className="vb">
                                  <i className="ti ti-check" />
                                </span>
                              </div>
                              <div className="cs">
                                {o.sub}
                                {o.nw && (
                                  <span
                                    style={{
                                      color: '#C9B8FF',
                                      fontSize: 14,
                                      fontWeight: 600,
                                      marginLeft: 6,
                                    }}
                                  >
                                    ● NEW
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="cm">
                            <i className="ti ti-user" style={{ fontSize: 16 }} />
                            {o.by}
                          </div>
                          <div className="cd">
                            {o.d}
                            <b style={{ fontWeight: 600, color: '#fff' }}>see more</b>
                          </div>
                        </div>
                      ))}
                  </>
                )}

                {dtab === 'j' && (
                  <>
                    <div className="sh">
                      <span>Joined</span>
                    </div>
                    <div className="ci" onClick={() => navigateTo('join')}>
                      <div className="ch">
                        <div className="tl ctl" style={{ background: '#e4d8ff' }}>
                          <i className="ti ti-aperture" />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <div className="ctt">
                            Palazzo Lens
                            <span className="vb">
                              <i className="ti ti-check" />
                            </span>
                          </div>
                          <div className="cs">Approved · 18 paying subscribers · $90.00 earned</div>
                        </div>
                      </div>
                      <div className="cm">
                        <i className="ti ti-user" style={{ fontSize: 16 }} />
                        Maya Chen · Photo and video
                      </div>
                      <div className="cd">
                        Open to claim your link and see your analytics.
                      </div>
                    </div>
                  </>
                )}

                {dtab === 'c' && (
                  <>
                    <div className="sh">
                      <span>Created</span>
                    </div>
                    <div
                      className="ci"
                      onClick={() => navigateTo('pers', 'i')}
                    >
                      <div className="ch">
                        <div className="tl ctl" style={{ background: '#e4d8ff' }}>
                          <i className="ti ti-aperture" />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <div className="ctt">
                            {campaignState.nm}
                            <span className="vb">
                              <i className="ti ti-check" />
                            </span>
                          </div>
                          <div className="cs">
                            {isLive ? 'Live' : 'Setting up'} · 20% of subscription revenue
                          </div>
                        </div>
                      </div>
                      <div className="cm">
                        <i className="ti ti-user" style={{ fontSize: 16 }} />
                        You
                      </div>
                      <div className="cd">Open to see analytics and finish setup.</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right widget column */}
            <div className="camp-right">
              {!isBelow900 && (
                <div className="nb" onClick={() => navigateTo('new')} title="Create new campaign">
                  <i className="ti ti-plus" style={{ fontSize: 15 }} />
                  New Campaign
                </div>
              )}

              {!isSm && (
                <div className="card" style={{ marginTop: isBelow900 ? 0 : 22, padding: '16px 18px 20px' }}>
                  <div
                    style={{
                      height: 38,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 6px',
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    <span id="cm2">
                      {MONTHS[calYm[1]]} {calYm[0]}
                    </span>
                    <span style={{ display: 'flex', gap: 16, fontSize: 16, color: '#a6a6aa' }}>
                      <i
                        className="ti ti-chevron-left"
                        id="cpv"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setCalYm(([y, m]) => (m === 0 ? [y - 1, 11] : [y, m - 1]));
                        }}
                      />
                      <i
                        className="ti ti-chevron-right"
                        id="cnx"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setCalYm(([y, m]) => (m === 11 ? [y + 1, 0] : [y, m + 1]));
                        }}
                      />
                    </span>
                  </div>

                  <div className="cr h">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div id="cg">
                    {calDays.map((row, rIdx) => (
                      <div className="cr" key={rIdx}>
                        {row.map((day, cIdx) => (
                          <span
                            key={cIdx}
                            className={`${day.isGray ? 'g' : ''} ${day.isTarget ? 't' : ''}`}
                          >
                            {day.text}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: '#1f1f22', marginTop: 20 }} />
                  <div
                    style={{
                      marginTop: 22,
                      fontSize: 18,
                      lineHeight: '26px',
                      fontWeight: 600,
                      paddingLeft: 6,
                    }}
                  >
                    Categories
                  </div>

                  <div id="ct" style={{ marginTop: 8 }}>
                    {CATEGORIES.map(cat => {
                      const isSelected = Boolean(csel[cat]);
                      return (
                        <div
                          key={cat}
                          className="ck"
                          onClick={() => {
                            if (cat === 'All Categories') {
                              setCsel({ 'All Categories': 1 });
                            } else {
                              setCsel(prev => {
                                const copy = { ...prev };
                                delete copy['All Categories'];
                                if (copy[cat]) delete copy[cat];
                                else copy[cat] = 1;
                                if (Object.keys(copy).length === 0) {
                                  return { 'All Categories': 1 };
                                }
                                return copy;
                              });
                            }
                          }}
                        >
                          <span className={`bx ${isSelected ? 'on' : ''}`}>
                            {isSelected && <i className="ti ti-check" />}
                          </span>
                          <span style={{ color: isSelected ? undefined : '#a6a6aa' }}>
                            {cat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* ================= SCREEN 2: EARNINGS (earn) ================= */}
        <div className={`scr ${cur === 'earn' ? 'on' : ''}`} id="earn">
          <div className="layout-a-main" style={{ maxWidth: 1040 }}>
            <div className="hh" style={{ height: 42 }}>
              <div className="h1">Earnings</div>
              <div
                className="btn wb"
                style={{ height: 42, fontSize: 16, padding: '0 18px' }}
                onClick={() => navigateTo('wd')}
              >
                <i className="ti ti-arrow-up-right" style={{ fontSize: 18 }} />
                Withdraw
              </div>
            </div>

            <div style={{ marginTop: 26, fontSize: 15, color: '#bdbdc1', lineHeight: '22px' }}>
              Available to withdraw
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span
                id="bal"
                style={{
                  fontSize: 52,
                  lineHeight: '64px',
                  fontWeight: 500,
                  letterSpacing: -1,
                }}
              >
                {formatMoney(bal)}
              </span>
              <span style={{ fontSize: 15, color: '#a6a6aa' }}>USD in your Stripe balance</span>
            </div>

            <div className="stat-grid" id="est" style={{ marginTop: 24 }}>
              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-clock" style={{ fontSize: 13 }} />
                      Pending Earnings
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.9, lineHeight: '16px' }}>
                      Held for 30 days to protect against subscriber refunds. Matures into Payable automatically.
                    </div>
                  </div>
                }
                maxWidth={250}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">
                    <i className="ti ti-clock" style={{ fontSize: 16 }} />
                    Pending
                  </div>
                  <div className="a2">$12.00</div>
                  <div className="a3">In the 30-day hold</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-calendar-event" style={{ fontSize: 13 }} />
                      Payable Balance
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.9, lineHeight: '16px' }}>
                      Cleared funds ready to be transferred directly to your balance on the next weekly run.
                    </div>
                  </div>
                }
                maxWidth={250}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">
                    <i className="ti ti-calendar-event" style={{ fontSize: 16 }} />
                    Payable
                  </div>
                  <div className="a2">$6.00</div>
                  <div className="a3">Next weekly payout run</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-send" style={{ fontSize: 13 }} />
                      Paid Out to Date
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.9, lineHeight: '16px' }}>
                      Lifetime cumulative earnings successfully settled and credited to your connected Stripe account.
                    </div>
                  </div>
                }
                maxWidth={250}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">
                    <i className="ti ti-send" style={{ fontSize: 16 }} />
                    Paid out
                  </div>
                  <div className="a2">$188.00</div>
                  <div className="a3">Sent to your Stripe balance</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-arrow-back-up" style={{ fontSize: 13 }} />
                      Reversed Earnings
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.9, lineHeight: '16px' }}>
                      2 refunded subscriber payments reversed before clearing the 30-day hold window.
                    </div>
                  </div>
                }
                maxWidth={250}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">
                    <i className="ti ti-arrow-back-up" style={{ fontSize: 16 }} />
                    Reversed
                  </div>
                  <div className="a2">$4.20</div>
                  <div className="a3">2 refunded payments</div>
                </div>
              </AccentTooltip>
            </div>

            <div className="info">
              <i className="ti ti-info-circle" style={{ fontSize: 16 }} />
              Earnings are held for 30 days to cover refunds, then paid out in the weekly run.
            </div>
            <div className="dv" />

            <div style={{ marginTop: 28 }}>
              <SvgChart
                title="Performance"
                config={earnChartConfig}
                currentKey={earnMetric}
                onSelectKey={setEarnMetric}
              />
            </div>

            <div className="dv" />

            <div className="h2" style={{ marginTop: 32 }}>
              By Campaign
            </div>
            <div className="sub" style={{ marginTop: 2 }}>
              What each campaign has earned you.
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="tr th">
                <span>Campaign</span>
                <span className="r col-share">Share</span>
                <span className="r">Subscribers</span>
                <span className="r">Earned</span>
              </div>
              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700 }}>Palazzo Lens Breakdown</div>
                    <div style={{ fontSize: 11.5, marginTop: 2 }}>
                      20% share · 18 subscribers · $5.00 avg per sub
                    </div>
                  </div>
                }
                align="left"
                maxWidth={260}
              >
                <div className="tr" style={{ cursor: 'default' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      className="tl"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: '#e4d8ff',
                        fontSize: 18,
                      }}
                    >
                      <i className="ti ti-aperture" />
                    </span>
                    <b style={{ fontWeight: 500, fontSize: 16 }}>Palazzo Lens</b>
                  </span>
                  <span className="r col-share" style={{ color: '#a6a6aa' }}>
                    20%
                  </span>
                  <span className="r">18</span>
                  <span className="r" style={{ fontWeight: 500 }}>
                    $90.00
                  </span>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700 }}>Tidal Breakdown</div>
                    <div style={{ fontSize: 11.5, marginTop: 2 }}>
                      25% share · 12 subscribers · $5.58 avg per sub
                    </div>
                  </div>
                }
                align="left"
                maxWidth={260}
              >
                <div className="tr" style={{ cursor: 'default' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      className="tl"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: '#cfe8dc',
                        fontSize: 18,
                      }}
                    >
                      <i className="ti ti-wave-sine" />
                    </span>
                    <b style={{ fontWeight: 500, fontSize: 16 }}>Tidal</b>
                  </span>
                  <span className="r col-share" style={{ color: '#a6a6aa' }}>
                    25%
                  </span>
                  <span className="r">12</span>
                  <span className="r" style={{ fontWeight: 500 }}>
                    $67.00
                  </span>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700 }}>Lumen Habit Breakdown</div>
                    <div style={{ fontSize: 11.5, marginTop: 2 }}>
                      15% share · 6 subscribers · $5.17 avg per sub
                    </div>
                  </div>
                }
                align="left"
                maxWidth={260}
              >
                <div className="tr" style={{ cursor: 'default' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      className="tl"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: '#ffd9e8',
                        fontSize: 18,
                      }}
                    >
                      <i className="ti ti-sun" />
                    </span>
                    <b style={{ fontWeight: 500, fontSize: 16 }}>Lumen Habit</b>
                  </span>
                  <span className="r col-share" style={{ color: '#a6a6aa' }}>
                    15%
                  </span>
                  <span className="r">6</span>
                  <span className="r" style={{ fontWeight: 500 }}>
                    $31.00
                  </span>
                </div>
              </AccentTooltip>
            </div>
          </div>
        </div>

        {/* ================= SCREEN 3: PROFILE (prof) ================= */}
        <div className={`scr ${cur === 'prof' ? 'on' : ''}`} id="prof">
          <div className="layout-a-main">
            <div className="prof-flex">
              {/* Center profile card */}
              <div
                className={`pc2 ${isEditingProf ? 'ed' : ''}`}
                id="pf"
              >
                <div className="bn" />
                <div className="avl">
                  <div className="fc">
                    <b />
                    <b />
                  </div>
                </div>

                <div className="pbt">
                  {!isEditingProf ? (
                    <>
                      <div
                        className="pb nn"
                        id="bset"
                        onClick={() => setSettingsModalOpen(true)}
                      >
                        Settings
                      </div>
                      <div
                        className="pb nn"
                        id="bed"
                        onClick={() => setIsEditingProf(true)}
                      >
                        Edit Profile
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="pb cn2 ne"
                        id="bcn"
                        onClick={() => setIsEditingProf(false)}
                      >
                        Cancel
                      </div>
                      <div
                        className="pb sv ne"
                        id="bsv"
                        onClick={() => {
                          const full = `${editFirstName} ${editLastName}`.trim();
                          setProfName(full || 'Maya Chen');
                          setIsEditingProf(false);
                        }}
                      >
                        Save
                      </div>
                    </>
                  )}
                </div>

                <div className="inf">
                  <div className="nmx">
                    {!isEditingProf ? (
                      <span className="nn" id="nmt">
                        {profName}
                      </span>
                    ) : (
                      <span className="ne">
                        <input
                          className="fe"
                          style={{ width: 120, background: 'transparent', color: '#fff' }}
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                        />
                        <input
                          className="fe"
                          style={{ width: 120, background: 'transparent', color: '#fff' }}
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                        />
                      </span>
                    )}
                  </div>
                  <div className="hd3">maya</div>

                  <div className="r3">
                    {!isEditingProf ? (
                      <span className="nn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="ti ti-link" style={{ fontSize: 16, color: '#bdbdc1' }} />
                        {editDesc || 'Instagram and 1 more'}
                      </span>
                    ) : (
                      <span className="ne">
                        <input
                          className="di"
                          placeholder="Add a description…"
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                        />
                      </span>
                    )}
                  </div>

                  <div className="r4">
                    {!isEditingProf ? (
                      <span className="nn" style={{ display: 'flex', gap: 14 }}>
                        <span>
                          <b>18</b> subscribers
                        </span>
                        <span>
                          <b>3</b> campaigns
                        </span>
                      </span>
                    ) : (
                      <span className="ne" style={{ fontWeight: 600, color: '#fff' }}>
                        Edit Social Links
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right requests panel */}
              <div className="rq">
                <div className="rqh">
                  <span>Requests</span>
                  <i className="ti ti-filter" style={{ fontSize: 18, color: '#bdbdc1' }} />
                </div>
                <div className="rr">
                  <div
                    className="tl"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#e4d8ff',
                      fontSize: 18,
                    }}
                  >
                    <i className="ti ti-aperture" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, lineHeight: '22px' }}>
                      Palazzo Lens
                    </div>
                    <div style={{ fontSize: 14, color: '#8d8d92' }}>Oct 24</div>
                  </div>
                  <span className="pill l" style={{ marginLeft: 'auto' }}>
                    Approved
                  </span>
                </div>
                <div className="rr">
                  <div
                    className="tl"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#cfe8dc',
                      fontSize: 18,
                    }}
                  >
                    <i className="ti ti-wave-sine" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, lineHeight: '22px' }}>Tidal</div>
                    <div style={{ fontSize: 14, color: '#8d8d92' }}>Oct 26</div>
                  </div>
                  <span className="pill" style={{ marginLeft: 'auto' }}>
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SCREEN 4: PERSONAL (pers) ================= */}
        <div className={`scr ${cur === 'pers' ? 'on' : ''}`} id="pers">
          <div className="layout-a-main" style={{ maxWidth: 1040 }}>
            <div className="hd">Personal</div>

            <div className="tabs" id="pt" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
              {(
                [
                  ['c', 'Campaigns'],
                  ['r', 'Creators'],
                  ['p', 'Payment'],
                  ['i', 'Insights'],
                  ['s', 'Settings'],
                ] as const
              ).map(([tabKey, label]) => (
                <div
                  key={tabKey}
                  className={`tab ${ptab === tabKey ? 'a' : ''}`}
                  onClick={() => setPtab(tabKey)}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="col" style={{ width: '100%', maxWidth: 830, padding: '24px 0 90px' }}>
              {/* TAB c: Campaigns */}
              {ptab === 'c' && (
                <div className="pn" data-p="c">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: 38,
                    }}
                  >
                    <div className="h2">Campaigns</div>
                    <div
                      className="btn sm"
                      style={{ width: 90 }}
                      onClick={() => navigateTo('new')}
                    >
                      Create
                    </div>
                  </div>
                  <div className="sub" style={{ marginTop: 2 }}>
                    Campaigns you’ve created and funded.
                  </div>

                  <div className="card" style={{ marginTop: 20, overflow: 'hidden' }} id="pcl">
                    <div
                      className="lr"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPtab('i')}
                    >
                      <div className="tl lt" style={{ background: '#e4d8ff' }}>
                        <i className="ti ti-aperture" />
                      </div>
                      <div>
                        <div className="ln">{campaignState.nm}</div>
                        <div className="lm">20% of subscription revenue · 128 creators</div>
                      </div>
                      <div className="lx">
                        <span className="pill l">{isLive ? 'Live' : 'Setting up'}</span>
                      </div>
                    </div>

                    <div className="lr">
                      <div className="tl lt" style={{ background: '#cfe8dc' }}>
                        <i className="ti ti-wave-sine" />
                      </div>
                      <div>
                        <div className="ln">Tidal</div>
                        <div className="lm">25% of subscription revenue · 74 creators</div>
                      </div>
                      <div className="lx">
                        <span className="pill l">Live</span>
                      </div>
                    </div>

                    <div className="lr">
                      <div className="tl lt" style={{ background: '#ffe1c8' }}>
                        <i className="ti ti-notebook" />
                      </div>
                      <div>
                        <div className="ln">Pocket Ledger</div>
                        <div className="lm">15% of subscription revenue · 41 creators</div>
                      </div>
                      <div className="lx">
                        <span className="pill">Paused</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB r: Creators */}
              {ptab === 'r' && (
                <div className="pn" data-p="r">
                  <div className="h2">Creators</div>
                  <div className="sub" style={{ marginTop: 2 }}>
                    Approve creators and see what they’ve earned you.
                  </div>

                  <div className="lab" style={{ marginTop: 24 }}>
                    Requests
                  </div>
                  <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
                    {/* Amira Hassan */}
                    <div className="lr">
                      <span className="av" style={{ width: 38, height: 38, background: '#f4c4d8' }}>
                        <b />
                        <b />
                      </span>
                      <div>
                        <div className="ln">Amira Hassan</div>
                        <div className="lm">Requested Palazzo Lens · 2h ago</div>
                      </div>
                      <div className="lx">
                        {creatorApprovals['amira'] === 'approved' ? (
                          <span className="pill l">Approved</span>
                        ) : creatorApprovals['amira'] === 'declined' ? (
                          <span className="pill">Declined</span>
                        ) : (
                          <>
                            <div
                              className="btn sm"
                              onClick={() =>
                                setCreatorApprovals(p => ({ ...p, amira: 'declined' }))
                              }
                            >
                              Decline
                            </div>
                            <div
                              className="btn wb sm"
                              onClick={() =>
                                setCreatorApprovals(p => ({ ...p, amira: 'approved' }))
                              }
                            >
                              Approve
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dawit Bekele */}
                    <div className="lr">
                      <span className="av" style={{ width: 38, height: 38, background: '#b9d7ff' }}>
                        <b />
                        <b />
                      </span>
                      <div>
                        <div className="ln">Dawit Bekele</div>
                        <div className="lm">Requested Tidal · 5h ago</div>
                      </div>
                      <div className="lx">
                        {creatorApprovals['dawit'] === 'approved' ? (
                          <span className="pill l">Approved</span>
                        ) : creatorApprovals['dawit'] === 'declined' ? (
                          <span className="pill">Declined</span>
                        ) : (
                          <>
                            <div
                              className="btn sm"
                              onClick={() =>
                                setCreatorApprovals(p => ({ ...p, dawit: 'declined' }))
                              }
                            >
                              Decline
                            </div>
                            <div
                              className="btn wb sm"
                              onClick={() =>
                                setCreatorApprovals(p => ({ ...p, dawit: 'approved' }))
                              }
                            >
                              Approve
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lab" style={{ marginTop: 24 }}>
                    Approved
                  </div>
                  <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
                    <div className="lr">
                      <span className="av" style={{ width: 38, height: 38, background: '#9be3c6' }}>
                        <b />
                        <b />
                      </span>
                      <div>
                        <div className="ln">Selam Tesfaye</div>
                        <div className="lm">9 paying subscribers · $45.00 earned</div>
                      </div>
                      <div className="lx">
                        <span className="pill l">Active</span>
                      </div>
                    </div>
                    <div className="lr">
                      <span className="av" style={{ width: 38, height: 38, background: '#ffd9a8' }}>
                        <b />
                        <b />
                      </span>
                      <div>
                        <div className="ln">Yonas Girma</div>
                        <div className="lm">6 paying subscribers · $30.00 earned</div>
                      </div>
                      <div className="lx">
                        <span className="pill l">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB p: Payment */}
              {ptab === 'p' && (
                <div className="pn" data-p="p">
                  <div className="h2">Funding</div>
                  <div
                    className="card"
                    style={{ marginTop: 18, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div id="fu1" style={{ fontSize: 18, lineHeight: '24px', fontWeight: 600 }}>
                        {campaignState.fund
                          ? 'Wallet funded · $2,000.00'
                          : 'Add funds to your wallet'}
                      </div>
                      <div
                        id="fu2"
                        style={{ marginTop: 4, fontSize: 15, lineHeight: '22px', color: '#a6a6aa' }}
                      >
                        Creators are paid from this wallet. Funds are reserved as soon as an earning
                        is created.
                      </div>
                    </div>
                    <div
                      className="btn wb"
                      id="fub"
                      style={{ height: 42, fontSize: 16, padding: '0 20px' }}
                      onClick={() => {
                        setCampaignState(prev => ({ ...prev, fund: true }));
                        showToast('Wallet funded');
                      }}
                    >
                      {campaignState.fund ? 'Add more' : 'Add funds'}
                    </div>
                  </div>

                  <div className="dv" />
                  <div className="h2" style={{ marginTop: 32 }}>
                    Payment Methods
                  </div>
                  <div className="sub" style={{ marginTop: 4 }}>
                    Choose accepted payment methods for deposits.
                  </div>

                  <div className="card" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div className="rw">
                      <div>
                        <div className="a1">Cards</div>
                        <div className="a2">
                          Major credit and debit cards, Apple Pay and Google Pay are always accepted.
                        </div>
                      </div>
                      <span className="pill l">On</span>
                    </div>
                    <div className="rw">
                      <div>
                        <div className="a1">Bank debit</div>
                        <div className="a2">For large deposits. Settles over a few days.</div>
                      </div>
                      <span
                        className="tg"
                        onClick={e => e.currentTarget.classList.toggle('on')}
                      />
                    </div>
                  </div>

                  <div className="lab" style={{ marginTop: 26 }}>
                    Regional Payment Methods
                  </div>
                  <div className="grid" id="rg" style={{ marginTop: 14 }}>
                    {REGIONAL_PAYMENTS.map(n => (
                      <div key={n} className="cell">
                        <span className="chip">{n.slice(0, 3).toUpperCase()}</span>
                        {n}
                        <span
                          className="tg"
                          onClick={e => e.currentTarget.classList.toggle('on')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB i: Insights (Insights bug fixed - empty graph when !isLive) */}
              {ptab === 'i' && (
                <div className="pn" data-p="i">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 48 }}>
                    <div
                      className="tl"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#e4d8ff',
                        fontSize: 22,
                      }}
                    >
                      <i className="ti ti-aperture" />
                    </div>
                    <div id="inm" style={{ fontSize: 22, fontWeight: 600 }}>
                      {campaignState.nm}
                    </div>
                    <span
                      className="pill"
                      id="ist"
                      style={{
                        background: '#C9B8FF',
                        color: '#0a0a0a',
                        fontWeight: 600,
                        borderRadius: 13,
                        padding: '0 12px',
                        height: 26,
                      }}
                    >
                      {isLive ? 'Live' : 'Setting up'}
                    </span>
                  </div>

                  {/* Setup Banner */}
                  <div
                    id="isc"
                    style={{
                      marginTop: 18,
                      borderRadius: 'var(--radius-card)',
                      background: '#C9B8FF',
                      color: '#17141f',
                      padding: '16px 18px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div id="sct" style={{ fontSize: 18, lineHeight: '24px', fontWeight: 600 }}>
                          {isLive ? 'Your campaign is live' : 'Finish setting up'}
                        </div>
                        <div
                          id="scd"
                          style={{ fontSize: 14.5, lineHeight: '20px', color: '#3a3158' }}
                        >
                          {isLive
                            ? 'Creators can now claim links and codes and start earning.'
                            : 'Creators can’t earn until Apple purchases can be verified and your wallet is funded.'}
                        </div>
                      </div>

                      {!isLive && firstIncomplete > 0 && (
                        <span
                          id="sb"
                          className="btn bk sm"
                          style={{ height: 36 }}
                          onClick={() => {
                            if (firstIncomplete === 1) navigateTo('dev', 'asc');
                            else if (firstIncomplete === 2) navigateTo('dev', 'sdk');
                            else if (firstIncomplete === 3) setPtab('p');
                          }}
                        >
                          {setupSteps[firstIncomplete].action}
                        </span>
                      )}
                    </div>

                    <div
                      id="sl"
                      style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}
                    >
                      {setupSteps.map((step, idx) => {
                        const done = idx === 0 || step.done;
                        const isCurrent = idx === firstIncomplete;
                        return (
                          <span
                            key={step.label}
                            className={`stp ${done ? 'd' : ''} ${isCurrent ? 'c' : ''}`}
                          >
                            <span className="sn">
                              {done ? (
                                <i className="ti ti-check" style={{ fontSize: 11 }} />
                              ) : (
                                idx + 1
                              )}
                            </span>
                            {step.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 Stat Boxes */}
                  <div className="stat-grid" id="ist4" style={{ marginTop: 26 }}>
                    {isLive ? (
                      <>
                        <AccentTooltip
                          text={
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>Attributed Revenue</div>
                              <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                                Total subscription volume driven through creator links and referral codes.
                              </div>
                            </div>
                          }
                          maxWidth={240}
                        >
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-chart-bar" style={{ fontSize: 16 }} />
                              Attributed revenue
                            </div>
                            <div className="a2">$4,820.00</div>
                            <div className="a3">$612.00 last week</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip
                          text={
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>Active Subscribers</div>
                              <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                                Paying subscribers verified and connected through campaign creator codes.
                              </div>
                            </div>
                          }
                          maxWidth={240}
                        >
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-users" style={{ fontSize: 16 }} />
                              Paying subscribers
                            </div>
                            <div className="a2">214</div>
                            <div className="a3">31 last week</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip
                          text={
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>Creator Commissions</div>
                              <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                                20% rev share earned across initial subscriptions and up to 6 months of renewals.
                              </div>
                            </div>
                          }
                          maxWidth={240}
                        >
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-percentage" style={{ fontSize: 16 }} />
                              Creator earnings
                            </div>
                            <div className="a2">$819.40</div>
                            <div className="a3">20% share · $81.94 fee</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip
                          text={
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>Wallet Liquidity</div>
                              <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                                Available escrow balance in your developer wallet for automatic creator payouts.
                              </div>
                            </div>
                          }
                          maxWidth={240}
                        >
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-wallet" style={{ fontSize: 16 }} />
                              Wallet balance
                            </div>
                            <div className="a2">$1,098.66</div>
                            <div className="a3">$196.60 reserved</div>
                          </div>
                        </AccentTooltip>
                      </>
                    ) : (
                      <>
                        <AccentTooltip text="Attributed revenue will populate once your campaign is live." maxWidth={220}>
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-chart-bar" style={{ fontSize: 16 }} />
                              Attributed revenue
                            </div>
                            <div className="a2" style={{ color: '#6f6f74' }}>
                              $0.00
                            </div>
                            <div className="a3">—</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip text="Subscribers acquired via creator links will show here." maxWidth={220}>
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-users" style={{ fontSize: 16 }} />
                              Paying subscribers
                            </div>
                            <div className="a2" style={{ color: '#6f6f74' }}>
                              0
                            </div>
                            <div className="a3">—</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip text="Creator commissions reserved at 20% share once live." maxWidth={220}>
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-percentage" style={{ fontSize: 16 }} />
                              Creator earnings
                            </div>
                            <div className="a2" style={{ color: '#6f6f74' }}>
                              $0.00
                            </div>
                            <div className="a3">20% share</div>
                          </div>
                        </AccentTooltip>

                        <AccentTooltip text={campaignState.fund ? 'Wallet funded with $2,000.00 deposit.' : 'Fund your wallet to activate campaign payouts.'} maxWidth={220}>
                          <div className="stat" style={{ cursor: 'help' }}>
                            <div className="a1">
                              <i className="ti ti-wallet" style={{ fontSize: 16 }} />
                              Wallet balance
                            </div>
                            <div
                              className="a2"
                              style={{ color: !campaignState.fund ? '#6f6f74' : undefined }}
                            >
                              {campaignState.fund ? '$2,000.00' : '$0.00'}
                            </div>
                            <div className="a3">
                              {campaignState.fund ? '$0.00 reserved' : 'Not funded'}
                            </div>
                          </div>
                        </AccentTooltip>
                      </>
                    )}
                  </div>

                  <div className="info">
                    <i className="ti ti-info-circle" style={{ fontSize: 16 }} />
                    Creators earn only from verified subscription payments, never from installs or
                    clicks.
                  </div>
                  <div className="dv" />

                  <div style={{ marginTop: 28 }}>
                    <SvgChart
                      title="Performance"
                      config={insightChartConfig}
                      currentKey={insightMetric}
                      onSelectKey={setInsightMetric}
                    />
                  </div>
                </div>
              )}

              {/* TAB s: Settings */}
              {ptab === 's' && (
                <div className="pn" data-p="s">
                  <div className="st">
                    <div className="sn2" id="sn">
                      <div
                        className={snTab === 'd' ? 'a' : ''}
                        onClick={() => setSnTab('d')}
                      >
                        <i className="ti ti-adjustments-horizontal" />
                        Defaults
                      </div>
                      <div
                        className={snTab === 'v' ? 'a' : ''}
                        onClick={() => setSnTab('v')}
                      >
                        <i className="ti ti-code" />
                        Developer
                      </div>
                      <div
                        className={snTab === 'b' ? 'a' : ''}
                        onClick={() => setSnTab('b')}
                      >
                        <i className="ti ti-heart" />
                        Billing
                      </div>
                    </div>

                    <div className="sp">
                      {snTab === 'd' && (
                        <div className="spn" data-p="d">
                          <div className="h2">Campaign Defaults</div>
                          <div className="sub" style={{ marginTop: 4 }}>
                            Default settings for new campaigns.
                          </div>
                          <div className="card" style={{ marginTop: 20, overflow: 'hidden' }}>
                            <div className="rw">
                              <div>
                                <div className="a1">Revenue share</div>
                                <div className="a2">
                                  Share of subscription revenue paid to creators.
                                </div>
                              </div>
                              <span className="btn sm" style={{ width: 84, padding: 0 }}>
                                20%
                              </span>
                            </div>
                            <div className="rw">
                              <div>
                                <div className="a1">Paid renewals</div>
                                <div className="a2">
                                  Months of renewals that earn creators a share.
                                </div>
                              </div>
                              <span className="btn sm" style={{ width: 84, padding: 0 }}>
                                6 months
                              </span>
                            </div>
                            <div className="rw">
                              <div>
                                <div className="a1">Auto-approve Creators</div>
                                <div className="a2">Approve creator requests without review.</div>
                              </div>
                              <span
                                className="tg"
                                onClick={e => e.currentTarget.classList.toggle('on')}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {snTab === 'v' && (
                        <div className="spn" data-p="v">
                          <div className="h2">Developer</div>
                          <div className="sub" style={{ marginTop: 4 }}>
                            App key, App Store connection and SDK.
                          </div>
                          <div
                            className="card"
                            style={{
                              marginTop: 20,
                              padding: 20,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 14,
                            }}
                          >
                            <i className="ti ti-code" style={{ fontSize: 30, color: '#5d5d62' }} />
                            <div style={{ flex: 1 }}>
                              <div className="a1" style={{ fontSize: 17, fontWeight: 500 }}>
                                Developer console
                              </div>
                              <div style={{ fontSize: 14.5, color: '#9a9a9f' }}>
                                Connect App Store Connect and install the SDK.
                              </div>
                            </div>
                            <span
                              className="btn wb sm"
                              style={{ height: 38 }}
                              onClick={() => navigateTo('dev', 'asc')}
                            >
                              Open
                            </span>
                          </div>
                        </div>
                      )}

                      {snTab === 'b' && (
                        <div className="spn" data-p="b">
                          <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontSize: 15, color: '#a6a6aa' }}>Upgrade to</div>
                            <div style={{ fontSize: 22, fontWeight: 500, color: '#C9B8FF' }}>
                              umi Pro
                            </div>
                            <div
                              style={{
                                fontSize: 52,
                                lineHeight: '64px',
                                fontWeight: 500,
                                letterSpacing: -1,
                                marginTop: 4,
                              }}
                            >
                              $69
                              <span
                                style={{
                                  fontSize: 16,
                                  color: '#a6a6aa',
                                  fontWeight: 400,
                                  marginLeft: 10,
                                }}
                              >
                                Per month
                              </span>
                            </div>
                            <div
                              className="btn pr"
                              style={{ marginTop: 16, width: '100%', height: 42, fontSize: 16 }}
                              onClick={() => showToast('Upgraded to umi Pro')}
                            >
                              Upgrade to umi Pro
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= SECTION B: LUMA FULL-SCREEN PAGES (No sidebar, centered 929 CSS px) ================= */}

        {/* ---------------- SCREEN 5: CAMPAIGN DETAIL (camp) ---------------- */}
        <div className={`scr ${cur === 'camp' ? 'on' : ''}`} id="camp">
          <div className="layout-b-main">
            <Breadcrumbs
              items={[
                { label: 'Campaigns', icon: 'ti-speakerphone', onClick: () => navigateTo('disc') },
                { label: 'Palazzo Lens', icon: 'ti-aperture', active: true },
              ]}
            />

            {/* Layout at >= 900: two columns 330px + 32px gap + 566px */}
            {!isBelow900 ? (
              <div style={{ display: 'flex', gap: 32 }}>
                <div style={{ width: 330, flexShrink: 0 }}>
                  <div
                    className="tl"
                    style={{
                      width: 330,
                      height: 330,
                      borderRadius: 18,
                      background: '#e4d8ff',
                      border: '1px solid #2a2a2e',
                      fontSize: 130,
                    }}
                  >
                    <i className="ti ti-aperture" />
                  </div>

                  <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className="av"
                      style={{ width: 34, height: 34, background: '#f4c4d8' }}
                    >
                      <b />
                      <b />
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, lineHeight: '16px', color: '#8d8d92' }}>
                        Presented by
                      </div>
                      <div className="t1" style={{ fontSize: 16 }}>Maya Chen</div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 15,
                      lineHeight: '22px',
                      color: '#9a9a9f',
                    }}
                  >
                    Photo editing tools for creators, built in Addis Ababa.
                  </div>

                  <div className="lb" style={{ marginTop: 26 }}>
                    Founder
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 44,
                      marginTop: 10,
                    }}
                  >
                    <span
                      className="av"
                      style={{ width: 28, height: 28, background: '#f4c4d8', gap: 3 }}
                    >
                      <b style={{ width: 4, height: 8 }} />
                      <b style={{ width: 4, height: 8 }} />
                    </span>
                    <span className="t1" style={{ fontSize: 15 }}>Maya Chen</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        gap: 12,
                        fontSize: 18,
                        color: '#8d8d92',
                      }}
                    >
                      <i className="ti ti-brand-instagram" />
                      <i className="ti ti-brand-x" />
                    </span>
                  </div>
                </div>

                <div style={{ width: 566, flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      height: 30,
                      padding: '0 10px 0 6px',
                      borderRadius: 8,
                      border: '1px solid #242427',
                      fontSize: 14,
                      color: '#8d8d92',
                    }}
                  >
                    <i className="ti ti-apps" style={{ fontSize: 16, color: '#d8d8dc' }} />
                    Featured in <span style={{ color: '#fff', fontWeight: 500 }}>Photo and video</span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 44,
                      lineHeight: '54px',
                      fontWeight: 600,
                      letterSpacing: -0.8,
                    }}
                  >
                    Palazzo Lens
                  </div>

                  <div style={{ marginTop: 16 }} className="row2">
                    <div className="tile">
                      <i className="ti ti-percentage" />
                    </div>
                    <div>
                      <div className="t1">20% of subscription revenue</div>
                      <div className="t2">First payment plus 6 months of renewals</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }} className="row2">
                    <div className="tile">
                      <i className="ti ti-calendar" />
                    </div>
                    <div>
                      <div className="t1">Oct 27 – Nov 27</div>
                      <div className="t2">Ends in 31 days</div>
                    </div>
                  </div>

                  {/* Join Purple Card */}
                  <div
                    style={{
                      marginTop: 26,
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      background: '#C9B8FF',
                      color: '#17141f',
                    }}
                  >
                    <div
                      style={{
                        height: 38,
                        background: '#b9a5f2',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 18px',
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#3a3158',
                      }}
                    >
                      Join
                    </div>
                    <div style={{ padding: '18px' }}>
                      <div id="jt" style={{ fontSize: 20, lineHeight: '26px', fontWeight: 600 }}>
                        {joinRequested ? 'Request sent' : 'Request to join'}
                      </div>
                      <div
                        id="jd"
                        style={{ marginTop: 4, fontSize: 14.5, lineHeight: '22px', color: '#3a3158' }}
                      >
                        {joinRequested
                          ? 'Waiting for the founder to approve you. We’ll notify you when it’s done.'
                          : 'The founder approves each creator. Once approved, you claim your own link, QR code and creator code and earn 20% of every subscription payment.'}
                      </div>
                      <div
                        id="jb"
                        className="btn bk"
                        style={{ marginTop: 16, width: '100%', height: 42, fontSize: 16 }}
                        onClick={() => setJoinRequested(!joinRequested)}
                      >
                        {joinRequested ? 'Requested' : 'Request to join'}
                      </div>
                      {joinRequested && (
                        <div
                          id="ja"
                          style={{
                            marginTop: 10,
                            textAlign: 'center',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                          onClick={() => navigateTo('join')}
                        >
                          Preview as approved
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lb" style={{ marginTop: 34 }}>
                    About Campaign
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 16,
                      lineHeight: '25px',
                      color: '#e4e4e6',
                    }}
                  >
                    Palazzo Lens turns ordinary shots into polished portraits in seconds. Creators
                    earn a share of every subscription they bring in, with no minimum audience and no
                    exclusivity.
                  </div>

                  <div className="lb" style={{ marginTop: 28 }}>
                    Get the app
                  </div>
                  <div className="sr2">
                    <div className="stt">
                      <i className="ti ti-brand-apple" />
                    </div>
                    <div className="t1">App Store</div>
                    <i
                      className="ti ti-arrow-up-right"
                      style={{ marginLeft: 'auto', fontSize: 18, color: '#8d8d92' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Single column below 900. Order: cover, title, info rows, request card, about, store rows */
              <div style={{ width: '100%' }}>
                {/* 1. Cover full-width square */}
                <div
                  className="tl full-cover-square"
                  style={{
                    borderRadius: 18,
                    background: '#e4d8ff',
                    border: '1px solid #2a2a2e',
                    fontSize: isSm ? 90 : 130,
                    margin: '0 auto',
                  }}
                >
                  <i className="ti ti-aperture" />
                </div>

                {/* 2. Title and category */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 30,
                    padding: '0 10px 0 6px',
                    borderRadius: 8,
                    border: '1px solid #242427',
                    fontSize: 14,
                    color: '#8d8d92',
                    marginTop: 20,
                  }}
                >
                  <i className="ti ti-apps" style={{ fontSize: 16, color: '#d8d8dc' }} />
                  Featured in <span style={{ color: '#fff', fontWeight: 500 }}>Photo and video</span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: isSm ? 30 : 38,
                    lineHeight: isSm ? '36px' : '46px',
                    fontWeight: 600,
                    letterSpacing: -0.6,
                  }}
                >
                  Palazzo Lens
                </div>

                {/* 3. Info rows */}
                <div style={{ marginTop: 16 }} className="row2">
                  <div className="tile">
                    <i className="ti ti-percentage" />
                  </div>
                  <div>
                    <div className="t1">20% of subscription revenue</div>
                    <div className="t2">First payment plus 6 months of renewals</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }} className="row2">
                  <div className="tile">
                    <i className="ti ti-calendar" />
                  </div>
                  <div>
                    <div className="t1">Oct 27 – Nov 27</div>
                    <div className="t2">Ends in 31 days</div>
                  </div>
                </div>

                {/* 4. Request Card with 48px full-width button on sm */}
                <div
                  style={{
                    marginTop: 24,
                    borderRadius: 'var(--radius-card)',
                    overflow: 'hidden',
                    background: '#C9B8FF',
                    color: '#17141f',
                  }}
                >
                  <div
                    style={{
                      height: 38,
                      background: '#b9a5f2',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 18px',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#3a3158',
                    }}
                  >
                    Join
                  </div>
                  <div style={{ padding: '18px' }}>
                    <div id="jt" style={{ fontSize: 20, lineHeight: '26px', fontWeight: 600 }}>
                      {joinRequested ? 'Request sent' : 'Request to join'}
                    </div>
                    <div
                      id="jd"
                      style={{ marginTop: 4, fontSize: 14.5, lineHeight: '22px', color: '#3a3158' }}
                    >
                      {joinRequested
                        ? 'Waiting for the founder to approve you. We’ll notify you when it’s done.'
                        : 'The founder approves each creator. Once approved, you claim your own link, QR code and creator code and earn 20% of every subscription payment.'}
                    </div>
                    <div
                      id="jb"
                      className="btn bk layout-b-action-btn"
                      style={{ marginTop: 16 }}
                      onClick={() => setJoinRequested(!joinRequested)}
                    >
                      {joinRequested ? 'Requested' : 'Request to join'}
                    </div>
                    {joinRequested && (
                      <div
                        id="ja"
                        style={{
                          marginTop: 10,
                          textAlign: 'center',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() => navigateTo('join')}
                      >
                        Preview as approved
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. About */}
                <div className="lb" style={{ marginTop: 28 }}>
                  About Campaign
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    lineHeight: '25px',
                    color: '#e4e4e6',
                  }}
                >
                  Palazzo Lens turns ordinary shots into polished portraits in seconds. Creators
                  earn a share of every subscription they bring in, with no minimum audience and no
                  exclusivity.
                </div>

                {/* 6. Store rows */}
                <div className="lb" style={{ marginTop: 24 }}>
                  Get the app
                </div>
                <div className="sr2">
                  <div className="stt">
                    <i className="ti ti-brand-apple" />
                  </div>
                  <div className="t1">App Store</div>
                  <i
                    className="ti ti-arrow-up-right"
                    style={{ marginLeft: 'auto', fontSize: 18, color: '#8d8d92' }}
                  />
                </div>

                {/* 7. Founder & presentation */}
                <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    className="av"
                    style={{ width: 34, height: 34, background: '#f4c4d8' }}
                  >
                    <b />
                    <b />
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, lineHeight: '16px', color: '#8d8d92' }}>
                      Presented by
                    </div>
                    <div className="t1" style={{ fontSize: 16 }}>Maya Chen</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- SCREEN 6: CREATOR CLAIM & ANALYTICS (join) ---------------- */}
        <div className={`scr ${cur === 'join' ? 'on' : ''}`} id="join">
          <div className="layout-b-main" style={{ maxWidth: 700 }}>
            <Breadcrumbs
              items={[
                { label: 'Campaigns', icon: 'ti-speakerphone', onClick: () => navigateTo('disc') },
                { label: 'Palazzo Lens', icon: 'ti-aperture', onClick: () => navigateTo('camp') },
                { label: 'Claim & Stats', icon: 'ti-link', active: true },
              ]}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                height: 60,
              }}
            >
              <div
                className="tl"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  background: '#e4d8ff',
                  fontSize: 32,
                }}
              >
                <i className="ti ti-aperture" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 27,
                    lineHeight: '34px',
                    fontWeight: 600,
                    letterSpacing: -0.4,
                  }}
                >
                  Palazzo Lens
                </div>
                <div style={{ fontSize: 15, color: '#9a9a9f', lineHeight: '22px' }}>
                  20% of subscription revenue · by Maya Chen
                </div>
              </div>
              <span className="pill l" style={{ marginLeft: 'auto' }}>
                Approved
              </span>
            </div>

            <div style={{ marginTop: 36 }}>
              <div className="h2">Your link and code</div>
              <div className="sub" style={{ marginTop: 2 }}>
                Claim your personal link, QR code and creator code.
              </div>
            </div>

            {/* Expandable Link/Code Box */}
            <div className="xp" id="xp" style={{ height: codeClaimed ? 'auto' : 58 }}>
              {!codeClaimed ? (
                <div className="cbtn layout-b-action-btn" id="cb" onClick={handleClaimCode}>
                  {claimingLoading ? 'Claiming…' : 'Claim code'}
                </div>
              ) : (
                <div className="inn" id="inn" style={{ flexDirection: isBelow900 ? 'column' : 'row' }}>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: '28px',
                        fontWeight: 700,
                        letterSpacing: -0.4,
                      }}
                    >
                      Your referral link
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 14.5,
                        lineHeight: '22px',
                        color: '#a6a6aa',
                      }}
                    >
                      Everyone who subscribes through your link or code earns you a share, every
                      payment.
                    </div>

                    <div className="rwr">
                      <div className="ipt">{claimData?.link}</div>
                      <div
                        id="p1"
                        className="cpb"
                        onClick={() => {
                          if (claimData?.link) {
                            navigator.clipboard?.writeText(`https://${claimData.link}`);
                          }
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 1400);
                        }}
                      >
                        <i className={`ti ${copiedLink ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 16 }} />
                        {copiedLink ? 'Copied' : 'Copy link'}
                      </div>
                    </div>

                    <div className="rwr">
                      <div className="ipt" style={{ fontFamily: 'var(--font-mono)' }}>
                        {claimData?.code}
                      </div>
                      <div
                        id="p2"
                        className="cpb"
                        onClick={() => {
                          if (claimData?.code) {
                            navigator.clipboard?.writeText(claimData.code);
                          }
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 1400);
                        }}
                      >
                        <i className={`ti ${copiedCode ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 16 }} />
                        {copiedCode ? 'Copied' : 'Copy code'}
                      </div>
                    </div>

                    <div className="fx">
                      <div>
                        <b>20%</b>
                        <span>Revenue share</span>
                      </div>
                      <div>
                        <b>6 mo</b>
                        <span>Of renewals</span>
                      </div>
                      <div>
                        <b>30 days</b>
                        <span>Refund hold</span>
                      </div>
                    </div>
                  </div>

                  <div className="qc" style={{ width: isBelow900 ? '100%' : 200, maxWidth: isBelow900 ? '100%' : 200 }}>
                    <div style={{ fontSize: 13.5, color: '#a6a6aa' }}>Scan with your phone</div>
                    <div className="qf">
                      <i className="cn a" />
                      <i className="cn b" />
                      <i className="cn c" />
                      <i className="cn d" />
                      <div className="qb">{claimData && renderQrSvg(claimData.seed, 120)}</div>
                    </div>
                    <div
                      className="btn sm"
                      style={{ marginTop: 12, height: 36 }}
                      onClick={() => showToast('QR code saved')}
                    >
                      <i className="ti ti-download" style={{ fontSize: 15 }} />
                      Download PNG
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11.5, color: '#6f6f74' }}>
                      Preview only
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="dv" style={{ marginTop: 36 }} />

            <div style={{ marginTop: 28 }}>
              <SvgChart
                title="Analytics"
                config={joinChartConfig}
                currentKey={joinMetric}
                onSelectKey={setJoinMetric}
              />
            </div>

            {/* 4 Analytics Stat Tiles */}
            <div className="stat-grid" id="js4" style={{ marginTop: 20 }}>
              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Link Clicks</div>
                    <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                      Total unique visits to your personalized campaign link and QR code scans.
                    </div>
                  </div>
                }
                maxWidth={230}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">Link clicks</div>
                  <div
                    className="a2"
                    style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                  >
                    {codeClaimed ? '214' : '0'}
                  </div>
                  <div className="a3">{codeClaimed ? '31 last week' : '—'}</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Referred Users</div>
                    <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                      Users who installed and signed up using your creator affiliate link or code.
                    </div>
                  </div>
                }
                maxWidth={230}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">Referred users</div>
                  <div
                    className="a2"
                    style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                  >
                    {codeClaimed ? '63' : '0'}
                  </div>
                  <div className="a3">{codeClaimed ? '9 last week' : '—'}</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Paying Subscribers</div>
                    <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                      Referred users who converted to an active paid subscription plan.
                    </div>
                  </div>
                }
                maxWidth={230}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">Paying subscribers</div>
                  <div
                    className="a2"
                    style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                  >
                    {codeClaimed ? '18' : '0'}
                  </div>
                  <div className="a3">{codeClaimed ? '3 last week' : '—'}</div>
                </div>
              </AccentTooltip>

              <AccentTooltip
                text={
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Total Earned</div>
                    <div style={{ fontSize: 11.5, opacity: 0.9 }}>
                      Your 20% revenue share across initial subscription purchases and renewals.
                    </div>
                  </div>
                }
                maxWidth={230}
              >
                <div className="stat" style={{ cursor: 'help' }}>
                  <div className="a1">Earned</div>
                  <div
                    className="a2"
                    style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                  >
                    {codeClaimed ? '$90.00' : '$0.00'}
                  </div>
                  <div className="a3">{codeClaimed ? '20% of revenue' : '—'}</div>
                </div>
              </AccentTooltip>
            </div>

            {/* How people found you */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>How people found you</div>
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    height: 54,
                    borderTop: '1px solid #1f1f22',
                  }}
                >
                  <i className="ti ti-link" style={{ fontSize: 18, color: '#bdbdc1' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span>Link or QR code</span>
                      <span id="sl1" style={{ color: '#a6a6aa' }}>
                        {codeClaimed ? '47 people · 75%' : '0 people'}
                      </span>
                    </div>
                    <div className="bar">
                      <i id="bl1" style={{ width: codeClaimed ? '75%' : '0%' }} />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    height: 54,
                    borderTop: '1px solid #1f1f22',
                  }}
                >
                  <i className="ti ti-keyboard" style={{ fontSize: 18, color: '#bdbdc1' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span>Creator code typed in the app</span>
                      <span id="sl2" style={{ color: '#a6a6aa' }}>
                        {codeClaimed ? '16 people · 25%' : '0 people'}
                      </span>
                    </div>
                    <div className="bar">
                      <i id="bl2" style={{ width: codeClaimed ? '25%' : '0%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SCREEN 7: CREATE CAMPAIGN (new) ---------------- */}
        <div className={`scr ${cur === 'new' ? 'on' : ''}`} id="new">
          <div className="layout-b-main">
            <Breadcrumbs
              items={[
                { label: 'Campaigns', icon: 'ti-speakerphone', onClick: () => navigateTo('disc') },
                { label: 'Create Campaign', icon: 'ti-plus', active: true },
              ]}
            />

            {/* 330 CSS px cover (radius 18) + 32 gap + 566 CSS px form */}
            <div style={{ display: 'flex', flexDirection: isBelow900 ? 'column' : 'row', gap: 32 }}>
              <div style={{ width: isBelow900 ? '100%' : 330, flexShrink: 0 }}>
                <div
                  className={`tl ${isBelow900 ? 'full-cover-square' : ''}`}
                  style={{
                    position: 'relative',
                    width: isBelow900 ? '100%' : 330,
                    height: isBelow900 ? 'auto' : 330,
                    borderRadius: 18,
                    border: '1px solid #2a2a2e',
                    background: '#141416',
                    color: '#5d5d62',
                    fontSize: 52,
                    margin: isBelow900 ? '0 auto' : undefined,
                  }}
                >
                  <i className="ti ti-photo" />
                  <div
                    style={{
                      position: 'absolute',
                      right: 18,
                      bottom: 18,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#0a0a0a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ti ti-photo-up" />
                  </div>
                </div>
              </div>

              <div style={{ width: isBelow900 ? '100%' : 566, flexShrink: 0, position: 'relative' }}>
                <input
                  id="nm"
                  placeholder="Campaign Name"
                  value={newCampName}
                  onChange={e => setNewCampName(e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 52,
                    border: 0,
                    background: 'transparent',
                    boxShadow: 'none',
                    outline: 0,
                    padding: 0,
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 600,
                    fontSize: isMobile ? 32 : 42,
                    color: '#fff',
                  }}
                />

                <div className="mobile-col" style={{ marginTop: 24, display: 'flex', gap: 14 }}>
                  <div
                    className="box"
                    style={{
                      flex: 1,
                      height: 96,
                      padding: '0 10px 0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        fontSize: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 24,
                      }}
                    >
                      <span>Start</span>
                      <span>End</span>
                    </div>

                    <div
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div
                          className="btn dp sm"
                          style={{ minWidth: 120 }}
                          onClick={e => {
                            e.stopPropagation();
                            setDatePickerTarget(datePickerTarget === 's' ? null : 's');
                          }}
                        >
                          {startDateStr}
                        </div>
                        <div
                          className="btn tp sm"
                          style={{ minWidth: 90 }}
                          onClick={() => {
                            const times = ['10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
                            const idx = times.indexOf(startTimeStr);
                            setStartTimeStr(times[(idx + 1) % times.length]);
                          }}
                        >
                          {startTimeStr}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <div
                          className="btn dp sm"
                          style={{ minWidth: 120 }}
                          onClick={e => {
                            e.stopPropagation();
                            setDatePickerTarget(datePickerTarget === 'e' ? null : 'e');
                          }}
                        >
                          {endDateStr}
                        </div>
                        <div
                          className="btn tp sm"
                          style={{ minWidth: 90 }}
                          onClick={() => {
                            const times = ['10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
                            const idx = times.indexOf(endTimeStr);
                            setEndTimeStr(times[(idx + 1) % times.length]);
                          }}
                        >
                          {endTimeStr}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="box"
                    style={{ width: isMobile ? '100%' : 140, height: 96, padding: '12px 14px' }}
                  >
                    <i className="ti ti-world" style={{ fontSize: 18, color: '#bdbdc1' }} />
                    <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                      GMT+03:00
                    </div>
                    <div style={{ fontSize: 13.5, color: '#9a9a9f' }}>Addis Ababa</div>
                  </div>
                </div>

                {/* Date picker popup */}
                {datePickerTarget && (
                  <div
                    id="cpp"
                    className="pop on"
                    style={{
                      left: isSm ? 16 : isBelow900 ? 20 : 100,
                      top: 110,
                      maxWidth: 'calc(100vw - 32px)',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 16,
                        fontWeight: 500,
                        marginBottom: 8,
                        padding: '0 4px',
                      }}
                    >
                      October 2026
                    </div>
                    <div className="g">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <span key={d} style={{ color: '#7d7d82', fontSize: 12, cursor: 'default' }}>
                          {d}
                        </span>
                      ))}
                      <span />
                      <span />
                      <span />
                      <span />
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <span
                          key={d}
                          className={d === 27 ? 'on' : ''}
                          onClick={() => {
                            const formatted = `${WEEKDAYS[(d + 3) % 7]}, Oct ${d}`;
                            if (datePickerTarget === 's') setStartDateStr(formatted);
                            else setEndDateStr(formatted);
                            setDatePickerTarget(null);
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="box"
                  style={{
                    marginTop: 18,
                    height: 60,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <i className="ti ti-link" style={{ fontSize: 18, color: '#bdbdc1' }} />
                  <div>
                    <div style={{ fontSize: 16, lineHeight: '22px', fontWeight: 500 }}>
                      Add App Link
                    </div>
                    <div style={{ fontSize: 14, color: '#9a9a9f' }}>App Store link</div>
                  </div>
                </div>

                <div
                  className="box"
                  style={{
                    marginTop: 16,
                    height: 42,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  <i className="ti ti-align-left" style={{ fontSize: 18, color: '#bdbdc1' }} />
                  Add Description
                </div>

                <div
                  style={{
                    marginTop: 26,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#9a9a9f',
                  }}
                >
                  Campaign Options
                </div>

                <div className="box" style={{ marginTop: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 44,
                      padding: '0 16px',
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    <i className="ti ti-percentage" style={{ fontSize: 18, color: '#bdbdc1' }} />
                    Revenue share
                    <span style={{ marginLeft: 'auto', color: '#a6a6aa' }}>20%</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 44,
                      padding: '0 16px',
                      borderTop: '1px solid #242427',
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    <i className="ti ti-repeat" style={{ fontSize: 18, color: '#bdbdc1' }} />
                    Paid renewals
                    <span style={{ marginLeft: 'auto', color: '#a6a6aa' }}>6 months</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 44,
                      padding: '0 16px',
                      borderTop: '1px solid #242427',
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    <i className="ti ti-lock" style={{ fontSize: 18, color: '#bdbdc1' }} />
                    Require Approval
                    <span
                      className="tg on"
                      style={{ marginLeft: 'auto' }}
                      onClick={e => e.currentTarget.classList.toggle('on')}
                    />
                  </div>
                </div>

                <div
                  id="cc"
                  className="btn wb"
                  style={{
                    marginTop: 38,
                    width: '100%',
                    height: 48,
                    fontSize: 18,
                    borderRadius: 'var(--radius-btn)',
                  }}
                  onClick={() => {
                    const n = newCampName.trim() || 'Untitled campaign';
                    setCampaignState({
                      nm: n,
                      asc: false,
                      sdk: false,
                      fund: false,
                    });
                    navigateTo('pers', 'i');
                    showToast('Campaign created. Finish setup to go live.');
                  }}
                >
                  Create Campaign
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SCREEN 8: WITHDRAW (wd) ---------------- */}
        <div className={`scr ${cur === 'wd' ? 'on' : ''}`} id="wd">
          <div className="layout-b-main">
            <Breadcrumbs
              items={[
                { label: 'Earnings', icon: 'ti-coin', onClick: () => navigateTo('earn') },
                { label: 'Withdraw', icon: 'ti-arrow-up-right', active: true },
              ]}
            />

            {!withdrawDone ? (
              <div id="f1" style={{ display: 'flex', flexDirection: isBelow900 ? 'column' : 'row', gap: 32 }}>
                <div style={{ width: isBelow900 ? '100%' : 330, flexShrink: 0 }}>
                  <div style={{ fontSize: 27, lineHeight: '36px', fontWeight: 600 }}>
                    Withdraw
                  </div>
                  <div style={{ marginTop: 4, fontSize: 16, color: '#dcdcde' }}>
                    Send your earnings to your card.
                  </div>

                  <div style={{ marginTop: 26, fontSize: 15, color: '#9a9a9f' }}>Amount</div>
                  <div className="am">
                    <span style={{ fontSize: 40, fontWeight: 500, color: '#8d8d92' }}>$</span>
                    <input
                      id="ai"
                      value={withdrawAmount}
                      onChange={e => {
                        setWithdrawAmount(e.target.value);
                        setWithdrawError('');
                      }}
                    />
                    <span
                      className="btn sm"
                      id="mx"
                      onClick={() => setWithdrawAmount(bal.toFixed(2))}
                    >
                      Max
                    </span>
                  </div>

                  {withdrawError && (
                    <div id="er" style={{ display: 'block', marginTop: 8, fontSize: 14, color: '#f05252' }}>
                      {withdrawError}
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 14, color: '#8d8d92' }}>
                    Available <span id="av">{formatMoney(bal)}</span> · Minimum $10.00
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <div className="kv">
                      <span>Fee</span>
                      <span>$0.00</span>
                    </div>
                    <div className="kv">
                      <span>Arrives</span>
                      <span>2 to 3 business days</span>
                    </div>
                    <div className="kv">
                      <span>You’ll receive</span>
                      <span id="rc" style={{ fontSize: 18, fontWeight: 600 }}>
                        {isNaN(parseFloat(withdrawAmount))
                          ? '$0.00'
                          : formatMoney(parseFloat(withdrawAmount))}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ width: isBelow900 ? '100%' : 566, flexShrink: 0 }}>
                  <div className="h2">Pay out to</div>
                  <div className="sub" style={{ marginTop: 2 }}>
                    Choose a card or add a new one.
                  </div>

                  <div className="card" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div id="cl">
                      {cards.map(c => (
                        <div
                          key={c.id}
                          className="cdr"
                          onClick={() => setSelCard(c.id)}
                        >
                          <span className="cb2">{c.b}</span>
                          <div>
                            <div style={{ fontSize: 16, lineHeight: '22px', fontWeight: 500 }}>
                              {c.l}
                            </div>
                            <div style={{ fontSize: 14, color: '#9a9a9f' }}>
                              Expires {c.e}
                            </div>
                          </div>
                          <span className={`rd ${c.id === selCard ? 'on' : ''}`} />
                        </div>
                      ))}
                    </div>

                    <div
                      className="ad"
                      id="adb"
                      onClick={() => setAddCardOpen(!addCardOpen)}
                    >
                      <i className="ti ti-plus" style={{ fontSize: 18 }} />
                      Add a card
                    </div>

                    {/* Add Card Form */}
                    <div className={`fm ${addCardOpen ? 'on' : ''}`} id="fm">
                      <div className="fl" style={{ marginTop: 0 }}>
                        Name on card
                      </div>
                      <input
                        className="fi"
                        id="fn"
                        placeholder="Full name"
                        value={newCardName}
                        onChange={e => setNewCardName(e.target.value)}
                      />

                      <div className="fl">Card number</div>
                      <input
                        className="fi"
                        id="fc"
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        value={newCardNumber}
                        onChange={e => {
                          const d = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = d.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setNewCardNumber(formatted);
                        }}
                      />

                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div className="fl">Expiry</div>
                          <input
                            className="fi"
                            id="fe"
                            placeholder="MM/YY"
                            value={newCardExpiry}
                            onChange={e => {
                              const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setNewCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="fl">CVC</div>
                          <input
                            className="fi"
                            id="fv"
                            placeholder="123"
                            value={newCardCvc}
                            onChange={e => setNewCardCvc(e.target.value)}
                          />
                        </div>
                      </div>

                      {addCardError && (
                        <div
                          id="fr"
                          style={{
                            display: 'block',
                            marginTop: 8,
                            fontSize: 14,
                            color: '#f05252',
                          }}
                        >
                          {addCardError}
                        </div>
                      )}

                      <div style={{ marginTop: 12, fontSize: 13.5, color: '#7d7d82' }}>
                        Card details go straight to Stripe. umi never stores them.
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          display: 'flex',
                          gap: 8,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <div
                          className="btn sm"
                          id="fx"
                          onClick={() => setAddCardOpen(false)}
                        >
                          Cancel
                        </div>
                        <div
                          className="btn wb sm"
                          id="fs"
                          onClick={() => {
                            const digits = newCardNumber.replace(/\D/g, '');
                            const ex = newCardExpiry.split('/');
                            const m = Number(ex[0]);
                            const y = Number(ex[1]);

                            if (!newCardName.trim()) {
                              setAddCardError('Enter the name on the card.');
                              return;
                            }
                            if (digits.length < 15) {
                              setAddCardError('Enter a valid card number.');
                              return;
                            }
                            if (!(m >= 1 && m <= 12) || !ex[1] || ex[1].length < 2) {
                              setAddCardError('Enter an expiry date as MM/YY.');
                              return;
                            }
                            if (y < 26 || (y === 26 && m < 10)) {
                              setAddCardError('That card has expired.');
                              return;
                            }
                            if (newCardCvc.length < 3) {
                              setAddCardError('Enter the security code.');
                              return;
                            }

                            const b = /^4/.test(digits)
                              ? 'VISA'
                              : /^(5[1-5]|2[2-7])/.test(digits)
                              ? 'MC'
                              : 'CARD';
                            const label = `${
                              b === 'VISA' ? 'Visa' : b === 'MC' ? 'Mastercard' : 'Card'
                            } ••••${digits.slice(-4)}`;

                            const newCard: Card = {
                              id: nextCardId,
                              b,
                              l: label,
                              e: newCardExpiry,
                            };
                            setCards(prev => [...prev, newCard]);
                            setSelCard(nextCardId);
                            setNextCardId(id => id + 1);
                            setAddCardError('');
                            setAddCardOpen(false);
                            setNewCardName('');
                            setNewCardNumber('');
                            setNewCardExpiry('');
                            setNewCardCvc('');
                          }}
                        >
                          Save card
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="btn wb"
                    id="go"
                    style={{
                      width: '100%',
                      height: 48,
                      marginTop: 20,
                      fontSize: 18,
                      borderRadius: 'var(--radius-btn)',
                    }}
                    onClick={() => {
                      const a = parseFloat(withdrawAmount);
                      if (isNaN(a)) {
                        setWithdrawError('Enter an amount.');
                        return;
                      }
                      if (a < 10) {
                        setWithdrawError('The minimum withdrawal is $10.00.');
                        return;
                      }
                      if (a > bal + 0.001) {
                        setWithdrawError(
                          `That’s more than your available balance of ${formatMoney(bal)}.`
                        );
                        return;
                      }
                      const c = cards.find(x => x.id === selCard);
                      if (!c) {
                        setWithdrawError('Add a card to withdraw to.');
                        return;
                      }

                      setBal(Math.round((bal - a) * 100) / 100);
                      setPaid(prev => prev + a);
                      setWithdrawDone(true);
                    }}
                  >
                    Withdraw
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="f2"
                style={{ display: 'flex', justifyContent: 'center', marginTop: 70 }}
              >
                <div style={{ width: 440, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(201,184,255,.16)',
                      color: '#C9B8FF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                    }}
                  >
                    <i className="ti ti-check" />
                  </div>
                  <div style={{ marginTop: 16, fontSize: 27, fontWeight: 600 }}>
                    Withdrawal requested
                  </div>
                  <div
                    id="d2"
                    style={{ marginTop: 6, fontSize: 16, lineHeight: '24px', color: '#a6a6aa' }}
                  >
                    We’ll send {formatMoney(parseFloat(withdrawAmount))} to your{' '}
                    {cards.find(x => x.id === selCard)?.l || 'Card'}. You’ll get a receipt by email.
                  </div>
                  <div
                    className="btn wb"
                    style={{ width: '100%', marginTop: 24, height: 42, fontSize: 16 }}
                    onClick={() => navigateTo('earn')}
                  >
                    Back to earnings
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= SCREEN 9: DEVELOPER (dev) ================= */}
        {/* Top bar 45 CSS px, sidebar 246 CSS px fixed, content 688 CSS px starts 292 after sidebar */}
        <div className={`scr ${cur === 'dev' ? 'on' : ''}`} id="dev">
          <div className="dtop">
            <svg width="22" height="22" viewBox="0 0 30 30" fill="#C9B8FF">
              <ellipse cx="15" cy="8" rx="4.6" ry="7" />
              <ellipse cx="15" cy="22" rx="4.6" ry="7" />
              <ellipse cx="8" cy="15" rx="7" ry="4.6" />
              <ellipse cx="22" cy="15" rx="7" ry="4.6" />
            </svg>
            <span style={{ color: '#4a4a4f', fontSize: 18 }}>/</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Developer</span>
          </div>

          <div className="dsd" style={{ display: isBelow900 ? 'none' : 'block' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: '.1em',
                color: '#7d7d82',
                padding: '0 6px',
                marginBottom: 6,
              }}
            >
              DEVELOPER
            </div>
            <div
              className={`dsi ${devTab === 'asc' ? 'a' : ''}`}
              onClick={() => setDevTab('asc')}
            >
              API Keys
            </div>
            <div
              className={`dsi ${devTab === 'sdk' ? 'a' : ''}`}
              onClick={() => setDevTab('sdk')}
            >
              SDK Setup
            </div>
          </div>

          {/* Top Tabs for Developer below 900 */}
          {isBelow900 && (
            <div style={{ display: 'flex', borderBottom: '1px solid #1f1f22', background: '#0a0a0a' }}>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 500,
                  borderBottom: devTab === 'asc' ? '2px solid #fff' : '2px solid transparent',
                  color: devTab === 'asc' ? '#fff' : '#8d8d92',
                  cursor: 'pointer',
                }}
                onClick={() => setDevTab('asc')}
              >
                API Keys
              </div>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 500,
                  borderBottom: devTab === 'sdk' ? '2px solid #fff' : '2px solid transparent',
                  color: devTab === 'sdk' ? '#fff' : '#8d8d92',
                  cursor: 'pointer',
                }}
                onClick={() => setDevTab('sdk')}
              >
                SDK Setup
              </div>
            </div>
          )}

          {/* Content: max 760, starts 292 after sidebar at >= 900 */}
          <div
            className="mobile-content"
            style={{
              marginLeft: isBelow900 ? 0 : 292,
              maxWidth: isBelow900 ? '100%' : 760,
              padding: isSm ? '16px 16px 90px' : '36px 20px 100px',
            }}
          >
            <Breadcrumbs
              items={[
                { label: 'Personal Workspace', icon: 'ti-user', onClick: () => navigateTo('pers', 'i') },
                { label: 'Developer & SDK', icon: 'ti-code', active: true },
              ]}
            />
            {devTab === 'asc' && (
              <div className="dp2">
                <div style={{ fontSize: 27, lineHeight: '36px', fontWeight: 500, letterSpacing: -0.4 }}>
                  API Keys
                </div>
                <div className="sub" style={{ marginTop: 4 }}>
                  Connect your app so umi can verify subscription purchases with Apple.
                </div>

                <div className="h2" style={{ marginTop: 28, fontSize: 18 }}>
                  Umi app key
                </div>
                <div style={{ marginTop: 4, fontSize: 14.5, color: '#a6a6aa' }}>
                  Public. Safe to put in your app.
                </div>
                <div className="rwr">
                  <div className="ipt" style={{ fontFamily: 'var(--font-mono)' }}>
                    umi_app_pl_8f2kQ4mT9x
                  </div>
                  <div
                    id="ck"
                    className="btn sm"
                    style={{ height: 44, padding: '0 16px' }}
                    onClick={() => {
                      navigator.clipboard?.writeText('umi_app_pl_8f2kQ4mT9x');
                      setCopiedAppKey(true);
                      setTimeout(() => setCopiedAppKey(false), 1400);
                    }}
                  >
                    <i
                      className={`ti ${copiedAppKey ? 'ti-check' : 'ti-copy'}`}
                      style={{ fontSize: 16 }}
                    />
                    {copiedAppKey ? 'Copied' : 'Copy'}
                  </div>
                </div>

                <div className="dv" />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 28,
                  }}
                >
                  <div className="h2" style={{ fontSize: 18 }}>
                    App Store Connect key
                  </div>
                  <span className={`pill ${campaignState.asc ? 'l' : ''}`} id="ap">
                    {campaignState.asc ? 'Connected' : 'Not connected'}
                  </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 14.5, lineHeight: '22px', color: '#a6a6aa' }}>
                  Create an In-App Purchase key in App Store Connect and enter its details. umi
                  encrypts the private key and never shows it again.
                </div>

                {!campaignState.asc ? (
                  <div id="af">
                    <div className="fl">Bundle ID</div>
                    <input
                      className="fi"
                      id="a1"
                      placeholder="com.example.palazzolens"
                      value={devBundleId}
                      onChange={e => setDevBundleId(e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div className="fl">Issuer ID</div>
                        <input
                          className="fi"
                          id="a2"
                          placeholder="69a6de70-…"
                          value={devIssuerId}
                          onChange={e => setDevIssuerId(e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="fl">Key ID</div>
                        <input
                          className="fi"
                          id="a3"
                          placeholder="2X9R4HXF34"
                          value={devKeyId}
                          onChange={e => setDevKeyId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="fl">Private key</div>
                    <div
                      id="a4"
                      className="ipt"
                      style={{
                        height: 52,
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        color: devKeyUploaded ? '#fff' : '#9a9a9f',
                        fontSize: 15,
                      }}
                      onClick={() => setDevKeyUploaded(true)}
                    >
                      {devKeyUploaded ? (
                        <>
                          <i
                            className="ti ti-file"
                            style={{ fontSize: 18, marginRight: 8, color: '#C9B8FF' }}
                          />
                          AuthKey_2X9R4HXF34.p8
                        </>
                      ) : (
                        <>
                          <i className="ti ti-upload" style={{ fontSize: 18, marginRight: 8 }} />
                          Upload the .p8 file
                        </>
                      )}
                    </div>

                    {devError && (
                      <div id="ae" style={{ display: 'block', marginTop: 8, fontSize: 14, color: '#f05252' }}>
                        {devError}
                      </div>
                    )}

                    <div
                      id="ab"
                      className="btn pr"
                      style={{ marginTop: 18, height: 44, padding: '0 20px', fontSize: 16 }}
                      onClick={() => {
                        if (!devBundleId.trim() || !devIssuerId.trim() || !devKeyId.trim()) {
                          setDevError('Fill in the bundle ID, issuer ID and key ID.');
                          return;
                        }
                        if (!devKeyUploaded) {
                          setDevError('Upload the .p8 private key.');
                          return;
                        }
                        setCampaignState(prev => ({ ...prev, asc: true }));
                        setDevError('');
                        showToast('App Store connected');
                      }}
                    >
                      Connect App Store
                    </div>
                  </div>
                ) : (
                  <div
                    id="acd"
                    style={{
                      marginTop: 18,
                      border: '1px solid #242427',
                      borderRadius: 12,
                      height: 64,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '0 16px',
                    }}
                  >
                    <i className="ti ti-circle-check" style={{ fontSize: 22, color: '#C9B8FF' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        Key {devKeyId || '2X9R4HXF34'} connected
                      </div>
                      <div style={{ fontSize: 14, color: '#8d8d92' }}>
                        Private key encrypted. It won’t be shown again.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {devTab === 'sdk' && (
              <div className="dp2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 27, lineHeight: '36px', fontWeight: 500, letterSpacing: -0.4 }}>
                      SDK Setup
                    </div>
                    <div className="sub" style={{ marginTop: 4 }}>
                      iOS for now. Add the SDK so referrals and purchases are verified.
                    </div>
                  </div>
                  <span
                    className={`pill ${campaignState.sdk ? 'l' : ''}`}
                    id="sc2"
                    style={{ marginTop: 8 }}
                  >
                    {campaignState.sdk ? 'Connected' : 'Not connected'}
                  </span>
                </div>

                <div id="ss">
                  {SDK_STEPS.map((step, idx) => (
                    <div key={step.title} style={{ display: 'flex', gap: 14, marginTop: 28 }}>
                      <span className="nbx">{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{step.title}</div>
                        <div
                          className="cdx"
                          dangerouslySetInnerHTML={{ __html: step.code }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
                  <span className="nbx">5</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>Verify the connection</div>
                    <div style={{ marginTop: 4, fontSize: 15, color: '#a6a6aa' }}>
                      Run your app, then send a test event from here.
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        id="vb"
                        className="btn wb sm"
                        style={{ height: 38, padding: '0 16px', fontSize: 15 }}
                        onClick={() => {
                          if (devTesting) return;
                          setDevTesting(true);
                          setDevTestStatus('Waiting for a test event…');
                          setTimeout(() => {
                            setCampaignState(prev => ({ ...prev, sdk: true }));
                            setDevTestStatus('Connected · test event received');
                            setDevTesting(false);
                          }, 1200);
                        }}
                      >
                        Send test event
                      </span>
                      {devTestStatus && (
                        <span id="vs" style={{ fontSize: 14.5, color: '#C9B8FF' }}>
                          {devTestStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= OVERLAYS (Notifications & Settings) ================= */}

        {/* 1: Notifications Drawer: 490 CSS px wide, 40 CSS px avatars */}
        <div id="ov" onClick={() => setNotifOpen(false)} />
        <div id="np">
          <div className="nt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Notifications</span>
            {isBelow900 && (
              <i className="ti ti-x" style={{ fontSize: 20, cursor: 'pointer' }} onClick={() => setNotifOpen(false)} />
            )}
          </div>
          <div id="nl">
            {NOTIFICATIONS.map((item, idx) => (
              <div key={idx} className="ni">
                <div
                  style={{
                    width: 40, // 40 CSS px avatars
                    height: 40,
                    borderRadius: '50%',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon ? (
                    <i className={`ti ${item.icon}`} style={{ fontSize: 20, color: '#17141f' }} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 30 30" fill="#0a0a0a">
                      <ellipse cx="15" cy="8" rx="4.6" ry="7" />
                      <ellipse cx="15" cy="22" rx="4.6" ry="7" />
                      <ellipse cx="8" cy="15" rx="7" ry="4.6" />
                      <ellipse cx="22" cy="15" rx="7" ry="4.6" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 16, lineHeight: '22px', fontWeight: 600 }}>
                    {item.title}
                    <span style={{ fontWeight: 500, color: '#8d8d92', marginLeft: 6, fontSize: 14 }}>
                      {item.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: '22px', fontWeight: 500, marginTop: 2 }}>
                    {item.text}
                  </div>
                  {item.quote && <div className="nq">{item.quote}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2: Settings Modal: 653 CSS px wide, 68 CSS px rows */}
        <div id="sov" onClick={() => setSettingsModalOpen(false)} />
        <div className="mdl" id="mdl">
          <div className="mh">
            Settings
            <i
              className="ti ti-x"
              id="smx"
              style={{ fontSize: 20, color: '#a6a6aa', cursor: 'pointer' }}
              onClick={() => setSettingsModalOpen(false)}
            />
          </div>
          <div className="ms">Notifications</div>
          <div className="mr">
            <div>
              <div className="a1">Email Notifications</div>
              <div className="a2">Receive updates by email.</div>
            </div>
            <span
              className="tg s on"
              onClick={e => e.currentTarget.classList.toggle('on')}
            />
          </div>
          <div className="mr">
            <div>
              <div className="a1">Campaign Invitations</div>
              <div className="a2">Emails inviting you to campaigns you haven’t joined.</div>
            </div>
            <span
              className="tg s on"
              onClick={e => e.currentTarget.classList.toggle('on')}
            />
          </div>
          <div className="mr">
            <div>
              <div className="a1">Payout Alerts</div>
              <div className="a2">Get notified when a payout is sent.</div>
            </div>
            <span
              className="tg s on"
              onClick={e => e.currentTarget.classList.toggle('on')}
            />
          </div>

          <div className="ms" style={{ marginTop: 18 }}>
            Account
          </div>
          <div className="mr">
            <div>
              <div className="a1">Founder Account</div>
              <div className="a2">Create and fund campaigns.</div>
            </div>
            <span
              className="tg s"
              onClick={e => e.currentTarget.classList.toggle('on')}
            />
          </div>
          <div className="mr">
            <div>
              <div className="a1">Log Out</div>
              <div className="a2">Log out on this device.</div>
            </div>
            <span
              className="mb"
              onClick={() => {
                setSettingsModalOpen(false);
                showToast('Logged out');
              }}
            >
              Log Out
            </span>
          </div>
        </div>

        {/* 3: More Menu Popup */}
        <div className={`md ${moreMenuOpen ? 'on' : ''}`} id="md">
          <div
            onClick={() => {
              setMoreMenuOpen(false);
              navigateTo('pers', 'c');
            }}
          >
            Personal
          </div>
          <div onClick={() => { setMoreMenuOpen(false); showToast('Umi v2.4'); }}>About</div>
          <div onClick={() => { setMoreMenuOpen(false); showToast('Privacy Policy'); }}>Privacy Policy</div>
          <div onClick={() => { setMoreMenuOpen(false); showToast('Terms of Service'); }}>Terms of Service</div>
          <hr />
          <div onClick={() => { setMoreMenuOpen(false); showToast('Logged out'); }}>Log Out</div>
        </div>

        {/* 4: Toast Popup */}
        <div id="tst" className={toastMsg ? 'on' : ''}>
          {toastMsg}
        </div>
      </div>
    </div>
  );
}
