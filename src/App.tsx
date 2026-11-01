import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

type Screen = 'disc' | 'earn' | 'prof' | 'pers' | 'camp' | 'join' | 'new' | 'wd' | 'dev' | 'docs';
type CampaignTab = 'd' | 'j' | 'c';
type PersonalTab = 'c' | 'r' | 'p' | 'i' | 's';
type PersonalSettingsTab = 'd' | 'v' | 'b' | 'docs' | 'plus';
type DevTab = 'asc' | 'sdk';
type SdkLang = 'swift' | 'kotlin' | 'rn' | 'node' | 'curl';

interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  fullKey?: string;
  created: string;
  lastUsed: string;
  expires: string;
  status: 'active' | 'expired' | 'revoked';
  scopes: string[];
}

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

const DEFAULT_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Production Mobile Client',
    keyMasked: 'umi_live_8f••••••••••••••••4mT9x',
    fullKey: 'umi_live_8f2kQ4mT9x_prod_sec_8921a8d0e72',
    created: 'Aug 29, 2026',
    lastUsed: '2 minutes ago',
    expires: 'Never',
    status: 'active',
    scopes: ['events:track', 'referrals:read', 'purchases:report'],
  },
  {
    id: 'key-2',
    name: 'Backend Webhook Worker',
    keyMasked: 'umi_sec_b2••••••••••••••••8e21a',
    fullKey: 'umi_sec_b271d9fa041_hook_worker_992e',
    created: 'Mar 22, 2026',
    lastUsed: '3 days ago',
    expires: 'Dec 2026',
    status: 'active',
    scopes: ['webhooks:receive', 'payouts:sync'],
  },
  {
    id: 'key-3',
    name: 'Dev Staging SDK',
    keyMasked: 'umi_test_3a••••••••••••••••911b',
    fullKey: 'umi_test_3a80801123_staging_full_access',
    created: 'Jan 10, 2026',
    lastUsed: '10 months ago',
    expires: 'Expired',
    status: 'expired',
    scopes: ['full_access'],
  },
];

const SDK_PLATFORMS: Record<SdkLang, { name: string; icon: string; steps: { title: string; desc: string; code: string }[] }> = {
  swift: {
    name: 'iOS (Swift / SPM)',
    icon: 'ti-brand-apple',
    steps: [
      {
        title: 'Add Swift Package Manager Dependency',
        desc: 'In Xcode: File > Add Packages... Enter the Umi repository URL.',
        code: '// Xcode Package Dependency URL\nhttps://github.com/umi-attribution/umi-ios-sdk.git',
      },
      {
        title: 'Configure it at launch',
        desc: 'Configure Umi with your public app key at startup in AppDelegate or App init.',
        code: 'import UmiSDK\n\n@main\nstruct MyApp: App {\n  init() {\n    Umi.configure(\n      apiKey: "umi_live_8f2kQ4mT9x",\n      enableAutoAttribution: true\n    )\n  }\n  var body: some Scene { ... }\n}',
      },
      {
        title: 'Resolve referrals and claim creator codes',
        desc: 'Detect incoming deep links or resolve user-input creator promo codes.',
        code: '// Resolve incoming universal link\nUmi.handleDeepLink(url: incomingUrl)\n\n// Or manual claim creator code\nUmi.claimCreatorCode("MAYA-8F2K") { result in\n  switch result {\n  case .success(let attribution): print("Attributed to \\(attribution.creator)")\n  case .failure(let error): print("Error: \\(error)")\n  }\n}',
      },
      {
        title: 'Bind and report StoreKit purchases',
        desc: 'Automatically track subscription purchases and revenue splits.',
        code: '// Bind StoreKit transaction\nUmi.reportPurchase(transactionId: transaction.id, revenue: 49.00)',
      },
    ],
  },
  kotlin: {
    name: 'Android (Kotlin)',
    icon: 'ti-brand-android',
    steps: [
      {
        title: 'Add Gradle Dependency',
        desc: 'Add the Umi Android SDK to your module build.gradle.kts.',
        code: 'dependencies {\n    implementation("so.umi:android-sdk:1.4.0")\n}',
      },
      {
        title: 'Initialize in Application class',
        desc: 'Initialize the SDK in your Android Application onCreate.',
        code: 'import so.umi.sdk.Umi\n\nclass MainApp : Application() {\n    override fun onCreate() {\n        super.onCreate()\n        Umi.init(this, "umi_live_8f2kQ4mT9x")\n    }\n}',
      },
      {
        title: 'Track referral link or promo code',
        desc: 'Attribute installs and user registrations.',
        code: '// In your deep-link activity or promo dialog\nUmi.claimCreatorCode("MAYA-8F2K") {\n    Log.d("Umi", "Creator referral recorded!")\n}',
      },
      {
        title: 'Report Google Play Billing purchase',
        desc: 'Track subscription purchases via Google Play Billing Client.',
        code: 'Umi.reportPurchase(purchase.orderId, purchase.products.first(), price = 49.00)',
      },
    ],
  },
  rn: {
    name: 'React Native / Expo',
    icon: 'ti-brand-react',
    steps: [
      {
        title: 'Install npm package',
        desc: 'Works seamlessly with Bare React Native and Expo config plugins.',
        code: 'npx expo install @umi/react-native-sdk\n# or: npm install @umi/react-native-sdk',
      },
      {
        title: 'Initialize SDK',
        desc: 'Call initialize in your App.tsx entrypoint.',
        code: 'import { Umi } from "@umi/react-native-sdk";\n\nuseEffect(() => {\n  Umi.init({\n    apiKey: "umi_live_8f2kQ4mT9x",\n    trackAppOpens: true,\n  });\n}, []);',
      },
      {
        title: 'Record creator code or link click',
        desc: 'Attach attribution to the current user device session.',
        code: 'await Umi.claimCode("MAYA-8F2K");\nconst status = await Umi.getAttribution();',
      },
      {
        title: 'Report In-App Purchase event',
        desc: 'Track subscriptions and renewals.',
        code: 'await Umi.reportPurchase({\n  transactionId: customerInfo.originalPurchaseDate,\n  amount: 49.00,\n  currency: "USD"\n});',
      },
    ],
  },
  node: {
    name: 'Node.js / TypeScript',
    icon: 'ti-brand-nodejs',
    steps: [
      {
        title: 'Install Node SDK',
        desc: 'For server-to-server tracking, webhook workers, and database sync.',
        code: 'npm install @umi/server-sdk',
      },
      {
        title: 'Initialize with Secret API Key',
        desc: 'Use your secret token in backend environments.',
        code: 'import { UmiClient } from "@umi/server-sdk";\n\nconst umi = new UmiClient({\n  apiKey: process.env.UMI_SECRET_KEY!,\n});',
      },
      {
        title: 'Track server-side referral conversion',
        desc: 'Attribute new user signup directly from your backend API.',
        code: 'const attribution = await umi.referrals.track({\n  creatorCode: "MAYA-8F2K",\n  userId: "user_89104",\n  revenue: 49.00,\n});',
      },
      {
        title: 'Listen to Webhooks',
        desc: 'Verify webhook signature and process subscription events.',
        code: 'app.post("/webhooks/umi", (req, res) => {\n  const event = umi.webhooks.verify(req.body, req.headers["x-umi-signature"]);\n  console.log("Event:", event.type);\n  res.sendStatus(200);\n});',
      },
    ],
  },
  curl: {
    name: 'cURL / REST API',
    icon: 'ti-terminal-2',
    steps: [
      {
        title: 'Ping authentication endpoint',
        desc: 'Verify that your token has correct authorization headers.',
        code: 'curl -X GET https://api.umi.so/v1/ping \\\n  -H "Authorization: Bearer umi_live_8f2kQ4mT9x"',
      },
      {
        title: 'Track referral conversion',
        desc: 'Post conversion event to attribution ledger.',
        code: 'curl -X POST https://api.umi.so/v1/referrals/track \\\n  -H "Authorization: Bearer umi_live_8f2kQ4mT9x" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "creator_code": "MAYA-8F2K",\n    "user_id": "usr_99120",\n    "campaign_id": "cmp_palazzo",\n    "amount_cents": 4900\n  }\'',
      },
      {
        title: 'Get Creator Attribution Stats',
        desc: 'Query real-time statistics for a creator code.',
        code: 'curl -X GET https://api.umi.so/v1/creators/MAYA-8F2K/stats \\\n  -H "Authorization: Bearer umi_live_8f2kQ4mT9x"',
      },
    ],
  },
};

const SDK_STEPS = SDK_PLATFORMS.swift.steps;

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

function Spinner({
  size = 16,
  className = '',
  color = 'currentColor',
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeDasharray="28.27 28.27"
        strokeDashoffset="10"
        opacity="0.25"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
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
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: '17px',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
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
                    borderColor: '#18181b transparent transparent transparent',
                  }
                : {
                    bottom: '100%',
                    borderColor: 'transparent transparent #18181b transparent',
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
  const [creatorProcessing, setCreatorProcessing] = useState<Record<string, 'approving' | 'declining' | null>>({});

  // Campaign public page
  const [joinRequested, setJoinRequested] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Creator claim page
  const [codeClaimed, setCodeClaimed] = useState(false);
  const [claimingLoading, setClaimingLoading] = useState(false);
  const [claimData, setClaimData] = useState<{ link: string; code: string; seed: number } | null>(null);

  // Withdraw screen form
  const [withdrawAmount, setWithdrawAmount] = useState('99.50');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [savingCardLoading, setSavingCardLoading] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [addCardError, setAddCardError] = useState('');

  // New campaign form
  const [newCampName, setNewCampName] = useState('');
  const [createCampLoading, setCreateCampLoading] = useState(false);
  const [fundingLoading, setFundingLoading] = useState(false);
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
  const [devConnectingAsc, setDevConnectingAsc] = useState(false);
  const [devTesting, setDevTesting] = useState(false);
  const [devTestStatus, setDevTestStatus] = useState('');

  // Profile and Settings loading
  const [savingProfLoading, setSavingProfLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Chart Metric Keys
  const [earnMetric, setEarnMetric] = useState('ea');
  const [insightMetric, setInsightMetric] = useState('rev');
  const [joinMetric, setJoinMetric] = useState('er');

  // Copy feedback
  const [copiedAppKey, setCopiedAppKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Developer & API Keys state (Supabase / AI Studio UX)
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(DEFAULT_API_KEYS);
  const [apiKeySearch, setApiKeySearch] = useState('');
  const [apiKeyScopeFilter, setApiKeyScopeFilter] = useState<'all' | 'events' | 'webhooks' | 'admin'>('all');
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('never');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['events:track', 'referrals:read']);
  const [creatingKeyLoading, setCreatingKeyLoading] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState<{ id: string; name: string; fullKey: string } | null>(null);
  const [selectedSdkLang, setSelectedSdkLang] = useState<SdkLang>('swift');

  // Documentation Screen state (Supabase Docs style)
  const [docCategory, setDocCategory] = useState<'intro' | 'auth' | 'sdk' | 'api' | 'webhooks'>('intro');
  const [docSearch, setDocSearch] = useState('');
  const [docFeedback, setDocFeedback] = useState<boolean | null>(null);

  // Referral / Join Claim Enhancements
  const [simulatedClicks, setSimulatedClicks] = useState(0);
  const [simulatingClick, setSimulatingClick] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Wallet & Add Funds state (Personal Payment section)
  const [walletBalance, setWalletBalance] = useState(2000.0);
  const [depositAmount, setDepositAmount] = useState(500);
  const [depositPaymentStep, setDepositPaymentStep] = useState<'form' | 'checkout' | 'success'>('form');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'card' | 'apple' | 'google' | 'bank'>('card');
  const [depositCardId, setDepositCardId] = useState(1);
  const [claimOverlayOpen, setClaimOverlayOpen] = useState(false);

  // Umi Pro ($69/mo or $55/mo annual) Upgrade State (upgrade-to-pro_5ab386f5.html)
  const [isProSubscriber, setIsProSubscriber] = useState(false);
  const isPlusSubscriber = isProSubscriber; // backwards compatibility alias
  const setIsPlusSubscriber = setIsProSubscriber;
  const [proPlan, setProPlan] = useState<'monthly' | 'annual'>('monthly');
  const plusBillingCycle = proPlan; // compatibility alias
  const setPlusBillingCycle = setProPlan;
  const [proViewStep, setProViewStep] = useState<'plan' | 'checkout' | 'success'>('plan');
  const [proPaymentMethod, setProPaymentMethod] = useState<'visa' | 'apple'>('visa');
  const [proConsent, setProConsent] = useState(false);
  const [proProcessing, setProProcessing] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradingLoading, setUpgradingLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(1);
  const [upgradePromoCode, setUpgradePromoCode] = useState('');
  const [upgradePromoApplied, setUpgradePromoApplied] = useState(false);

  // 2-Step Create API Key and Install SDK flow state (umi_create_api_key_and_install_sdk_v2_6d613e08.html)
  const [sdkStep, setSdkStep] = useState<1 | 2>(1);
  const [sdkKeyName, setSdkKeyName] = useState('');
  const [sdkKeyCampaign, setSdkKeyCampaign] = useState('Palazzo Lens');
  const [sdkKeyEnv, setSdkKeyEnv] = useState<'test' | 'live'>('test');
  const [sdkKeyExp, setSdkKeyExp] = useState<'30 days' | '90 days' | 'Never'>('30 days');
  const [sdkGeneratedKey, setSdkGeneratedKey] = useState<{ name: string; env: string; exp: string; val: string } | null>(null);
  const [sdkKeyCopiedConsent, setSdkKeyCopiedConsent] = useState(false);
  const [sdkKeyError, setSdkKeyError] = useState('');
  const [sdkGenerating, setSdkGenerating] = useState(false);
  const [sdkPackageMgr, setSdkPackageMgr] = useState<'spm' | 'pod'>('spm');
  const [sdkSelectedKeyIdx, setSdkSelectedKeyIdx] = useState(0);
  const [sdkVerificationStage, setSdkVerificationStage] = useState(0);
  const [sdkVerifying, setSdkVerifying] = useState(false);

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
      if (opt === 'plus' || opt === 'b' || opt === 'pro') {
        setPtab('s');
        setSnTab('b');
      } else if (opt === 'docs') {
        setPtab('s');
        setSnTab('docs');
      } else if (opt === 'v') {
        setPtab('s');
        setSnTab('v');
      } else {
        setPtab((opt as PersonalTab) || 'c');
      }
    }
    if (scr === 'dev' && opt) {
      setDevTab((opt as DevTab) || 'asc');
    }
    if (scr === 'docs' && opt) {
      if (['intro', 'auth', 'sdk', 'api', 'webhooks'].includes(opt)) {
        setDocCategory(opt as 'intro' | 'auth' | 'sdk' | 'api' | 'webhooks');
      }
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

  // Handle toggling campaign join request
  const handleToggleJoin = () => {
    if (joinLoading) return;
    setJoinLoading(true);
    if (!joinRequested) {
      setTimeout(() => {
        setJoinRequested(true);
        setJoinLoading(false);
        showToast('Application sent to founder for review');
      }, 850);
    } else {
      setTimeout(() => {
        setJoinRequested(false);
        setJoinLoading(false);
        showToast('Application withdrawn');
      }, 600);
    }
  };

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
      showToast('Creator link, code & QR claimed!');
    }, 900);
  };

  // Handle creator request action (approval or decline)
  const handleCreatorAction = (id: string, action: 'approved' | 'declined') => {
    if (creatorProcessing[id]) return;
    setCreatorProcessing(p => ({ ...p, [id]: action === 'approved' ? 'approving' : 'declining' }));
    setTimeout(() => {
      setCreatorApprovals(p => ({ ...p, [id]: action }));
      setCreatorProcessing(p => ({ ...p, [id]: null }));
      showToast(action === 'approved' ? 'Creator approved to promote' : 'Creator request declined');
    }, 700);
  };

  // Handle funding escrow wallet
  const handleFundWallet = () => {
    if (fundingLoading) return;
    setFundingLoading(true);
    setTimeout(() => {
      setCampaignState(prev => ({ ...prev, fund: true }));
      setFundingLoading(false);
      showToast('Escrow wallet funded with $500.00');
    }, 850);
  };

  // Handle creating a new campaign
  const handleCreateCampaign = () => {
    if (createCampLoading) return;
    const n = newCampName.trim() || 'Untitled campaign';
    setCreateCampLoading(true);
    setTimeout(() => {
      setCampaignState({
        nm: n,
        asc: false,
        sdk: false,
        fund: false,
      });
      setCreateCampLoading(false);
      navigateTo('pers', 'i');
      showToast('Campaign created! Finish setup to go live.');
    }, 950);
  };

  // Handle saving new card in withdraw modal
  const handleSaveCard = () => {
    if (savingCardLoading) return;
    const digits = newCardNumber.replace(/\s+/g, '');
    const ex = newCardExpiry.split('/');
    const m = parseInt(ex[0] || '0', 10);
    const y = parseInt(ex[1] || '0', 10);

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

    setAddCardError('');
    setSavingCardLoading(true);
    setTimeout(() => {
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
      setSavingCardLoading(false);
      setAddCardOpen(false);
      setNewCardName('');
      setNewCardNumber('');
      setNewCardExpiry('');
      setNewCardCvc('');
      showToast('Card verified and saved');
    }, 900);
  };

  // Handle submitting withdrawal
  const handleWithdrawSubmit = () => {
    if (withdrawLoading) return;
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

    setWithdrawError('');
    setWithdrawLoading(true);
    setTimeout(() => {
      setBal(prev => Math.round((prev - a) * 100) / 100);
      setPaid(prev => prev + a);
      setWithdrawLoading(false);
      setWithdrawDone(true);
      showToast('Withdrawal initiated successfully');
    }, 1100);
  };

  // Handle connecting App Store
  const handleConnectAsc = () => {
    if (devConnectingAsc) return;
    if (!devBundleId.trim() || !devIssuerId.trim() || !devKeyId.trim()) {
      setDevError('Fill in the bundle ID, issuer ID and key ID.');
      return;
    }
    if (!devKeyUploaded) {
      setDevError('Upload the .p8 private key.');
      return;
    }
    setDevError('');
    setDevConnectingAsc(true);
    setTimeout(() => {
      setCampaignState(prev => ({ ...prev, asc: true }));
      setDevConnectingAsc(false);
      showToast('App Store Connect verified and connected');
    }, 1100);
  };

  // Handle saving profile
  const handleSaveProfile = () => {
    if (savingProfLoading) return;
    setSavingProfLoading(true);
    setTimeout(() => {
      const full = `${editFirstName} ${editLastName}`.trim();
      setProfName(full || 'Maya Chen');
      setSavingProfLoading(false);
      setIsEditingProf(false);
      showToast('Profile updated');
    }, 650);
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
              className="rail-logo"
              style={{ position: 'absolute', left: 16, top: 20, transition: 'all 0.18s ease' }}
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
              <div className="stat">
                <div className="a1">
                  <i className="ti ti-clock" style={{ fontSize: 16 }} />
                  Pending
                </div>
                <div className="a2">$12.00</div>
                <div className="a3">In the 30-day hold</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-calendar-event" style={{ fontSize: 16 }} />
                  Payable
                </div>
                <div className="a2">$6.00</div>
                <div className="a3">Next weekly payout run</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-send" style={{ fontSize: 16 }} />
                  Paid out
                </div>
                <div className="a2">$188.00</div>
                <div className="a3">Sent to your Stripe balance</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-arrow-back-up" style={{ fontSize: 16 }} />
                  Reversed
                </div>
                <div className="a2">$4.20</div>
                <div className="a3">2 refunded payments</div>
              </div>
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
              <div className="tr">
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

              <div className="tr">
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

              <div className="tr">
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
                        className={`pb cn2 ne ${savingProfLoading ? 'loading' : ''}`}
                        id="bcn"
                        onClick={() => {
                          if (!savingProfLoading) setIsEditingProf(false);
                        }}
                      >
                        Cancel
                      </div>
                      <div
                        className={`pb sv ne ${savingProfLoading ? 'loading' : ''}`}
                        id="bsv"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          opacity: savingProfLoading ? 0.8 : 1,
                          cursor: savingProfLoading ? 'wait' : 'pointer',
                        }}
                        onClick={handleSaveProfile}
                      >
                        {savingProfLoading ? (
                          <>
                            <Spinner size={13} color="#000" />
                            <span>Saving…</span>
                          </>
                        ) : (
                          'Save'
                        )}
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
                              className={`btn sm ${creatorProcessing['amira'] ? 'loading' : ''}`}
                              style={{
                                opacity: creatorProcessing['amira'] ? 0.75 : 1,
                                cursor: creatorProcessing['amira'] ? 'wait' : 'pointer',
                              }}
                              onClick={() => handleCreatorAction('amira', 'declined')}
                            >
                              {creatorProcessing['amira'] === 'declining' ? (
                                <>
                                  <Spinner size={12} color="#fff" />
                                  <span>Declining…</span>
                                </>
                              ) : (
                                'Decline'
                              )}
                            </div>
                            <div
                              className={`btn wb sm ${creatorProcessing['amira'] ? 'loading' : ''}`}
                              style={{
                                opacity: creatorProcessing['amira'] ? 0.75 : 1,
                                cursor: creatorProcessing['amira'] ? 'wait' : 'pointer',
                              }}
                              onClick={() => handleCreatorAction('amira', 'approved')}
                            >
                              {creatorProcessing['amira'] === 'approving' ? (
                                <>
                                  <Spinner size={12} color="#000" />
                                  <span>Approving…</span>
                                </>
                              ) : (
                                'Approve'
                              )}
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
                              className={`btn sm ${creatorProcessing['dawit'] ? 'loading' : ''}`}
                              style={{
                                opacity: creatorProcessing['dawit'] ? 0.75 : 1,
                                cursor: creatorProcessing['dawit'] ? 'wait' : 'pointer',
                              }}
                              onClick={() => handleCreatorAction('dawit', 'declined')}
                            >
                              {creatorProcessing['dawit'] === 'declining' ? (
                                <>
                                  <Spinner size={12} color="#fff" />
                                  <span>Declining…</span>
                                </>
                              ) : (
                                'Decline'
                              )}
                            </div>
                            <div
                              className={`btn wb sm ${creatorProcessing['dawit'] ? 'loading' : ''}`}
                              style={{
                                opacity: creatorProcessing['dawit'] ? 0.75 : 1,
                                cursor: creatorProcessing['dawit'] ? 'wait' : 'pointer',
                              }}
                              onClick={() => handleCreatorAction('dawit', 'approved')}
                            >
                              {creatorProcessing['dawit'] === 'approving' ? (
                                <>
                                  <Spinner size={12} color="#000" />
                                  <span>Approving…</span>
                                </>
                              ) : (
                                'Approve'
                              )}
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
                  {/* FORM VIEW: Add funds without background card */}
                  {depositPaymentStep === 'form' && (
                    <div>
                      <div className="h2">Funding</div>
                      <div className="sub" style={{ marginTop: 4 }}>
                        Creators are paid from your wallet. Funds are reserved as soon as an earning is created.
                      </div>

                      {/* Add funds section without any holding background card */}
                      <div style={{ marginTop: 22, maxWidth: 620 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            paddingBottom: 14,
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          <i className="ti ti-wallet" style={{ fontSize: 22, color: '#C9B8FF' }} />
                          <span>Add funds</span>
                          <span className={`pill ${campaignState.fund ? 'l' : ''}`} style={{ marginLeft: 'auto' }}>
                            {campaignState.fund ? 'Funded' : 'Deposit required'}
                          </span>
                        </div>

                        <div style={{ marginTop: 18 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#8d8d94' }}>
                            Amount
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              border: '1px solid #2d2d38',
                              borderRadius: 10,
                              height: 54,
                              padding: '0 16px',
                              marginTop: 8,
                              background: '#16161c',
                            }}
                          >
                            <span style={{ fontSize: 24, color: '#71717a', fontWeight: 600 }}>$</span>
                            <input
                              type="number"
                              value={depositAmount || ''}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                setDepositAmount(val);
                              }}
                              placeholder="500"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                color: '#ffffff',
                                fontSize: 24,
                                fontWeight: 600,
                                width: '100%',
                              }}
                            />
                          </div>

                          {/* Quick selection chips: $250, $500, $1,000, $2,500 */}
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {[250, 500, 1000, 2500].map(amt => {
                              const isSel = depositAmount === amt;
                              return (
                                <span
                                  key={amt}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    height: 32,
                                    padding: '0 14px',
                                    borderRadius: 16,
                                    border: isSel ? '1px solid #C9B8FF' : '1px solid #2b2b36',
                                    background: isSel ? '#C9B8FF' : '#17171e',
                                    color: isSel ? '#17141f' : '#b4b4b8',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onClick={() => setDepositAmount(amt)}
                                >
                                  ${amt.toLocaleString()}
                                </span>
                              );
                            })}
                          </div>

                          {/* Wallet Summary */}
                          <div
                            style={{
                              border: '1px solid #24242e',
                              borderRadius: 10,
                              padding: '12px 16px',
                              marginTop: 18,
                              background: '#14141a',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#9a9a9f', fontSize: 13.5 }}>
                              <span>Wallet now</span>
                              <b style={{ color: '#ffffff', fontWeight: 600 }}>
                                ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#9a9a9f', fontSize: 13.5 }}>
                              <span>After deposit</span>
                              <b style={{ color: '#C9B8FF', fontWeight: 600 }}>
                                ${(walletBalance + (depositAmount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </b>
                            </div>
                          </div>

                          {/* Continue to payment -> triggers dedicated full changed paying screen */}
                          <div
                            className="btn pr"
                            style={{
                              marginTop: 18,
                              height: 46,
                              background: '#C9B8FF',
                              color: '#17141f',
                              borderRadius: 9,
                              fontWeight: 600,
                              fontSize: 15,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              cursor: 'pointer',
                              width: '100%',
                              border: 'none',
                            }}
                            onClick={() => {
                              if (!depositAmount || depositAmount <= 0) {
                                showToast('Please enter a valid deposit amount.');
                                return;
                              }
                              setDepositPaymentStep('checkout');
                            }}
                          >
                            <i className="ti ti-credit-card" style={{ fontSize: 18 }} />
                            <span>Continue to payment</span>
                          </div>
                        </div>
                      </div>

                      <div className="dv" style={{ marginTop: 36, marginBottom: 28 }} />
                      <div className="h2">Payment Methods</div>
                      <div className="sub" style={{ marginTop: 4 }}>
                        Choose accepted payment methods for deposits.
                      </div>

                      <div className="card" style={{ marginTop: 18, overflow: 'hidden' }}>
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
                          <span className="tg" onClick={e => e.currentTarget.classList.toggle('on')} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FULL CHANGED ONE PAYING SCREEN ONLY FOR DEPOSIT */}
                  {depositPaymentStep === 'checkout' && (
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#C9B8FF',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginBottom: 20,
                        }}
                        onClick={() => setDepositPaymentStep('form')}
                      >
                        <i className="ti ti-arrow-left" style={{ fontSize: 16 }} />
                        <span>Back to Payments</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>
                            Complete Deposit Payment
                          </div>
                          <div style={{ fontSize: 14, color: '#9a9a9f', marginTop: 4 }}>
                            Authorize payment to credit your affiliate wallet and activate creator campaigns.
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9be3c6', fontSize: 13, background: 'rgba(155, 227, 198, 0.1)', padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(155, 227, 198, 0.25)' }}>
                          <i className="ti ti-shield-check" style={{ fontSize: 16 }} />
                          <span>256-bit encrypted Stripe checkout</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isBelow900 ? '1fr' : '1.3fr 1fr', gap: 24, marginTop: 28, alignItems: 'start' }}>
                        {/* Left: Payment Method Selection */}
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                            Select Payment Method
                          </div>

                          {/* Payment Method Tabs */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
                            {[
                              { id: 'card', label: 'Card', icon: 'ti-credit-card' },
                              { id: 'apple', label: 'Apple Pay', icon: 'ti-brand-apple' },
                              { id: 'google', label: 'Google Pay', icon: 'ti-brand-google' },
                              { id: 'bank', label: 'Bank', icon: 'ti-building-bank' },
                            ].map(m => (
                              <div
                                key={m.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                  padding: '12px 6px',
                                  borderRadius: 10,
                                  border: depositPaymentMethod === m.id ? '1px solid #C9B8FF' : '1px solid #262632',
                                  background: depositPaymentMethod === m.id ? 'rgba(201, 184, 255, 0.1)' : '#141418',
                                  color: depositPaymentMethod === m.id ? '#C9B8FF' : '#9a9a9f',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease',
                                }}
                                onClick={() => setDepositPaymentMethod(m.id as 'card' | 'apple' | 'google' | 'bank')}
                              >
                                <i className={`ti ${m.icon}`} style={{ fontSize: 18 }} />
                                <span>{m.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Card selector */}
                          {depositPaymentMethod === 'card' && (
                            <div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {cards.map(card => {
                                  const isSelected = depositCardId === card.id;
                                  return (
                                    <div
                                      key={card.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        borderRadius: 10,
                                        border: isSelected ? '1px solid #C9B8FF' : '1px solid #23232c',
                                        background: isSelected ? '#191823' : '#141418',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => setDepositCardId(card.id)}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 34, height: 24, borderRadius: 4, background: '#22222a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                                          {card.b}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 600 }}>{card.l}</div>
                                          <div style={{ fontSize: 12.5, color: '#8d8d94' }}>Expires {card.e}</div>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          width: 18,
                                          height: 18,
                                          borderRadius: '50%',
                                          border: isSelected ? '5px solid #C9B8FF' : '2px solid #555',
                                          background: '#121216',
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  marginTop: 12,
                                  color: '#C9B8FF',
                                  fontSize: 13.5,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                }}
                                onClick={() => setAddCardOpen(true)}
                              >
                                <i className="ti ti-plus" />
                                <span>Use a different card</span>
                              </div>
                            </div>
                          )}

                          {depositPaymentMethod === 'apple' && (
                            <div style={{ padding: 24, textAlign: 'center', borderRadius: 10, border: '1px solid #262632', background: '#141418' }}>
                              <i className="ti ti-brand-apple" style={{ fontSize: 32, color: '#fff' }} />
                              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 8 }}>Apple Pay Ready</div>
                              <div style={{ fontSize: 13, color: '#9a9a9f', marginTop: 4 }}>Touch ID / Face ID will be requested to authorize ${depositAmount.toFixed(2)}.</div>
                            </div>
                          )}

                          {depositPaymentMethod === 'google' && (
                            <div style={{ padding: 24, textAlign: 'center', borderRadius: 10, border: '1px solid #262632', background: '#141418' }}>
                              <i className="ti ti-brand-google" style={{ fontSize: 30, color: '#fff' }} />
                              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 8 }}>Google Pay Ready</div>
                              <div style={{ fontSize: 13, color: '#9a9a9f', marginTop: 4 }}>Fast checkout with your Google account.</div>
                            </div>
                          )}

                          {depositPaymentMethod === 'bank' && (
                            <div style={{ padding: 24, textAlign: 'center', borderRadius: 10, border: '1px solid #262632', background: '#141418' }}>
                              <i className="ti ti-building-bank" style={{ fontSize: 30, color: '#C9B8FF' }} />
                              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 8 }}>ACH Direct Bank Debit</div>
                              <div style={{ fontSize: 13, color: '#9a9a9f', marginTop: 4 }}>Standard ACH settlement within 2 business days. Instant funds advance.</div>
                            </div>
                          )}

                          {/* Pay Button */}
                          <div
                            className={`btn pr ${fundingLoading ? 'loading' : ''}`}
                            style={{
                              marginTop: 24,
                              height: 48,
                              background: '#C9B8FF',
                              color: '#17141f',
                              borderRadius: 10,
                              fontWeight: 700,
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              cursor: fundingLoading ? 'wait' : 'pointer',
                              width: '100%',
                              border: 'none',
                            }}
                            onClick={() => {
                              if (fundingLoading) return;
                              setFundingLoading(true);
                              setTimeout(() => {
                                setWalletBalance(prev => prev + depositAmount);
                                setCampaignState(prev => ({ ...prev, fund: true }));
                                setFundingLoading(false);
                                setDepositPaymentStep('success');
                                showToast(`Deposit of $${depositAmount.toFixed(2)} completed!`);
                              }, 1100);
                            }}
                          >
                            {fundingLoading ? (
                              <>
                                <Spinner size={18} color="#17141f" />
                                <span>Authorizing payment with Stripe…</span>
                              </>
                            ) : (
                              <>
                                <i className="ti ti-lock" style={{ fontSize: 17 }} />
                                <span>Pay ${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Now</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Order / Deposit Breakdown */}
                        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #282834', background: '#14141a' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', paddingBottom: 12, borderBottom: '1px solid #22222c' }}>
                            Deposit Breakdown
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, fontSize: 13.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9a9f' }}>
                              <span>Deposit Amount</span>
                              <span style={{ color: '#fff', fontWeight: 600 }}>${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9a9f' }}>
                              <span>Campaign Pool</span>
                              <span style={{ color: '#fff' }}>Palazzo Lens</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9be3c6' }}>
                              <span>Processing Fee</span>
                              <span>$0.00 (Free)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9a9f' }}>
                              <span>Current Wallet</span>
                              <span style={{ color: '#fff' }}>${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C9B8FF', paddingTop: 8, borderTop: '1px solid #22222c' }}>
                              <span>New Wallet Balance</span>
                              <span style={{ fontWeight: 700 }}>${(walletBalance + depositAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 18, fontWeight: 800, paddingTop: 10, borderTop: '1px solid #22222c', marginTop: 4 }}>
                              <span>Total Due</span>
                              <span>${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FULL CHANGED SUCCESS SCREEN */}
                  {depositPaymentStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '40px 16px', maxWidth: 540, margin: '0 auto' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#C9B8FF', color: '#17141f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>
                        <i className="ti ti-check" />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        Deposit Complete! 🎉
                      </div>
                      <div style={{ fontSize: 15, color: '#9a9a9f', marginTop: 8, lineHeight: 1.5 }}>
                        ${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been credited to your creator wallet. Your campaign is funded and ready.
                      </div>

                      <div style={{ marginTop: 28, background: '#14141a', border: '1px solid #24242e', borderRadius: 12, padding: 18, textAlign: 'left', fontSize: 13.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94' }}>
                          <span>Transaction Ref</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>#UMI-DEP-9824</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94', marginTop: 8 }}>
                          <span>Amount Credited</span>
                          <span style={{ color: '#C9B8FF', fontWeight: 600 }}>${depositAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94', marginTop: 8 }}>
                          <span>Updated Wallet Balance</span>
                          <span style={{ color: '#fff', fontWeight: 700 }}>${walletBalance.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94', marginTop: 8 }}>
                          <span>Campaign Status</span>
                          <span style={{ color: '#9be3c6', fontWeight: 600 }}>Funded · Active</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center' }}>
                        <div
                          className="btn sm"
                          style={{ height: 42, padding: '0 20px', background: '#22222a', color: '#fff', fontSize: 14 }}
                          onClick={() => setDepositPaymentStep('form')}
                        >
                          Back to Payments
                        </div>
                        <div
                          className="btn pr sm"
                          style={{ height: 42, padding: '0 20px', background: '#C9B8FF', color: '#17141f', fontSize: 14, fontWeight: 600 }}
                          onClick={() => navigateTo('join')}
                        >
                          View Joined Campaign
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Setup Banner - only shown when finishing setup, hidden when live */}
                  {!isLive && (
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
                            Finish setting up
                          </div>
                          <div
                            id="scd"
                            style={{ fontSize: 14.5, lineHeight: '20px', color: '#3a3158' }}
                          >
                            Creators can’t earn until Apple purchases can be verified and your wallet is funded.
                          </div>
                        </div>

                        {firstIncomplete > 0 && (
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
                  )}

                  {/* 4 Stat Boxes */}
                  <div className="stat-grid" id="ist4" style={{ marginTop: 26 }}>
                    {isLive ? (
                      <>
                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-chart-bar" style={{ fontSize: 16 }} />
                            Attributed revenue
                          </div>
                          <div className="a2">$4,820.00</div>
                          <div className="a3">$612.00 last week</div>
                        </div>

                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-users" style={{ fontSize: 16 }} />
                            Paying subscribers
                          </div>
                          <div className="a2">214</div>
                          <div className="a3">31 last week</div>
                        </div>

                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-percentage" style={{ fontSize: 16 }} />
                            Creator earnings
                          </div>
                          <div className="a2">$819.40</div>
                          <div className="a3">20% share · $81.94 fee</div>
                        </div>

                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-wallet" style={{ fontSize: 16 }} />
                            Wallet balance
                          </div>
                          <div className="a2">$1,098.66</div>
                          <div className="a3">$196.60 reserved</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-chart-bar" style={{ fontSize: 16 }} />
                            Attributed revenue
                          </div>
                          <div className="a2" style={{ color: '#6f6f74' }}>
                            $0.00
                          </div>
                          <div className="a3">—</div>
                        </div>

                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-users" style={{ fontSize: 16 }} />
                            Paying subscribers
                          </div>
                          <div className="a2" style={{ color: '#6f6f74' }}>
                            0
                          </div>
                          <div className="a3">—</div>
                        </div>

                        <div className="stat">
                          <div className="a1">
                            <i className="ti ti-percentage" style={{ fontSize: 16 }} />
                            Creator earnings
                          </div>
                          <div className="a2" style={{ color: '#6f6f74' }}>
                            $0.00
                          </div>
                          <div className="a3">20% share</div>
                        </div>

                        <div className="stat">
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
                        onClick={() => {
                          setSnTab('b');
                          setProViewStep('plan');
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <i className="ti ti-crown" style={{ color: '#C9B8FF' }} />
                          <span>umi Pro</span>
                        </div>
                        {isProSubscriber && (
                          <span style={{ fontSize: 10, background: '#C9B8FF', color: '#17141f', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div
                        className={snTab === 'docs' ? 'a' : ''}
                        onClick={() => setSnTab('docs')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        <i className="ti ti-book" />
                        <span>Documentation</span>
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
                            App key, App Store connection, API tokens and SDK.
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
                            <i className="ti ti-code" style={{ fontSize: 30, color: '#C9B8FF' }} />
                            <div style={{ flex: 1 }}>
                              <div className="a1" style={{ fontSize: 17, fontWeight: 500 }}>
                                Developer console & API keys
                              </div>
                              <div style={{ fontSize: 14.5, color: '#9a9a9f' }}>
                                Manage API access tokens, App Store Connect keys, and client SDKs.
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

                      {/* TAB docs: Documentation redirect button card in Personal Settings */}
                      {snTab === 'docs' && (
                        <div className="spn" data-p="docs">
                          <div className="h2">Developer Documentation</div>
                          <div className="sub" style={{ marginTop: 4 }}>
                            Guides, SDK references, webhook event schemas, and integration documentation.
                          </div>

                          <div className="card" style={{ marginTop: 20, padding: 24, background: '#121215', borderColor: '#232328', borderRadius: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#C9B8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#17141f', fontSize: 24, flexShrink: 0 }}>
                                <i className="ti ti-book" />
                              </div>
                              <div style={{ flex: 1, minWidth: 220 }}>
                                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Umi Developer Center</div>
                                <div style={{ fontSize: 14, color: '#9a9a9f', marginTop: 2 }}>
                                  Full documentation for iOS (Swift), Android (Kotlin), React Native, and Node.js.
                                </div>
                              </div>
                              <div
                                className="btn wb"
                                style={{ height: 40, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#C9B8FF', color: '#17141f', fontWeight: 600, borderRadius: 8 }}
                                onClick={() => navigateTo('docs')}
                              >
                                <span>Open Full Documentation Tab</span>
                                <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isBelow900 ? '1fr' : 'repeat(2, 1fr)', gap: 12, marginTop: 22 }}>
                              <div
                                style={{ padding: '14px 16px', borderRadius: 10, background: '#17171d', border: '1px solid #252530', cursor: 'pointer' }}
                                onClick={() => navigateTo('docs', 'intro')}
                              >
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className="ti ti-rocket" style={{ color: '#C9B8FF' }} /> Quickstart Guide
                                </div>
                                <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 4 }}>Get up and running with attribution tracking in 5 minutes.</div>
                              </div>

                              <div
                                style={{ padding: '14px 16px', borderRadius: 10, background: '#17171d', border: '1px solid #252530', cursor: 'pointer' }}
                                onClick={() => navigateTo('docs', 'sdk')}
                              >
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className="ti ti-brand-apple" style={{ color: '#C9B8FF' }} /> Mobile SDKs
                                </div>
                                <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 4 }}>Swift, Kotlin, and React Native drop-in client libraries.</div>
                              </div>

                              <div
                                style={{ padding: '14px 16px', borderRadius: 10, background: '#17171d', border: '1px solid #252530', cursor: 'pointer' }}
                                onClick={() => navigateTo('docs', 'auth')}
                              >
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className="ti ti-key" style={{ color: '#C9B8FF' }} /> API Keys & Scopes
                                </div>
                                <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 4 }}>Test keys, live keys, token verification, and security scopes.</div>
                              </div>

                              <div
                                style={{ padding: '14px 16px', borderRadius: 10, background: '#17171d', border: '1px solid #252530', cursor: 'pointer' }}
                                onClick={() => navigateTo('docs', 'webhooks')}
                              >
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className="ti ti-webhook" style={{ color: '#C9B8FF' }} /> Webhooks & Payouts
                                </div>
                                <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 4 }}>Receive real-time subscription lifecycle webhooks.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB b: Upgrade to Pro (from upgrade-to-pro_5ab386f5.html & umi_screens_pro_and_funds_79d67558.html) */}
                      {snTab === 'b' && (
                        <div className="spn" data-p="b">
                          <div style={{ maxWidth: 720 }}>
                            {/* 1. PLAN VIEW */}
                            {proViewStep === 'plan' && (
                              <section>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#e5e2fd', color: '#5645be', fontSize: 12, fontWeight: 700 }}>
                                  <i className="ti ti-crown" />
                                  <span>umi Pro</span>
                                </div>

                                <h1 style={{ fontSize: isBelow900 ? 26 : 32, lineHeight: 1.15, margin: '14px 0 8px', fontWeight: 700, color: '#fff' }}>
                                  Keep 100% of what you earn.
                                </h1>
                                <p style={{ color: '#9a9a9f', lineHeight: 1.5, fontSize: 15, margin: 0 }}>
                                  Zero platform fees, daily payouts, and the tools to run campaigns at scale.
                                </p>

                                {/* Toggle Monthly / Annual */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 4, background: '#1b1b22', borderRadius: 10, margin: '22px 0 18px', border: '1px solid #282834' }}>
                                  <button
                                    type="button"
                                    style={{
                                      border: 0,
                                      background: proPlan === 'monthly' ? '#272733' : 'transparent',
                                      color: proPlan === 'monthly' ? '#fff' : '#9a9a9f',
                                      padding: '11px',
                                      borderRadius: 8,
                                      font: 'inherit',
                                      cursor: 'pointer',
                                      fontWeight: proPlan === 'monthly' ? 700 : 500,
                                      fontSize: 14,
                                      transition: 'all 0.15s ease',
                                    }}
                                    onClick={() => setProPlan('monthly')}
                                  >
                                    Monthly
                                  </button>
                                  <button
                                    type="button"
                                    style={{
                                      border: 0,
                                      background: proPlan === 'annual' ? '#272733' : 'transparent',
                                      color: proPlan === 'annual' ? '#fff' : '#9a9a9f',
                                      padding: '11px',
                                      borderRadius: 8,
                                      font: 'inherit',
                                      cursor: 'pointer',
                                      fontWeight: proPlan === 'annual' ? 700 : 500,
                                      fontSize: 14,
                                      transition: 'all 0.15s ease',
                                    }}
                                    onClick={() => setProPlan('annual')}
                                  >
                                    Annual · save 20%
                                  </button>
                                </div>

                                {/* Price display */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0 4px' }}>
                                  <strong style={{ fontSize: isBelow900 ? 38 : 46, fontWeight: 700, color: '#fff' }}>
                                    {proPlan === 'annual' ? '$55' : '$69'}
                                  </strong>
                                  <span style={{ color: '#9a9a9f', fontSize: 16 }}>per month</span>
                                </div>
                                <div style={{ color: '#8d8d94', fontSize: 13.5, marginBottom: 20 }}>
                                  {proPlan === 'annual' ? 'Billed $660 once a year. You save $168.' : 'Cancel anytime. Billed monthly.'}
                                </div>

                                {/* 4 Key Features */}
                                <div style={{ display: 'grid', gridTemplateColumns: isBelow900 ? '1fr' : 'repeat(2, 1fr)', gap: 12, margin: '20px 0' }}>
                                  <div style={{ padding: 14, border: '1px solid #262632', borderRadius: 12, background: '#16161d' }}>
                                    <b style={{ display: 'block', marginBottom: 4, color: '#fff', fontSize: 15 }}>No platform fee</b>
                                    <span style={{ fontSize: 13, color: '#9a9a9f', lineHeight: 1.4 }}>Remove the 10% fee on creator earnings.</span>
                                  </div>
                                  <div style={{ padding: 14, border: '1px solid #262632', borderRadius: 12, background: '#16161d' }}>
                                    <b style={{ display: 'block', marginBottom: 4, color: '#fff', fontSize: 15 }}>Daily payout runs</b>
                                    <span style={{ fontSize: 13, color: '#9a9a9f', lineHeight: 1.4 }}>Get eligible earnings paid every day.</span>
                                  </div>
                                  <div style={{ padding: 14, border: '1px solid #262632', borderRadius: 12, background: '#16161d' }}>
                                    <b style={{ display: 'block', marginBottom: 4, color: '#fff', fontSize: 15 }}>Unlimited keys</b>
                                    <span style={{ fontSize: 13, color: '#9a9a9f', lineHeight: 1.4 }}>Use test and live keys with webhooks.</span>
                                  </div>
                                  <div style={{ padding: 14, border: '1px solid #262632', borderRadius: 12, background: '#16161d' }}>
                                    <b style={{ display: 'block', marginBottom: 4, color: '#fff', fontSize: 15 }}>5 team seats</b>
                                    <span style={{ fontSize: 13, color: '#9a9a9f', lineHeight: 1.4 }}>Invite teammates without sharing a login.</span>
                                  </div>
                                </div>

                                {/* Free vs Pro comparison table */}
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '22px 0 10px' }}>Free vs Pro</h2>
                                <div style={{ border: '1px solid #262632', borderRadius: 12, overflow: 'hidden', fontSize: 13.5, margin: '14px 0 24px', background: '#15151c' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '10px 14px', background: '#1c1c25', fontSize: 12, color: '#9a9a9f', fontWeight: 700, textTransform: 'uppercase' }}>
                                    <div>Feature</div><div>Free</div><div style={{ color: '#C9B8FF' }}>Pro</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Platform fee</div><div>10%</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>0%</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Active campaigns</div><div>3</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>Unlimited</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Payout runs</div><div>Weekly</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>Daily</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Analytics history</div><div>30 days</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>2 years</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Team seats</div><div>1</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>5</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '11px 14px', borderTop: '1px solid #24242f', color: '#dedee2' }}>
                                    <div>Support</div><div>Standard</div><div style={{ color: '#C9B8FF', fontWeight: 600 }}>Priority</div>
                                  </div>
                                </div>

                                {/* Primary Button */}
                                <button
                                  type="button"
                                  style={{
                                    width: '100%',
                                    border: 0,
                                    borderRadius: 10,
                                    padding: '14px 18px',
                                    font: 'inherit',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    cursor: isProSubscriber ? 'default' : 'pointer',
                                    background: isProSubscriber ? '#22222b' : '#C9B8FF',
                                    color: isProSubscriber ? '#8d8d94' : '#17141f',
                                    transition: 'all 0.15s ease',
                                  }}
                                  disabled={isProSubscriber}
                                  onClick={() => setProViewStep('checkout')}
                                >
                                  {isProSubscriber ? 'You’re on Pro' : 'Upgrade to Pro'}
                                </button>
                                <div style={{ textAlign: 'center', fontSize: 12.5, color: '#8d8d94', marginTop: 10 }}>
                                  Secure payment with Stripe · Receipt after every charge
                                </div>
                              </section>
                            )}

                            {/* 2. CHECKOUT VIEW */}
                            {proViewStep === 'checkout' && (
                              <section>
                                <button
                                  type="button"
                                  style={{
                                    border: 0,
                                    background: '#202029',
                                    color: '#fff',
                                    borderRadius: 8,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    marginBottom: 16,
                                  }}
                                  onClick={() => setProViewStep('plan')}
                                >
                                  ← Back to plan
                                </button>

                                <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                                  Upgrade to Pro
                                </h2>
                                <p style={{ color: '#9a9a9f', margin: 0, fontSize: 14 }}>
                                  Review your plan and choose a payment method.
                                </p>

                                <div style={{ border: '1px solid #262632', borderRadius: 12, padding: '4px 16px', margin: '18px 0', background: '#16161d' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #24242e', fontSize: 14, color: '#dedee2' }}>
                                    <span>umi Pro · {proPlan === 'annual' ? 'Annual' : 'Monthly'}</span>
                                    <b style={{ color: '#fff' }}>{proPlan === 'annual' ? '$660.00' : '$69.00'}</b>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #24242e', fontSize: 14, color: '#dedee2' }}>
                                    <span>Tax</span>
                                    <b style={{ color: '#fff' }}>$0.00</b>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                                    <strong>Total today</strong>
                                    <strong style={{ color: '#C9B8FF' }}>{proPlan === 'annual' ? '$660.00' : '$69.00'}</strong>
                                  </div>
                                </div>

                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '18px 0 10px' }}>
                                  Payment method
                                </h3>

                                <label
                                  style={{
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'center',
                                    border: proPaymentMethod === 'visa' ? '1px solid #C9B8FF' : '1px solid #252530',
                                    borderRadius: 10,
                                    padding: 14,
                                    margin: '8px 0',
                                    cursor: 'pointer',
                                    background: proPaymentMethod === 'visa' ? '#1c1b25' : '#16161d',
                                  }}
                                  onClick={() => setProPaymentMethod('visa')}
                                >
                                  <input type="radio" name="promethod" checked={proPaymentMethod === 'visa'} onChange={() => setProPaymentMethod('visa')} style={{ accentColor: '#C9B8FF' }} />
                                  <span style={{ fontSize: 14, color: '#fff' }}>
                                    Visa •••• 4417<br />
                                    <small style={{ color: '#8d8d94' }}>Expires 08/28</small>
                                  </span>
                                </label>

                                <label
                                  style={{
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'center',
                                    border: proPaymentMethod === 'apple' ? '1px solid #C9B8FF' : '1px solid #252530',
                                    borderRadius: 10,
                                    padding: 14,
                                    margin: '8px 0',
                                    cursor: 'pointer',
                                    background: proPaymentMethod === 'apple' ? '#1c1b25' : '#16161d',
                                  }}
                                  onClick={() => setProPaymentMethod('apple')}
                                >
                                  <input type="radio" name="promethod" checked={proPaymentMethod === 'apple'} onChange={() => setProPaymentMethod('apple')} style={{ accentColor: '#C9B8FF' }} />
                                  <span style={{ fontSize: 14, color: '#fff' }}>Apple Pay</span>
                                </label>

                                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '20px 0 16px', fontSize: 13, color: '#9a9a9f', lineHeight: 1.4, cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={proConsent}
                                    onChange={e => setProConsent(e.target.checked)}
                                    style={{ accentColor: '#C9B8FF', marginTop: 2 }}
                                  />
                                  <span>I agree to the Terms and that my plan renews automatically until I cancel.</span>
                                </label>

                                <button
                                  type="button"
                                  style={{
                                    width: '100%',
                                    border: 0,
                                    borderRadius: 10,
                                    padding: '14px 18px',
                                    font: 'inherit',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    cursor: (!proConsent || proProcessing) ? 'not-allowed' : 'pointer',
                                    background: '#C9B8FF',
                                    color: '#17141f',
                                    opacity: (!proConsent || proProcessing) ? 0.55 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                  }}
                                  disabled={!proConsent || proProcessing}
                                  onClick={() => {
                                    setProProcessing(true);
                                    setTimeout(() => {
                                      setProProcessing(false);
                                      setIsProSubscriber(true);
                                      setProViewStep('success');
                                      showToast('Welcome to umi Pro!');
                                    }, 1000);
                                  }}
                                >
                                  {proProcessing ? (
                                    <>
                                      <Spinner size={16} color="#17141f" />
                                      <span>Processing payment…</span>
                                    </>
                                  ) : (
                                    <span>Pay {proPlan === 'annual' ? '$660.00' : '$69.00'}</span>
                                  )}
                                </button>
                                <div style={{ textAlign: 'center', fontSize: 12.5, color: '#8d8d94', marginTop: 10 }}>
                                  Payments are processed securely by Stripe.
                                </div>
                              </section>
                            )}

                            {/* 3. SUCCESS VIEW */}
                            {proViewStep === 'success' && (
                              <section style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ width: 62, height: 62, display: 'grid', placeItems: 'center', margin: '0 auto 16px', borderRadius: '50%', background: '#e5f4e4', color: '#008300', fontSize: 30 }}>
                                  ✓
                                </div>
                                <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                                  You’re on umi Pro
                                </h2>
                                <p style={{ color: '#9a9a9f', margin: '0 0 24px', fontSize: 15 }}>
                                  Zero platform fees start now.
                                </p>
                                <button
                                  type="button"
                                  style={{
                                    border: 0,
                                    borderRadius: 10,
                                    padding: '12px 28px',
                                    font: 'inherit',
                                    fontWeight: 700,
                                    fontSize: 14.5,
                                    cursor: 'pointer',
                                    background: '#C9B8FF',
                                    color: '#17141f',
                                  }}
                                  onClick={() => setProViewStep('plan')}
                                >
                                  Back to Pro
                                </button>
                              </section>
                            )}
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
            {/* Layout at >= 900: two columns 330px + 32px gap + flexible right column */}
            {!isBelow900 ? (
              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
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

                <div style={{ flex: 1, minWidth: 0, maxWidth: 580 }}>
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
                        className={`btn bk ${joinLoading ? 'loading' : ''}`}
                        style={{
                          marginTop: 16,
                          width: '100%',
                          height: 42,
                          fontSize: 16,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: joinLoading ? 0.8 : 1,
                          cursor: joinLoading ? 'wait' : 'pointer',
                        }}
                        onClick={handleToggleJoin}
                      >
                        {joinLoading ? (
                          <>
                            <Spinner size={16} color="#fff" />
                            <span>{joinRequested ? 'Canceling request…' : 'Submitting request…'}</span>
                          </>
                        ) : (
                          joinRequested ? 'Requested' : 'Request to join'
                        )}
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
                      className={`btn bk layout-b-action-btn ${joinLoading ? 'loading' : ''}`}
                      style={{
                        marginTop: 16,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: joinLoading ? 0.8 : 1,
                        cursor: joinLoading ? 'wait' : 'pointer',
                      }}
                      onClick={handleToggleJoin}
                    >
                      {joinLoading ? (
                        <>
                          <Spinner size={16} color="#fff" />
                          <span>{joinRequested ? 'Canceling request…' : 'Submitting request…'}</span>
                        </>
                      ) : (
                        joinRequested ? 'Requested' : 'Request to join'
                      )}
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
          <div className="layout-a-main" style={{ maxWidth: 1040 }}>
            <div
              className="hh"
              style={{
                minHeight: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  className="tl"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#e4d8ff',
                    fontSize: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="ti ti-aperture" />
                </div>
                <div>
                  <div
                    className="h1"
                    style={{
                      fontSize: 28,
                      lineHeight: '34px',
                      fontWeight: 600,
                      letterSpacing: -0.4,
                    }}
                  >
                    Palazzo Lens
                  </div>
                  <div style={{ fontSize: 14.5, color: '#9a9a9f', lineHeight: '20px' }}>
                    20% of subscription revenue · by Maya Chen
                  </div>
                </div>
              </div>
              <span className="pill l">Approved</span>
            </div>

            {/* 4 Analytics Stat Tiles (Top - clean unselected layout like Earnings) */}
            <div className="stat-grid" id="js4" style={{ marginTop: 24 }}>
              <div className="stat">
                <div className="a1">
                  <i className="ti ti-link" style={{ fontSize: 16 }} />
                  Link clicks
                </div>
                <div
                  className="a2"
                  style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                >
                  {codeClaimed ? (214 + simulatedClicks).toString() : '0'}
                </div>
                <div className="a3">{codeClaimed ? `${31 + simulatedClicks} this period` : '—'}</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-users" style={{ fontSize: 16 }} />
                  Referred users
                </div>
                <div
                  className="a2"
                  style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                >
                  {codeClaimed ? '63' : '0'}
                </div>
                <div className="a3">{codeClaimed ? '9 last week' : '—'}</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-user-check" style={{ fontSize: 16 }} />
                  Paying subscribers
                </div>
                <div
                  className="a2"
                  style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                >
                  {codeClaimed ? '18' : '0'}
                </div>
                <div className="a3">{codeClaimed ? '3 last week' : '—'}</div>
              </div>

              <div className="stat">
                <div className="a1">
                  <i className="ti ti-currency-dollar" style={{ fontSize: 16 }} />
                  Earned
                </div>
                <div
                  className="a2"
                  style={{ color: !codeClaimed ? '#6f6f74' : undefined }}
                >
                  {codeClaimed ? '$90.00' : '$0.00'}
                </div>
                <div className="a3">{codeClaimed ? '20% of revenue' : '—'}</div>
              </div>
            </div>

            {/* Analytics Graph */}
            <div style={{ marginTop: 24 }}>
              <SvgChart
                title="Analytics"
                config={joinChartConfig}
                currentKey={joinMetric}
                onSelectKey={setJoinMetric}
              />
            </div>

            <div className="dv" style={{ marginTop: 28 }} />

            <div style={{ marginTop: 24 }}>
              {!codeClaimed ? (
                <div
                  className="card"
                  style={{
                    borderRadius: 14,
                    background: '#121216',
                    border: '1px solid #242430',
                    padding: isBelow900 ? '20px 16px' : '28px 24px',
                    textAlign: 'center',
                    maxWidth: 580,
                    margin: '0 auto',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingBottom: 14,
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontWeight: 600,
                      color: '#fff',
                      fontSize: 15,
                    }}
                  >
                    <i className="ti ti-ticket" style={{ fontSize: 20, color: '#C9B8FF' }} />
                    <span>Claim your code</span>
                    <span className="pill l" style={{ marginLeft: 'auto' }}>Approved</span>
                  </div>

                  <div style={{ padding: '16px 12px 6px' }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 14,
                        background: '#C9B8FF',
                        color: '#2b2150',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        margin: '6px auto 0',
                      }}
                    >
                      <i className="ti ti-camera" />
                    </div>

                    <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginTop: 12 }}>
                      Palazzo Lens
                    </div>

                    <div style={{ color: '#9a9a9f', marginTop: 6, fontSize: 14.5, lineHeight: '22px' }}>
                      You’re approved. Claim your personal link, QR code and creator code to start earning 20% of every subscription.
                    </div>

                    {/* 3 perks list */}
                    <div style={{ textAlign: 'left', margin: '20px auto 0', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C9B8FF', color: '#2b2150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          <i className="ti ti-link" />
                        </div>
                        <span>A personal link and QR code</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C9B8FF', color: '#2b2150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          <i className="ti ti-keyboard" />
                        </div>
                        <span>A creator code to type in the app</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C9B8FF', color: '#2b2150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          <i className="ti ti-lock" />
                        </div>
                        <span>Permanent. You can’t change it later.</span>
                      </div>
                    </div>

                    {/* Claim code CTA */}
                    <div
                      className={`btn pr ${claimingLoading ? 'loading' : ''}`}
                      id="cb"
                      style={{
                        marginTop: 22,
                        height: 44,
                        padding: '0 24px',
                        fontSize: 15,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        background: '#C9B8FF',
                        color: '#2b2150',
                        border: 'none',
                        borderRadius: 10,
                        cursor: claimingLoading ? 'wait' : 'pointer',
                        width: '100%',
                        maxWidth: 260,
                        marginInline: 'auto',
                      }}
                      onClick={handleClaimCode}
                    >
                      {claimingLoading ? (
                        <>
                          <Spinner size={16} color="#2b2150" />
                          <span>Claiming your code…</span>
                        </>
                      ) : (
                        <>
                          <i className="ti ti-ticket" style={{ fontSize: 18 }} />
                          <span>Claim code</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  id="xp"
                  style={{
                    borderRadius: 14,
                    background: '#C9B8FF',
                    color: '#17141f',
                    padding: isBelow900 ? '14px 16px' : '16px 20px',
                    boxShadow: '0 4px 18px rgba(201, 184, 255, 0.14)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#17141f' }}>
                        Your referral link & code
                      </div>
                      <div style={{ fontSize: 13, color: '#3a3158', marginTop: 2 }}>
                        Subscribers through your link or code earn you 20% on every payment.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(23, 20, 31, 0.12)', color: '#241a45', padding: '3px 8px', borderRadius: 6 }}>
                        20% rev share
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(23, 20, 31, 0.12)', color: '#241a45', padding: '3px 8px', borderRadius: 6 }}>
                        6 mo renewals
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(23, 20, 31, 0.12)', color: '#241a45', padding: '3px 8px', borderRadius: 6 }}>
                        30d hold
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: isBelow900 ? 'column' : 'row', gap: 14, marginTop: 14, alignItems: 'stretch' }}>
                    {/* Compact inputs */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#ffffff',
                            border: '1px solid rgba(23, 20, 31, 0.16)',
                            color: '#17141f',
                            borderRadius: 8,
                            height: 36,
                            padding: '0 12px',
                            fontSize: 13.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {claimData?.link}
                        </div>
                        <div
                          id="p1"
                          style={{
                            height: 36,
                            padding: '0 12px',
                            background: '#17141f',
                            color: '#ffffff',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            flexShrink: 0,
                            userSelect: 'none',
                          }}
                          onClick={() => {
                            if (claimData?.link) {
                              navigator.clipboard?.writeText(`https://${claimData.link}`);
                            }
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 1400);
                          }}
                        >
                          <i className={`ti ${copiedLink ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 14 }} />
                          {copiedLink ? 'Copied' : 'Copy link'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#ffffff',
                            border: '1px solid rgba(23, 20, 31, 0.16)',
                            color: '#17141f',
                            borderRadius: 8,
                            height: 36,
                            padding: '0 12px',
                            fontSize: 13.5,
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {claimData?.code}
                        </div>
                        <div
                          id="p2"
                          style={{
                            height: 36,
                            padding: '0 12px',
                            background: '#17141f',
                            color: '#ffffff',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            flexShrink: 0,
                            userSelect: 'none',
                          }}
                          onClick={() => {
                            if (claimData?.code) {
                              navigator.clipboard?.writeText(claimData.code);
                            }
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 1400);
                          }}
                        >
                          <i className={`ti ${copiedCode ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 14 }} />
                          {copiedCode ? 'Copied' : 'Copy code'}
                        </div>
                      </div>
                    </div>

                    {/* QR Code and Actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'rgba(255, 255, 255, 0.45)',
                        border: '1px solid rgba(23, 20, 31, 0.12)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          background: '#fff',
                          borderRadius: 6,
                          padding: 4,
                          lineHeight: 0,
                          border: '1px solid rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setQrModalOpen(true)}
                        title="Click to expand QR"
                      >
                        {claimData && renderQrSvg(claimData.seed, 56)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#17141f' }}>Scan QR</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <div
                            className="btn sm"
                            style={{
                              height: 26,
                              fontSize: 11,
                              padding: '0 8px',
                              background: '#17141f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              gap: 4,
                            }}
                            onClick={() => showToast('QR PNG downloaded')}
                          >
                            <i className="ti ti-download" style={{ fontSize: 12 }} />
                            PNG
                          </div>
                          <div
                            className="btn sm"
                            style={{
                              height: 26,
                              fontSize: 11,
                              padding: '0 8px',
                              background: 'rgba(23, 20, 31, 0.12)',
                              color: '#17141f',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                            onClick={() => setQrModalOpen(true)}
                          >
                            <i className="ti ti-maximize" style={{ fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Social Share Bar & Live Click Attribution Simulator */}
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: '1px solid rgba(23, 20, 31, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#271f3f', marginRight: 4 }}>
                        Quick Share:
                      </span>
                      <div
                        style={{
                          height: 28,
                          padding: '0 10px',
                          borderRadius: 6,
                          background: '#17141f',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const tweet = encodeURIComponent(`Check out Palazzo Lens! Get 20% off your subscription with my link: https://${claimData?.link || 'umi.link/palazzo'}`);
                          window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
                        }}
                      >
                        <i className="ti ti-brand-x" style={{ fontSize: 13 }} />
                        <span>Post on X</span>
                      </div>

                      <div
                        style={{
                          height: 28,
                          padding: '0 10px',
                          borderRadius: 6,
                          background: '#25D366',
                          color: '#073315',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const msg = encodeURIComponent(`Hey! Here is 20% off Palazzo Lens via my creator link: https://${claimData?.link || 'umi.link/palazzo'}`);
                          window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                        }}
                      >
                        <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />
                        <span>WhatsApp</span>
                      </div>

                      <div
                        style={{
                          height: 28,
                          padding: '0 10px',
                          borderRadius: 6,
                          background: '#0077b5',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://${claimData?.link || 'umi.link/palazzo'}`, '_blank');
                        }}
                      >
                        <i className="ti ti-brand-linkedin" style={{ fontSize: 14 }} />
                        <span>LinkedIn</span>
                      </div>

                      <div
                        style={{
                          height: 28,
                          padding: '0 10px',
                          borderRadius: 6,
                          background: 'rgba(23, 20, 31, 0.12)',
                          color: '#17141f',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          navigator.clipboard?.writeText(`Hey! Check out Palazzo Lens. Use my referral link: https://${claimData?.link || 'umi.link/palazzo'} or creator promo code: ${claimData?.code || 'MAYA-VIP'} for 20% off.`);
                          showToast('Share text copied to clipboard');
                        }}
                      >
                        <i className="ti ti-copy" style={{ fontSize: 13 }} />
                        <span>Copy Message</span>
                      </div>
                    </div>

                    {/* Simulator Button */}
                    <div
                      className={`btn sm ${simulatingClick ? 'loading' : ''}`}
                      style={{
                        height: 28,
                        padding: '0 12px',
                        background: '#ffffff',
                        color: '#17141f',
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid rgba(23, 20, 31, 0.2)',
                        borderRadius: 6,
                        cursor: simulatingClick ? 'wait' : 'pointer',
                        gap: 6,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                      onClick={() => {
                        if (simulatingClick) return;
                        setSimulatingClick(true);
                        setTimeout(() => {
                          setSimulatedClicks(c => c + 1);
                          setSimulatingClick(false);
                          showToast('Referral click simulated (+1 click recorded) · Attribution confirmed!');
                        }, 750);
                      }}
                    >
                      {simulatingClick ? (
                        <>
                          <Spinner size={12} color="#17141f" />
                          <span>Simulating…</span>
                        </>
                      ) : (
                        <>
                          <i className="ti ti-click" style={{ fontSize: 13 }} />
                          <span>Simulate link click</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
            {/* 330 CSS px cover (radius 18) + 32 gap + flexible form */}
            <div style={{ display: 'flex', flexDirection: isBelow900 ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
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

              <div style={{ width: isBelow900 ? '100%' : 'auto', flex: 1, minWidth: 0, maxWidth: 580, position: 'relative' }}>
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
                  className={`btn wb ${createCampLoading ? 'loading' : ''}`}
                  style={{
                    marginTop: 38,
                    width: '100%',
                    height: 48,
                    fontSize: 18,
                    borderRadius: 'var(--radius-btn)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    opacity: createCampLoading ? 0.85 : 1,
                    cursor: createCampLoading ? 'wait' : 'pointer',
                  }}
                  onClick={handleCreateCampaign}
                >
                  {createCampLoading ? (
                    <>
                      <Spinner size={20} color="#000" />
                      <span>Creating Campaign…</span>
                    </>
                  ) : (
                    'Create Campaign'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SCREEN 8: WITHDRAW (wd) ---------------- */}
        <div className={`scr ${cur === 'wd' ? 'on' : ''}`} id="wd">
          <div className="layout-b-main">
            {!withdrawDone ? (
              <div id="f1" style={{ display: 'flex', flexDirection: isBelow900 ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
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

                <div style={{ width: isBelow900 ? '100%' : 'auto', flex: 1, minWidth: 0, maxWidth: 580 }}>
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
                          className={`btn wb sm ${savingCardLoading ? 'loading' : ''}`}
                          id="fs"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            opacity: savingCardLoading ? 0.8 : 1,
                            cursor: savingCardLoading ? 'wait' : 'pointer',
                          }}
                          onClick={handleSaveCard}
                        >
                          {savingCardLoading ? (
                            <>
                              <Spinner size={14} color="#000" />
                              <span>Verifying card…</span>
                            </>
                          ) : (
                            'Save card'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`btn wb ${withdrawLoading ? 'loading' : ''}`}
                    id="go"
                    style={{
                      width: '100%',
                      height: 48,
                      marginTop: 20,
                      fontSize: 18,
                      borderRadius: 'var(--radius-btn)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      opacity: withdrawLoading ? 0.85 : 1,
                      cursor: withdrawLoading ? 'wait' : 'pointer',
                    }}
                    onClick={handleWithdrawSubmit}
                  >
                    {withdrawLoading ? (
                      <>
                        <Spinner size={20} color="#000" />
                        <span>Processing transfer…</span>
                      </>
                    ) : (
                      'Withdraw'
                    )}
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
          {/* Top Bar with NO double logo (sidebar rail already has logo) */}
          <div className="dtop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#0a0a0a', borderBottom: '1px solid #1f1f22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{ fontSize: 14.5, color: '#8d8d92', cursor: 'pointer' }}
                onClick={() => navigateTo('pers', 'v')}
              >
                Settings
              </span>
              <span style={{ color: '#4a4a4f', fontSize: 16 }}>/</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Developer Platform</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                className="btn sm"
                style={{ height: 32, padding: '0 12px', fontSize: 13, gap: 6, background: '#17171a', color: '#e2e2e8', border: '1px solid #2a2a30' }}
                onClick={() => navigateTo('docs')}
              >
                <i className="ti ti-book" style={{ fontSize: 14 }} />
                <span>API Docs</span>
              </div>
              <div
                className="btn pr sm"
                style={{ height: 32, padding: '0 12px', fontSize: 13, gap: 6, fontWeight: 600 }}
                onClick={() => {
                  setNewKeyName('');
                  setNewKeyExpiry('never');
                  setNewKeyScopes(['events:track', 'referrals:read']);
                  setJustCreatedKey(null);
                  setCreateKeyModalOpen(true);
                }}
              >
                <i className="ti ti-plus" style={{ fontSize: 13 }} />
                <span>Create API Key</span>
              </div>
            </div>
          </div>

          <div className="dsd" style={{ display: isBelow900 ? 'none' : 'block' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '.1em',
                color: '#7d7d82',
                padding: '0 6px',
                marginBottom: 6,
              }}
            >
              DEVELOPER PLATFORM
            </div>
            <div
              className={`dsi ${devTab === 'asc' ? 'a' : ''}`}
              onClick={() => setDevTab('asc')}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <i className="ti ti-key" style={{ fontSize: 16 }} />
              <span>API Keys & Tokens</span>
            </div>
            <div
              className={`dsi ${devTab === 'sdk' ? 'a' : ''}`}
              onClick={() => setDevTab('sdk')}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <i className="ti ti-device-mobile" style={{ fontSize: 16 }} />
              <span>SDK Setup</span>
            </div>
            <div
              className="dsi"
              onClick={() => navigateTo('docs')}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <i className="ti ti-file-text" style={{ fontSize: 16 }} />
              <span>Documentation</span>
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
                  fontSize: 14.5,
                  fontWeight: 500,
                  borderBottom: devTab === 'asc' ? '2px solid #fff' : '2px solid transparent',
                  color: devTab === 'asc' ? '#fff' : '#8d8d92',
                  cursor: 'pointer',
                  gap: 6,
                }}
                onClick={() => setDevTab('asc')}
              >
                <i className="ti ti-key" style={{ fontSize: 15 }} />
                API Keys
              </div>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14.5,
                  fontWeight: 500,
                  borderBottom: devTab === 'sdk' ? '2px solid #fff' : '2px solid transparent',
                  color: devTab === 'sdk' ? '#fff' : '#8d8d92',
                  cursor: 'pointer',
                  gap: 6,
                }}
                onClick={() => setDevTab('sdk')}
              >
                <i className="ti ti-device-mobile" style={{ fontSize: 15 }} />
                SDK Setup
              </div>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14.5,
                  fontWeight: 500,
                  borderBottom: '2px solid transparent',
                  color: '#8d8d92',
                  cursor: 'pointer',
                  gap: 6,
                }}
                onClick={() => navigateTo('docs')}
              >
                <i className="ti ti-file-text" style={{ fontSize: 15 }} />
                Docs
              </div>
            </div>
          )}

          {/* Content: max 760, starts 292 after sidebar at >= 900 */}
          <div
            className="mobile-content"
            style={{
              marginLeft: isBelow900 ? 0 : 292,
              maxWidth: isBelow900 ? '100%' : 840,
              padding: isSm ? '16px 16px 90px' : '36px 20px 100px',
            }}
          >
            {/* TAB 1: API KEYS & ACCESS TOKENS (Screenshots 4 & 5 UX) */}
            {devTab === 'asc' && (
              <div className="dp2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 27, lineHeight: '36px', fontWeight: 600, letterSpacing: -0.4 }}>
                      API Keys & Access Tokens
                    </div>
                    <div className="sub" style={{ marginTop: 4 }}>
                      Create and manage access keys for client SDK attribution, server webhooks, and REST API calls.
                    </div>
                  </div>
                  <div
                    className="btn pr sm"
                    style={{ height: 38, padding: '0 16px', fontWeight: 600, gap: 6 }}
                    onClick={() => {
                      setNewKeyName('');
                      setNewKeyExpiry('never');
                      setNewKeyScopes(['events:track', 'referrals:read']);
                      setJustCreatedKey(null);
                      setCreateKeyModalOpen(true);
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: 14 }} />
                    <span>Create API Key</span>
                  </div>
                </div>

                {/* Scoped Tokens Notice Banner (Screenshot 4 Supabase style) */}
                <div
                  style={{
                    marginTop: 20,
                    background: '#141418',
                    border: '1px solid #24242d',
                    borderRadius: 12,
                    padding: '16px 18px',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <i className="ti ti-info-circle" style={{ fontSize: 20, color: '#C9B8FF', flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
                      Access tokens can now be scoped
                    </div>
                    <div style={{ fontSize: 13.5, color: '#9a9a9f', marginTop: 4, lineHeight: '20px' }}>
                      Choose which events and projects each new token can reach. Use public client keys inside mobile frontends, and keep full-permission secret tokens in backend environments.
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: '#C9B8FF', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigateTo('docs', 'auth')}
                      >
                        Learn more
                      </span>
                      <span
                        style={{ fontSize: 13, color: '#71717a', cursor: 'pointer' }}
                        onClick={() => showToast('Tip dismissed')}
                      >
                        Dismiss
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and Action Bar (Screenshot 4 & 5 style) */}
                <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: 11, fontSize: 15, color: '#6f6f74' }} />
                      <input
                        className="fi"
                        placeholder="Filter tokens by name or key…"
                        style={{ height: 38, paddingLeft: 34, fontSize: 14 }}
                        value={apiKeySearch}
                        onChange={e => setApiKeySearch(e.target.value)}
                      />
                    </div>
                    <select
                      style={{
                        height: 38,
                        borderRadius: 10,
                        background: '#151518',
                        border: '1px solid #2a2a2e',
                        color: '#d4d4d8',
                        padding: '0 12px',
                        fontSize: 13.5,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                      value={apiKeyScopeFilter}
                      onChange={e => setApiKeyScopeFilter(e.target.value as 'all' | 'events' | 'webhooks' | 'admin')}
                    >
                      <option value="all">All Scopes</option>
                      <option value="events">Events & Referrals</option>
                      <option value="webhooks">Webhooks</option>
                      <option value="admin">Full Access</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      className="btn sm"
                      style={{ height: 38, padding: '0 12px', fontSize: 13, gap: 6, background: '#151518', color: '#c4c4c8' }}
                      onClick={() => navigateTo('docs', 'auth')}
                    >
                      <i className="ti ti-external-link" style={{ fontSize: 13 }} />
                      <span>API Docs</span>
                    </div>
                    <div
                      className="btn sm"
                      style={{ height: 38, padding: '0 12px', fontSize: 13, gap: 6, background: '#151518', color: '#c4c4c8' }}
                      onClick={() => navigateTo('docs', 'sdk')}
                    >
                      <i className="ti ti-terminal-2" style={{ fontSize: 13 }} />
                      <span>CLI Docs</span>
                    </div>
                  </div>
                </div>

                {/* Tokens Table (matching Screenshots 4 & 5) */}
                <div style={{ marginTop: 16, overflowX: 'auto' }}>
                  <table className="tok-table">
                    <thead>
                      <tr>
                        <th className="tok-th" style={{ width: '35%' }}>Token</th>
                        <th className="tok-th" style={{ width: '25%' }}>Scopes</th>
                        <th className="tok-th" style={{ width: '18%' }}>Last Used</th>
                        <th className="tok-th" style={{ width: '12%' }}>Expires</th>
                        <th className="tok-th" style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys
                        .filter(item => {
                          const q = apiKeySearch.toLowerCase();
                          const matchSearch = item.name.toLowerCase().includes(q) || item.keyMasked.toLowerCase().includes(q);
                          if (!matchSearch) return false;
                          if (apiKeyScopeFilter === 'all') return true;
                          if (apiKeyScopeFilter === 'events') return item.scopes.some(s => s.includes('events') || s.includes('referrals'));
                          if (apiKeyScopeFilter === 'webhooks') return item.scopes.some(s => s.includes('webhooks'));
                          if (apiKeyScopeFilter === 'admin') return item.scopes.some(s => s.includes('full') || s.includes('payouts'));
                          return true;
                        })
                        .map(keyItem => (
                          <tr key={keyItem.id} className="tok-tr">
                            <td className="tok-td">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{keyItem.name}</span>
                                {keyItem.scopes.includes('full_access') && (
                                  <span style={{ fontSize: 10, background: '#222227', color: '#a1a1aa', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                    LEGACY
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#8d8d94' }}>
                                  {keyItem.keyMasked}
                                </span>
                                <i
                                  className={`ti ${copiedKeyId === keyItem.id ? 'ti-check' : 'ti-copy'}`}
                                  style={{ fontSize: 12, color: copiedKeyId === keyItem.id ? '#C9B8FF' : '#6f6f74', cursor: 'pointer' }}
                                  onClick={() => {
                                    navigator.clipboard?.writeText(keyItem.fullKey || keyItem.keyMasked);
                                    setCopiedKeyId(keyItem.id);
                                    setTimeout(() => setCopiedKeyId(null), 1200);
                                    showToast('API Key copied to clipboard');
                                  }}
                                  title="Copy token"
                                />
                              </div>
                            </td>
                            <td className="tok-td">
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {keyItem.scopes.map(sc => (
                                  <span key={sc} className={`tok-badge ${keyItem.status === 'expired' ? 'expired' : ''}`}>
                                    {sc}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="tok-td" style={{ color: '#9a9a9f', fontSize: 13.5 }}>
                              {keyItem.lastUsed}
                            </td>
                            <td className="tok-td">
                              <span style={{ fontSize: 13, color: keyItem.status === 'expired' ? '#f05252' : '#9be3c6' }}>
                                {keyItem.expires}
                              </span>
                            </td>
                            <td className="tok-td" style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <div
                                  className="btn sm"
                                  style={{ height: 28, padding: '0 8px', fontSize: 12, background: '#1a1a20', color: '#d4d4d8' }}
                                  onClick={() => {
                                    showToast(`Pinging ${keyItem.name}… 200 OK authenticated`);
                                  }}
                                  title="Test ping authentication"
                                >
                                  <i className="ti ti-activity" style={{ fontSize: 13 }} />
                                </div>
                                <div
                                  className="btn sm"
                                  style={{ height: 28, padding: '0 8px', fontSize: 12, background: '#1a1a20', color: '#f05252' }}
                                  onClick={() => {
                                    setApiKeys(prev => prev.filter(k => k.id !== keyItem.id));
                                    showToast(`Revoked token: ${keyItem.name}`);
                                  }}
                                  title="Revoke token"
                                >
                                  <i className="ti ti-trash" style={{ fontSize: 13 }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="dv" style={{ marginTop: 32 }} />

                {/* Umi Public App Key section */}
                <div className="h2" style={{ marginTop: 28, fontSize: 18 }}>
                  Umi Client App Key
                </div>
                <div style={{ marginTop: 4, fontSize: 14.5, color: '#a6a6aa' }}>
                  Public key for mobile client applications. Safe to bundle directly in your iOS, Android, or React Native apps.
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
                      showToast('App key copied');
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

                {/* App Store Connect key section */}
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
                      className={`btn pr ${devConnectingAsc ? 'loading' : ''}`}
                      style={{
                        marginTop: 18,
                        height: 44,
                        padding: '0 20px',
                        fontSize: 16,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: devConnectingAsc ? 0.8 : 1,
                        cursor: devConnectingAsc ? 'wait' : 'pointer',
                      }}
                      onClick={handleConnectAsc}
                    >
                      {devConnectingAsc ? (
                        <>
                          <Spinner size={16} color="#000" />
                          <span>Verifying with Apple…</span>
                        </>
                      ) : (
                        'Connect App Store'
                      )}
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

            {/* TAB 2: SDK SETUP - 2-Step Flow from umi_create_api_key_and_install_sdk_v2_6d613e08.html */}
            {devTab === 'sdk' && (
              <div className="dp2">
                {/* 2-Step Tab Bar */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 10,
                      border: sdkStep === 1 ? '1px solid #C9B8FF' : '1px solid #282834',
                      background: sdkStep === 1 ? '#C9B8FF' : '#15151b',
                      color: sdkStep === 1 ? '#2b2150' : '#8d8d94',
                      cursor: 'pointer',
                      fontSize: 13.5,
                      fontWeight: sdkStep === 1 ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => setSdkStep(1)}
                  >
                    <i className="ti ti-key" style={{ fontSize: 16 }} />
                    <span>1. Create API key</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 10,
                      border: sdkStep === 2 ? '1px solid #C9B8FF' : '1px solid #282834',
                      background: sdkStep === 2 ? '#C9B8FF' : '#15151b',
                      color: sdkStep === 2 ? '#2b2150' : '#8d8d94',
                      cursor: 'pointer',
                      fontSize: 13.5,
                      fontWeight: sdkStep === 2 ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => {
                      if (!sdkGeneratedKey && apiKeys.length === 0) {
                        setSdkKeyError('Create a key first, then you can install the SDK.');
                        setSdkStep(1);
                        return;
                      }
                      setSdkStep(2);
                    }}
                  >
                    <i className="ti ti-package" style={{ fontSize: 16 }} />
                    <span>2. Install the SDK</span>
                  </div>
                </div>

                {/* STEP 1: CREATE API KEY */}
                {sdkStep === 1 && (
                  <div className="card" style={{ padding: 22, background: '#121216', border: '1px solid #23232c', borderRadius: 14, maxWidth: 640 }}>
                    {sdkGeneratedKey ? (
                      <div>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#C9B8FF', color: '#2b2150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto' }}>
                            <i className="ti ti-check" />
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginTop: 12 }}>
                            Key created
                          </div>
                          <div style={{ color: '#9a9a9f', fontSize: 14, marginTop: 4 }}>
                            {sdkGeneratedKey.name} · {sdkGeneratedKey.env.toUpperCase()} · expires {sdkGeneratedKey.exp === 'Never' ? 'never' : `in ${sdkGeneratedKey.exp}`}
                          </div>
                        </div>

                        {/* Copyable Key Codebox */}
                        <div style={{ border: '1px solid #262632', borderRadius: 10, background: '#17171e', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, wordBreak: 'break-all', gap: 10 }}>
                          <span style={{ color: '#9be3c6' }}>{sdkGeneratedKey.val}</span>
                          <span
                            className="btn sm"
                            style={{ height: 28, padding: '0 10px', fontSize: 12, flexShrink: 0, background: '#252530', color: '#fff' }}
                            onClick={() => {
                              navigator.clipboard?.writeText(sdkGeneratedKey.val);
                              showToast('API key copied to clipboard');
                            }}
                          >
                            <i className="ti ti-copy" style={{ fontSize: 14 }} />
                          </span>
                        </div>

                        <div style={{ border: '1px solid #262632', borderRadius: 10, padding: 12, marginTop: 14, background: '#16161c', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <i className="ti ti-info-circle" style={{ fontSize: 18, color: '#C9B8FF', flexShrink: 0, marginTop: 1 }} />
                          <div style={{ fontSize: 13.5, color: '#9a9a9f', lineHeight: 1.4 }}>
                            This key is public and safe to put in your app. You can copy it again from the key list.
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer', fontSize: 13.5, color: '#dedee2' }}>
                          <input
                            type="checkbox"
                            checked={sdkKeyCopiedConsent}
                            onChange={e => {
                              setSdkKeyCopiedConsent(e.target.checked);
                              setSdkKeyError('');
                            }}
                            style={{ accentColor: '#C9B8FF' }}
                          />
                          <span>I’ve copied this key and I’m ready to add it to my app.</span>
                        </label>

                        {sdkKeyError && (
                          <div style={{ color: '#f05252', fontSize: 13, marginTop: 6 }}>
                            {sdkKeyError}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                          <span
                            className="btn sm"
                            style={{ height: 36, padding: '0 14px', background: '#1c1c24', color: '#fff' }}
                            onClick={() => {
                              setSdkGeneratedKey(null);
                              setSdkKeyCopiedConsent(false);
                              setSdkKeyName('');
                            }}
                          >
                            <i className="ti ti-plus" style={{ fontSize: 14, marginRight: 6 }} />
                            Create another
                          </span>
                          <span
                            className="btn pr sm"
                            style={{ height: 36, padding: '0 18px', background: '#C9B8FF', color: '#2b2150', fontWeight: 600 }}
                            onClick={() => {
                              if (!sdkKeyCopiedConsent) {
                                setSdkKeyError('Confirm you’ve copied the key to continue.');
                                return;
                              }
                              setSdkStep(2);
                            }}
                          >
                            <span>Continue to SDK setup</span>
                            <i className="ti ti-arrow-right" style={{ fontSize: 14, marginLeft: 6 }} />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>
                          <div style={{ fontSize: 19, fontWeight: 600, color: '#fff' }}>Create API key</div>
                          <div style={{ color: '#9a9a9f', fontSize: 14, marginTop: 2 }}>
                            Keys let your app report installs and purchases to umi.
                          </div>
                        </div>

                        {sdkKeyError && (
                          <div style={{ padding: '8px 12px', border: '1px solid rgba(240, 82, 82, 0.3)', borderRadius: 8, background: 'rgba(240, 82, 82, 0.1)', color: '#f05252', fontSize: 13, marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <i className="ti ti-alert-triangle" />
                            <span>{sdkKeyError}</span>
                          </div>
                        )}

                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#8d8d94', marginTop: 16, display: 'block' }}>Key name</label>
                        <input
                          className="fi"
                          placeholder="Palazzo Lens production"
                          value={sdkKeyName}
                          onChange={e => {
                            setSdkKeyName(e.target.value);
                            setSdkKeyError('');
                          }}
                          style={{ width: '100%', marginTop: 5, height: 42 }}
                        />

                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#8d8d94', marginTop: 14, display: 'block' }}>Campaign</label>
                        <select
                          className="fi"
                          value={sdkKeyCampaign}
                          onChange={e => setSdkKeyCampaign(e.target.value)}
                          style={{ width: '100%', marginTop: 5, height: 42, background: '#16161d', color: '#fff' }}
                        >
                          <option>Palazzo Lens</option>
                          <option>Tidal</option>
                          <option>Lumen Habit</option>
                        </select>

                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#8d8d94', marginTop: 14, display: 'block' }}>Environment</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              height: 32,
                              padding: '0 14px',
                              borderRadius: 16,
                              border: sdkKeyEnv === 'test' ? '1px solid #C9B8FF' : '1px solid #282834',
                              background: sdkKeyEnv === 'test' ? '#C9B8FF' : '#17171e',
                              color: sdkKeyEnv === 'test' ? '#2b2150' : '#b4b4b8',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSdkKeyEnv('test')}
                          >
                            <i className="ti ti-flask" />
                            Test
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              height: 32,
                              padding: '0 14px',
                              borderRadius: 16,
                              border: sdkKeyEnv === 'live' ? '1px solid #C9B8FF' : '1px solid #282834',
                              background: sdkKeyEnv === 'live' ? '#C9B8FF' : '#17171e',
                              color: sdkKeyEnv === 'live' ? '#2b2150' : '#b4b4b8',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSdkKeyEnv('live')}
                          >
                            <i className="ti ti-rocket" />
                            Live
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#8d8d94', marginTop: 6 }}>
                          {sdkKeyEnv === 'test' ? 'Test keys never earn creators money. Use while you build.' : 'Live keys count toward payouts. Use in a released app.'}
                        </div>

                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#8d8d94', marginTop: 14, display: 'block' }}>Expires</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          {(['30 days', '90 days', 'Never'] as const).map(x => (
                            <span
                              key={x}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: 30,
                                padding: '0 14px',
                                borderRadius: 15,
                                border: sdkKeyExp === x ? '1px solid #C9B8FF' : '1px solid #282834',
                                background: sdkKeyExp === x ? '#C9B8FF' : '#17171e',
                                color: sdkKeyExp === x ? '#2b2150' : '#b4b4b8',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              onClick={() => setSdkKeyExp(x)}
                            >
                              {x}
                            </span>
                          ))}
                        </div>

                        <div style={{ border: '1px solid #262632', borderRadius: 10, padding: '12px 14px', marginTop: 18, background: '#16161d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <span style={{ fontSize: 13, color: '#8d8d94' }}>One key belongs to one campaign.</span>
                          <span
                            className={`btn pr sm ${sdkGenerating ? 'loading' : ''}`}
                            style={{ height: 36, padding: '0 16px', background: '#C9B8FF', color: '#2b2150', fontWeight: 600, border: 'none' }}
                            onClick={() => {
                              const n = sdkKeyName.trim();
                              if (!n) {
                                setSdkKeyError('Give the key a name.');
                                return;
                              }
                              setSdkGenerating(true);
                              setTimeout(() => {
                                const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
                                let rand = '';
                                for (let i = 0; i < 24; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
                                const fullVal = `umi_${sdkKeyEnv}_${rand}`;
                                const newKeyObj: ApiKeyItem = {
                                  id: `key-${Date.now()}`,
                                  name: n,
                                  keyMasked: `umi_${sdkKeyEnv}_${rand.slice(0, 2)}••••••••••••••••${rand.slice(-5)}`,
                                  fullKey: fullVal,
                                  created: 'Just now',
                                  lastUsed: 'Never',
                                  expires: sdkKeyExp,
                                  status: 'active',
                                  scopes: ['events:track', 'referrals:read', 'purchases:report'],
                                };
                                setApiKeys(prev => [newKeyObj, ...prev]);
                                setSdkGeneratedKey({ name: n, env: sdkKeyEnv, exp: sdkKeyExp, val: fullVal });
                                setSdkGenerating(false);
                                showToast(`Created key: ${n}`);
                              }, 800);
                            }}
                          >
                            {sdkGenerating ? (
                              <>
                                <Spinner size={14} color="#2b2150" />
                                <span>Generating…</span>
                              </>
                            ) : (
                              <>
                                <i className="ti ti-key" style={{ fontSize: 14 }} />
                                <span>Generate key</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: INSTALL THE SDK */}
                {sdkStep === 2 && (
                  <div className="card" style={{ padding: 22, background: '#121216', border: '1px solid #23232c', borderRadius: 14, maxWidth: 680 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Install the SDK</div>
                        <div style={{ color: '#9a9a9f', fontSize: 14, marginTop: 2 }}>
                          Add umi to your app so referrals and purchases are verified.
                        </div>
                      </div>
                      <span
                        className="pill"
                        style={{
                          background: campaignState.sdk ? '#C9B8FF' : '#1f1f28',
                          color: campaignState.sdk ? '#2b2150' : '#8d8d94',
                          fontWeight: 600,
                        }}
                      >
                        {campaignState.sdk ? 'Connected' : 'Not connected'}
                      </span>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px', borderRadius: 14, background: '#C9B8FF', color: '#2b2150', fontSize: 12.5, fontWeight: 600 }}>
                        <i className="ti ti-brand-swift" /> iOS · Swift
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px', borderRadius: 14, background: '#1c1c24', color: '#6f6f74', fontSize: 12.5, opacity: 0.6 }}>
                        Android · soon
                      </span>
                    </div>

                    {/* Step 1: Install Package */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C9B8FF', color: '#2b2150', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        1
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Install the package</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <span
                            style={{
                              height: 26,
                              padding: '0 10px',
                              borderRadius: 13,
                              border: sdkPackageMgr === 'spm' ? '1px solid #C9B8FF' : '1px solid #282834',
                              background: sdkPackageMgr === 'spm' ? '#C9B8FF' : '#17171e',
                              color: sdkPackageMgr === 'spm' ? '#2b2150' : '#8d8d94',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSdkPackageMgr('spm')}
                          >
                            Swift Package Manager
                          </span>
                          <span
                            style={{
                              height: 26,
                              padding: '0 10px',
                              borderRadius: 13,
                              border: sdkPackageMgr === 'pod' ? '1px solid #C9B8FF' : '1px solid #282834',
                              background: sdkPackageMgr === 'pod' ? '#C9B8FF' : '#17171e',
                              color: sdkPackageMgr === 'pod' ? '#2b2150' : '#8d8d94',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSdkPackageMgr('pod')}
                          >
                            CocoaPods
                          </span>
                        </div>

                        <div style={{ border: '1px solid #262632', borderRadius: 8, background: '#16161d', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span>{sdkPackageMgr === 'spm' ? '// Swift Package Manager\nhttps://github.com/umi/umi-ios' : "pod 'Umi', '~> 1.0'"}</span>
                          <span
                            className="btn sm"
                            style={{ height: 26, padding: '0 8px', background: '#22222b', color: '#fff' }}
                            onClick={() => {
                              navigator.clipboard?.writeText(sdkPackageMgr === 'spm' ? 'https://github.com/umi/umi-ios' : "pod 'Umi', '~> 1.0'");
                              showToast('Package url copied');
                            }}
                          >
                            <i className="ti ti-copy" style={{ fontSize: 13 }} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Add your key */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C9B8FF', color: '#2b2150', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        2
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Add your key</div>
                        <select
                          className="fi"
                          style={{ width: '100%', marginTop: 8, height: 38, background: '#16161d', color: '#fff', fontSize: 13 }}
                          value={sdkSelectedKeyIdx}
                          onChange={e => setSdkSelectedKeyIdx(Number(e.target.value))}
                        >
                          {apiKeys.map((k, i) => (
                            <option key={k.id} value={i}>
                              {k.name} · {k.keyMasked}
                            </option>
                          ))}
                        </select>

                        <div style={{ border: '1px solid #262632', borderRadius: 8, background: '#16161d', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span>
                            <span style={{ color: '#C9B8FF' }}>Umi</span>.configure(appKey: <span style={{ color: '#9be3c6' }}>"{apiKeys[sdkSelectedKeyIdx]?.fullKey || apiKeys[sdkSelectedKeyIdx]?.keyMasked || 'umi_live_8f2kQ4mT9x'}"</span>)
                          </span>
                          <span
                            className="btn sm"
                            style={{ height: 26, padding: '0 8px', background: '#22222b', color: '#fff' }}
                            onClick={() => {
                              const code = `Umi.configure(appKey: "${apiKeys[sdkSelectedKeyIdx]?.fullKey || apiKeys[sdkSelectedKeyIdx]?.keyMasked || 'umi_live_8f2kQ4mT9x'}")`;
                              navigator.clipboard?.writeText(code);
                              showToast('Config snippet copied');
                            }}
                          >
                            <i className="ti ti-copy" style={{ fontSize: 13 }} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Resolve the referral */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C9B8FF', color: '#2b2150', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        3
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Resolve the referral</div>
                        <div style={{ border: '1px solid #262632', borderRadius: 8, background: '#16161d', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span>
                            <span style={{ color: '#C9B8FF' }}>Umi</span>.resolveReferral()<br />
                            <span style={{ color: '#6f6f74' }}>// No referral? Show a code field:</span><br />
                            <span style={{ color: '#C9B8FF' }}>Umi</span>.claimCreatorCode(code)
                          </span>
                          <span
                            className="btn sm"
                            style={{ height: 26, padding: '0 8px', background: '#22222b', color: '#fff' }}
                            onClick={() => {
                              navigator.clipboard?.writeText('Umi.resolveReferral()\n// No referral? Show a code field:\nUmi.claimCreatorCode(code)');
                              showToast('Referral resolution snippet copied');
                            }}
                          >
                            <i className="ti ti-copy" style={{ fontSize: 13 }} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Bind and report purchases */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C9B8FF', color: '#2b2150', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        4
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Bind and report purchases</div>
                        <div style={{ border: '1px solid #262632', borderRadius: 8, background: '#16161d', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span>
                            <span style={{ color: '#C9B8FF' }}>Umi</span>.bind(appAccountToken: token)<br />
                            <span style={{ color: '#6f6f74' }}>// after a purchase</span><br />
                            <span style={{ color: '#C9B8FF' }}>Umi</span>.reportTransaction(transaction.id)
                          </span>
                          <span
                            className="btn sm"
                            style={{ height: 26, padding: '0 8px', background: '#22222b', color: '#fff' }}
                            onClick={() => {
                              navigator.clipboard?.writeText('Umi.bind(appAccountToken: token)\n// after a purchase\nUmi.reportTransaction(transaction.id)');
                              showToast('Purchase tracking snippet copied');
                            }}
                          >
                            <i className="ti ti-copy" style={{ fontSize: 13 }} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 5: Verify the connection */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 24, borderTop: '1px solid #22222b', paddingTop: 20 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C9B8FF', color: '#2b2150', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        5
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Verify the connection</div>
                        {sdkVerificationStage === 0 ? (
                          <span
                            className="btn pr sm"
                            style={{ marginTop: 10, height: 36, padding: '0 16px', background: '#C9B8FF', color: '#2b2150', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={() => {
                              setSdkVerifying(true);
                              setSdkVerificationStage(1);
                              setTimeout(() => {
                                setSdkVerificationStage(2);
                                setTimeout(() => {
                                  setSdkVerificationStage(3);
                                  setTimeout(() => {
                                    setSdkVerificationStage(4);
                                    setSdkVerifying(false);
                                    setCampaignState(prev => ({ ...prev, sdk: true }));
                                    showToast('SDK connection successfully verified');
                                  }, 750);
                                }, 750);
                              }, 750);
                            }}
                          >
                            <i className="ti ti-send" />
                            <span>Send test event</span>
                          </span>
                        ) : (
                          <div style={{ marginTop: 12, maxWidth: 380 }}>
                            {['API key is valid', 'App Store is connected', 'Test event received'].map((txt, idx) => {
                              const stepNum = idx + 1;
                              if (stepNum > sdkVerificationStage) return null;
                              const isDone = sdkVerificationStage > stepNum || sdkVerificationStage === 4;
                              return (
                                <div key={txt} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 13.5, color: '#dedee2' }}>
                                  <span>{txt}</span>
                                  {isDone ? (
                                    <i className="ti ti-circle-check" style={{ color: '#C9B8FF', fontSize: 18 }} />
                                  ) : (
                                    <Spinner size={14} color="#C9B8FF" />
                                  )}
                                </div>
                              );
                            })}

                            {/* Progress bar */}
                            <div style={{ height: 4, borderRadius: 2, background: '#242430', marginTop: 10, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  borderRadius: 2,
                                  background: '#C9B8FF',
                                  width: `${Math.round(((sdkVerificationStage - 1) / 3) * 100)}%`,
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>

                            {sdkVerificationStage === 4 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontWeight: 600, color: '#C9B8FF', fontSize: 14.5 }}>
                                <i className="ti ti-circle-check" style={{ fontSize: 18 }} />
                                <span>SDK connected</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= SCREEN 10: DOCUMENTATION SCREEN (docs - Screenshot 3 style) ================= */}
        <div className={`scr ${cur === 'docs' ? 'on' : ''}`} id="docs">
          {/* Supabase Docs Style Header */}
          <div className="docs-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigateTo('disc')}>
                <svg width="22" height="22" viewBox="0 0 30 30" fill="#C9B8FF">
                  <ellipse cx="15" cy="8" rx="4.6" ry="7" />
                  <ellipse cx="15" cy="22" rx="4.6" ry="7" />
                  <ellipse cx="8" cy="15" rx="7" ry="4.6" />
                  <ellipse cx="22" cy="15" rx="7" ry="4.6" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>umi</span>
                <span style={{ fontSize: 11, background: '#25252d', color: '#9be3c6', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  DOCS
                </span>
              </div>

              {/* Breadcrumb / Top category links */}
              {!isBelow900 && (
                <div style={{ display: 'flex', gap: 18, marginLeft: 20, fontSize: 14, color: '#8d8d94' }}>
                  <span style={{ cursor: 'pointer', color: docCategory === 'intro' ? '#fff' : '#8d8d94' }} onClick={() => setDocCategory('intro')}>Start</span>
                  <span style={{ cursor: 'pointer', color: docCategory === 'auth' ? '#fff' : '#8d8d94' }} onClick={() => setDocCategory('auth')}>Authentication</span>
                  <span style={{ cursor: 'pointer', color: docCategory === 'sdk' ? '#fff' : '#8d8d94' }} onClick={() => setDocCategory('sdk')}>SDKs</span>
                  <span style={{ cursor: 'pointer', color: docCategory === 'api' ? '#fff' : '#8d8d94' }} onClick={() => setDocCategory('api')}>Management API</span>
                  <span style={{ cursor: 'pointer', color: docCategory === 'webhooks' ? '#fff' : '#8d8d94' }} onClick={() => setDocCategory('webhooks')}>Webhooks</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Search box */}
              <div style={{ position: 'relative', width: isSm ? 140 : 220 }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 14, color: '#6f6f74' }} />
                <input
                  style={{
                    width: '100%',
                    height: 32,
                    borderRadius: 7,
                    background: '#151518',
                    border: '1px solid #232328',
                    color: '#fff',
                    padding: '0 10px 0 30px',
                    fontSize: 13,
                    outline: 'none',
                  }}
                  placeholder="Search docs… (Ctrl K)"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                />
              </div>

              <div
                className="btn sm"
                style={{ height: 32, padding: '0 12px', fontSize: 13, gap: 6, background: '#C9B8FF', color: '#0a0a0a', fontWeight: 600 }}
                onClick={() => navigateTo('dev')}
              >
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
                <span>Back to Developer</span>
              </div>
            </div>
          </div>

          {/* Docs Body (2 Columns) */}
          <div style={{ display: 'flex' }}>
            {/* Left Docs Navigation Sidebar */}
            {!isBelow900 && (
              <div className="docs-sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px 14px', borderBottom: '1px solid #1a1a1e' }}>
                  <i className="ti ti-api" style={{ fontSize: 18, color: '#C9B8FF' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Management API</span>
                </div>

                <div className="docs-nav-group-title">GETTING STARTED</div>
                <div className={`docs-nav-item ${docCategory === 'intro' ? 'active' : ''}`} onClick={() => setDocCategory('intro')}>
                  <i className="ti ti-compass" />
                  <span>Introduction</span>
                </div>
                <div className={`docs-nav-item ${docCategory === 'sdk' ? 'active' : ''}`} onClick={() => setDocCategory('sdk')}>
                  <i className="ti ti-rocket" />
                  <span>Quickstart Guide</span>
                </div>

                <div className="docs-nav-group-title">AUTHENTICATION</div>
                <div className={`docs-nav-item ${docCategory === 'auth' ? 'active' : ''}`} onClick={() => setDocCategory('auth')}>
                  <i className="ti ti-lock" />
                  <span>Access Tokens (PAT)</span>
                </div>
                <div className="docs-nav-item" onClick={() => setDocCategory('auth')}>
                  <i className="ti ti-shield-check" />
                  <span>Token Scopes & Roles</span>
                </div>

                <div className="docs-nav-group-title">REST API ENDPOINTS</div>
                <div className={`docs-nav-item ${docCategory === 'api' ? 'active' : ''}`} onClick={() => setDocCategory('api')}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#9be3c6' }}>POST</span>
                  <span>/v1/referrals/track</span>
                </div>
                <div className="docs-nav-item" onClick={() => setDocCategory('api')}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#9be3c6' }}>GET</span>
                  <span>/v1/campaigns</span>
                </div>
                <div className="docs-nav-item" onClick={() => setDocCategory('api')}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#9be3c6' }}>POST</span>
                  <span>/v1/creators/claim</span>
                </div>

                <div className="docs-nav-group-title">WEBHOOKS</div>
                <div className={`docs-nav-item ${docCategory === 'webhooks' ? 'active' : ''}`} onClick={() => setDocCategory('webhooks')}>
                  <i className="ti ti-bell-ringing" />
                  <span>Webhook Security</span>
                </div>
                <div className="docs-nav-item" onClick={() => setDocCategory('webhooks')}>
                  <i className="ti ti-list-check" />
                  <span>Event Types</span>
                </div>
              </div>
            )}

            {/* Right Docs Content Panel */}
            <div className="docs-content" style={{ padding: isBelow900 ? '20px 16px 80px' : '36px 48px 120px' }}>
              <div style={{ fontSize: 14, color: '#8d8d94' }}>
                Docs <span style={{ margin: '0 6px', color: '#444' }}>/</span> Management API <span style={{ margin: '0 6px', color: '#444' }}>/</span> <span style={{ color: '#fff' }}>Authentication</span>
              </div>

              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginTop: 12 }}>
                Management API
              </div>
              <div style={{ fontSize: 16, color: '#a1a1aa', marginTop: 8, lineHeight: '24px' }}>
                Manage your Umi organizations, creator campaigns, and referral attribution programmatically.
              </div>

              {/* Authentication Section matching Screenshot 3 */}
              <div style={{ marginTop: 36 }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>Authentication</div>
                <div style={{ fontSize: 15, color: '#d4d4d8', marginTop: 12, lineHeight: '24px' }}>
                  All API requests require an access token to be included in the Authorization header:
                </div>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>HTTP Header</span>
                    <i
                      className="ti ti-copy"
                      style={{ cursor: 'pointer', color: '#9a9a9f' }}
                      onClick={() => {
                        navigator.clipboard?.writeText('Authorization: Bearer <access_token>');
                        showToast('Copied header format');
                      }}
                    />
                  </div>
                  <pre style={{ padding: 16, margin: 0, fontFamily: 'var(--font-mono)', fontSize: 14, color: '#C9B8FF' }}>
                    <code>Authorization: Bearer &lt;access_token&gt;</code>
                  </pre>
                </div>

                <div style={{ fontSize: 15, color: '#d4d4d8', marginTop: 24, lineHeight: '24px' }}>
                  There are two ways to generate and use an access token:
                </div>

                {/* Point 1: PAT */}
                <div style={{ marginTop: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#222228', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C9B8FF', flexShrink: 0, marginTop: 2 }}>
                    1
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      Personal Access Token (PAT):
                    </div>
                    <div style={{ fontSize: 14.5, color: '#a1a1aa', marginTop: 4, lineHeight: '22px' }}>
                      PATs are tokens with custom expiry that you manually generate in the Developer Console. They are useful for automating workflows, backend server-to-server tracking, or developing against the Management API. A scoped PAT can only reach the specific campaigns and permissions you choose when creating it.
                    </div>
                    <div style={{ marginTop: 10 }}>
                      To generate or manage your personal access tokens, visit your{' '}
                      <span
                        style={{ color: '#C9B8FF', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => navigateTo('dev', 'asc')}
                      >
                        Developer console
                      </span>
                      .
                    </div>
                  </div>
                </div>

                {/* Point 2: SDK App Key */}
                <div style={{ marginTop: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#222228', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C9B8FF', flexShrink: 0, marginTop: 2 }}>
                    2
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      Client App Key:
                    </div>
                    <div style={{ fontSize: 14.5, color: '#a1a1aa', marginTop: 4, lineHeight: '22px' }}>
                      Public client token used directly inside iOS and Android mobile binaries. Client keys only permit referral resolution and StoreKit purchase verification events.
                    </div>
                  </div>
                </div>

                {/* Interactive API Endpoint Sandbox (Screenshot 3 style) */}
                <div style={{ marginTop: 36, border: '1px solid #232329', borderRadius: 12, padding: 20, background: '#111115' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, background: '#1c3527', color: '#9be3c6', padding: '3px 8px', borderRadius: 5 }}>
                      POST
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14.5, fontWeight: 600, color: '#fff' }}>
                      https://api.umi.so/v1/referrals/track
                    </span>
                  </div>

                  <div style={{ marginTop: 14, fontSize: 13.5, color: '#9a9a9f' }}>
                    Sample JSON Request Body:
                  </div>
                  <pre style={{ background: '#0a0a0c', border: '1px solid #1f1f25', borderRadius: 8, padding: 14, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#d4d4dc', overflowX: 'auto' }}>
{`{
  "creator_code": "MAYA-8F2K",
  "campaign_id": "cmp_palazzo_lens",
  "device_id": "902a-4421-bc10",
  "amount_cents": 4900,
  "currency": "USD"
}`}
                  </pre>

                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#9be3c6' }}>Response: 200 OK · Attributed</span>
                    <div
                      className="btn sm"
                      style={{ height: 30, padding: '0 12px', fontSize: 12, background: '#C9B8FF', color: '#0a0a0a', fontWeight: 600 }}
                      onClick={() => showToast('Attribution simulation returned 200 OK')}
                    >
                      Run Request
                    </div>
                  </div>
                </div>

                {/* Was this helpful? feedback widget (Screenshot 3 right rail) */}
                <div style={{ marginTop: 40, borderTop: '1px solid #1f1f24', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Is this documentation helpful?</div>
                    <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 2 }}>Let our developer relations team know how to improve.</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      className="btn sm"
                      style={{
                        height: 32,
                        padding: '0 14px',
                        fontSize: 13,
                        background: docFeedback === true ? '#C9B8FF' : '#1e1e24',
                        color: docFeedback === true ? '#0a0a0a' : '#fff',
                        fontWeight: 600,
                        gap: 6,
                      }}
                      onClick={() => {
                        setDocFeedback(true);
                        showToast('Thank you for the feedback!');
                      }}
                    >
                      <i className="ti ti-thumb-up" />
                      <span>Yes</span>
                    </div>
                    <div
                      className="btn sm"
                      style={{
                        height: 32,
                        padding: '0 14px',
                        fontSize: 13,
                        background: docFeedback === false ? '#C9B8FF' : '#1e1e24',
                        color: docFeedback === false ? '#0a0a0a' : '#fff',
                        fontWeight: 600,
                        gap: 6,
                      }}
                      onClick={() => {
                        setDocFeedback(false);
                        showToast('Thanks, we will improve this section');
                      }}
                    >
                      <i className="ti ti-thumb-down" />
                      <span>No</span>
                    </div>
                  </div>
                </div>

                {/* Additional Links */}
                <div style={{ marginTop: 24, display: 'flex', gap: 18, fontSize: 13.5, color: '#8d8d94', flexWrap: 'wrap' }}>
                  <span style={{ color: '#C9B8FF', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => showToast('OpenAPI Spec downloaded')}>
                    OpenAPI Docs & Spec
                  </span>
                  <span>·</span>
                  <span style={{ color: '#C9B8FF', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => showToast('Opening GitHub issue tracker')}>
                    Report bugs and issues
                  </span>
                </div>
              </div>
            </div>
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
              <div
                key={idx}
                className="ni"
                style={{ cursor: item.title === 'Palazzo Lens' ? 'pointer' : 'default' }}
                onClick={() => {
                  if (item.title === 'Palazzo Lens') {
                    navigateTo('join');
                  }
                }}
              >
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
              className={`mb ${loggingOut ? 'loading' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                opacity: loggingOut ? 0.75 : 1,
                cursor: loggingOut ? 'wait' : 'pointer',
              }}
              onClick={() => {
                if (loggingOut) return;
                setLoggingOut(true);
                setTimeout(() => {
                  setLoggingOut(false);
                  setSettingsModalOpen(false);
                  showToast('Logged out');
                }, 700);
              }}
            >
              {loggingOut ? (
                <>
                  <Spinner size={12} color="#fff" />
                  <span>Logging out…</span>
                </>
              ) : (
                'Log Out'
              )}
            </span>
          </div>
        </div>

        {/* 3: More Menu Popup */}
        <div className={`md ${moreMenuOpen ? 'on' : ''}`} id="md" style={{ width: 210 }}>
          <div
            onClick={() => {
              setMoreMenuOpen(false);
              navigateTo('pers', 'c');
            }}
          >
            <i className="ti ti-user" style={{ marginRight: 8, fontSize: 15 }} />
            Personal
          </div>
          <div
            onClick={() => {
              setMoreMenuOpen(false);
              navigateTo('pers', 'b');
            }}
            style={{ color: '#ec4899', fontWeight: 600 }}
          >
            <i className="ti ti-heart" style={{ marginRight: 8, fontSize: 15 }} />
            Umi Plus ($49/mo)
          </div>
          <div
            onClick={() => {
              setMoreMenuOpen(false);
              navigateTo('dev');
            }}
          >
            <i className="ti ti-code" style={{ marginRight: 8, fontSize: 15 }} />
            Developer Platform
          </div>
          <div
            onClick={() => {
              setMoreMenuOpen(false);
              navigateTo('docs');
            }}
          >
            <i className="ti ti-book" style={{ marginRight: 8, fontSize: 15 }} />
            Documentation
          </div>
          <hr />
          <div onClick={() => { setMoreMenuOpen(false); showToast('Umi v2.4'); }}>About</div>
          <div onClick={() => { setMoreMenuOpen(false); showToast('Privacy Policy'); }}>Privacy Policy</div>
          <div onClick={() => { setMoreMenuOpen(false); showToast('Terms of Service'); }}>Terms of Service</div>
          <hr />
          <div onClick={() => { setMoreMenuOpen(false); showToast('Logged out'); }}>Log Out</div>
        </div>

        {/* 4: CREATE API KEY MODAL (Supabase / AI Studio style) */}
        {createKeyModalOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.78)',
                zIndex: 60,
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => {
                if (!creatingKeyLoading) setCreateKeyModalOpen(false);
              }}
            />
            <div
              style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 540,
                maxWidth: 'calc(100vw - 32px)',
                background: '#121215',
                border: '1px solid #282830',
                borderRadius: 16,
                padding: '24px 28px',
                zIndex: 61,
                boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              }}
            >
              {!justCreatedKey ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Generate New API Key</div>
                    <i
                      className="ti ti-x"
                      style={{ fontSize: 20, color: '#8d8d94', cursor: 'pointer' }}
                      onClick={() => setCreateKeyModalOpen(false)}
                    />
                  </div>
                  <div style={{ fontSize: 14, color: '#9a9a9f', marginTop: 4 }}>
                    Create a scoped token to authenticate client SDKs or backend server endpoints.
                  </div>

                  {/* Token Name input */}
                  <div style={{ marginTop: 20 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#d4d4d8', display: 'block', marginBottom: 6 }}>
                      Token Name
                    </label>
                    <input
                      className="fi"
                      placeholder="e.g. Production iOS Client, Staging Backend"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Expiration selector */}
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#d4d4d8', display: 'block', marginBottom: 6 }}>
                      Expiration
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {[
                        { label: '30 Days', val: '30d' },
                        { label: '90 Days', val: '90d' },
                        { label: '1 Year', val: '1y' },
                        { label: 'Never', val: 'never' },
                      ].map(exp => (
                        <div
                          key={exp.val}
                          style={{
                            height: 36,
                            borderRadius: 8,
                            background: newKeyExpiry === exp.val ? '#C9B8FF' : '#1b1b20',
                            color: newKeyExpiry === exp.val ? '#0a0a0a' : '#d4d4d8',
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: newKeyExpiry === exp.val ? '1px solid #C9B8FF' : '1px solid #292932',
                          }}
                          onClick={() => setNewKeyExpiry(exp.val)}
                        >
                          {exp.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scopes Checklist */}
                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#d4d4d8', display: 'block', marginBottom: 8 }}>
                      Token Scopes & Permissions
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { id: 'events:track', name: 'events:track', desc: 'Report referral clicks, deep-links, and app install attribution' },
                        { id: 'referrals:read', name: 'referrals:read', desc: 'Query creator referral conversions, commissions, and stats' },
                        { id: 'purchases:report', name: 'purchases:report', desc: 'Bind StoreKit 2 and Play Billing subscription transactions' },
                        { id: 'webhooks:manage', name: 'webhooks:manage', desc: 'Create and configure webhook endpoints for live callbacks' },
                      ].map(sc => {
                        const isChecked = newKeyScopes.includes(sc.id);
                        return (
                          <div
                            key={sc.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 8,
                              background: isChecked ? 'rgba(201, 184, 255, 0.06)' : '#16161a',
                              border: isChecked ? '1px solid rgba(201, 184, 255, 0.3)' : '1px solid #232328',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setNewKeyScopes(prev =>
                                isChecked ? prev.filter(x => x !== sc.id) : [...prev, sc.id]
                              );
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ marginTop: 3, accentColor: '#C9B8FF', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: isChecked ? '#C9B8FF' : '#fff' }}>
                                {sc.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#8d8d94' }}>{sc.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <div
                      className="btn sm"
                      style={{ height: 38, padding: '0 16px', background: '#202026', color: '#c4c4c8' }}
                      onClick={() => setCreateKeyModalOpen(false)}
                    >
                      Cancel
                    </div>
                    <div
                      className={`btn pr sm ${creatingKeyLoading ? 'loading' : ''}`}
                      style={{
                        height: 38,
                        padding: '0 20px',
                        fontWeight: 600,
                        opacity: creatingKeyLoading ? 0.8 : 1,
                        cursor: creatingKeyLoading ? 'wait' : 'pointer',
                        gap: 6,
                      }}
                      onClick={() => {
                        if (creatingKeyLoading) return;
                        const name = newKeyName.trim() || 'Custom API Key';
                        setCreatingKeyLoading(true);
                        setTimeout(() => {
                          const randHex = Array.from({ length: 24 }, () =>
                            Math.floor(Math.random() * 16).toString(16)
                          ).join('');
                          const fullToken = `umi_live_${randHex}`;
                          const maskedToken = `umi_live_${randHex.slice(0, 2)}••••••••••••••••${randHex.slice(-5)}`;

                          const newKeyObj: ApiKeyItem = {
                            id: `key-${Date.now()}`,
                            name,
                            keyMasked: maskedToken,
                            fullKey: fullToken,
                            created: 'Just now',
                            lastUsed: 'Never used',
                            expires: newKeyExpiry === 'never' ? 'Never' : newKeyExpiry,
                            status: 'active',
                            scopes: newKeyScopes.length > 0 ? newKeyScopes : ['events:track'],
                          };

                          setApiKeys(prev => [newKeyObj, ...prev]);
                          setJustCreatedKey({ id: newKeyObj.id, name, fullKey: fullToken });
                          setCreatingKeyLoading(false);
                          showToast('API Key generated successfully');
                        }, 750);
                      }}
                    >
                      {creatingKeyLoading ? (
                        <>
                          <Spinner size={14} color="#000" />
                          <span>Generating…</span>
                        </>
                      ) : (
                        'Generate Token'
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Generated Token Reveal Screen */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#19392b', color: '#9be3c6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-check" style={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>API Key Created</div>
                      <div style={{ fontSize: 13, color: '#9a9a9f' }}>{justCreatedKey.name}</div>
                    </div>
                  </div>

                  {/* Warning Banner */}
                  <div
                    style={{
                      marginTop: 16,
                      background: 'rgba(234, 179, 8, 0.12)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <i className="ti ti-alert-triangle" style={{ color: '#eab308', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: '#fef08a', lineHeight: '18px' }}>
                      <strong>Copy this secret key now.</strong> For security reasons, you will never be able to see the full key again after closing this window.
                    </div>
                  </div>

                  {/* Token Reveal Input */}
                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#a6a6aa', display: 'block', marginBottom: 6 }}>
                      API Key
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="fi"
                        readOnly
                        value={justCreatedKey.fullKey}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: '#0a0a0c', color: '#C9B8FF' }}
                      />
                      <div
                        className="btn sm"
                        style={{ height: 44, padding: '0 16px', background: '#C9B8FF', color: '#0a0a0a', fontWeight: 600, gap: 6 }}
                        onClick={() => {
                          navigator.clipboard?.writeText(justCreatedKey.fullKey);
                          showToast('Secret key copied to clipboard');
                        }}
                      >
                        <i className="ti ti-copy" style={{ fontSize: 15 }} />
                        <span>Copy</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick cURL snippet */}
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#a6a6aa', display: 'block', marginBottom: 6 }}>
                      Test command
                    </label>
                    <pre
                      style={{
                        background: '#0a0a0c',
                        border: '1px solid #232328',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        color: '#9be3c6',
                        margin: 0,
                        overflowX: 'auto',
                      }}
                    >
                      curl -H "Authorization: Bearer {justCreatedKey.fullKey}" https://api.umi.so/v1/ping
                    </pre>
                  </div>

                  <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      className="btn wb sm"
                      style={{ height: 38, padding: '0 24px', fontWeight: 600 }}
                      onClick={() => {
                        setJustCreatedKey(null);
                        setCreateKeyModalOpen(false);
                      }}
                    >
                      Done
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 5: FULLSCREEN QR MODAL */}
        {qrModalOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.78)',
                zIndex: 60,
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setQrModalOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 360,
                maxWidth: 'calc(100vw - 32px)',
                background: '#141418',
                border: '1px solid #2a2a32',
                borderRadius: 18,
                padding: '28px 24px',
                zIndex: 61,
                textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Referral QR Code</span>
                <i
                  className="ti ti-x"
                  style={{ fontSize: 20, color: '#8d8d94', cursor: 'pointer' }}
                  onClick={() => setQrModalOpen(false)}
                />
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  display: 'inline-block',
                  margin: '20px 0 14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                {claimData ? renderQrSvg(claimData.seed, 180) : renderQrSvg(42, 180)}
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: '#C9B8FF', letterSpacing: '0.04em' }}>
                {claimData?.code || 'MAYA-8F2K'}
              </div>
              <div style={{ fontSize: 13, color: '#8d8d94', marginTop: 4 }}>
                Scan to get 20% off Palazzo Lens subscription
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <div
                  className="btn sm"
                  style={{ flex: 1, height: 38, background: '#222228', color: '#fff', gap: 6 }}
                  onClick={() => {
                    showToast('QR Code saved as PNG');
                    setQrModalOpen(false);
                  }}
                >
                  <i className="ti ti-download" />
                  <span>Download PNG</span>
                </div>
                <div
                  className="btn wb sm"
                  style={{ flex: 1, height: 38, fontWeight: 600 }}
                  onClick={() => setQrModalOpen(false)}
                >
                  Close
                </div>
              </div>
            </div>
          </>
        )}

        {/* 6: END-TO-END UMI PLUS SUBSCRIPTION CHECKOUT MODAL ($49/mo - Screenshot 2) */}
        {upgradeModalOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 65,
                backdropFilter: 'blur(5px)',
              }}
              onClick={() => {
                if (!upgradingLoading) setUpgradeModalOpen(false);
              }}
            />
            <div
              style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 520,
                maxWidth: 'calc(100vw - 32px)',
                background: '#121216',
                border: '1px solid #282832',
                borderRadius: 18,
                padding: '26px 28px',
                zIndex: 66,
                boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
              }}
            >
              {!upgradeSuccess ? (
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201, 184, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9B8FF' }}>
                        <i className="ti ti-crown" style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>Upgrade to umi Pro</div>
                        <div style={{ fontSize: 13, color: '#8d8d94' }}>Keep 100% of earnings & 0% platform fees</div>
                      </div>
                    </div>
                    <i
                      className="ti ti-x"
                      style={{ fontSize: 20, color: '#8d8d94', cursor: 'pointer' }}
                      onClick={() => setUpgradeModalOpen(false)}
                    />
                  </div>

                  {/* Plan Summary Box */}
                  <div style={{ marginTop: 20, background: '#191920', border: '1px solid #282832', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>umi Pro Plan</span>
                        <span style={{ marginLeft: 8, fontSize: 12, background: 'rgba(201, 184, 255, 0.15)', color: '#C9B8FF', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          {plusBillingCycle === 'monthly' ? 'Monthly' : 'Annual (Save 20%)'}
                        </span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                        {plusBillingCycle === 'monthly' ? '$69.00 / mo' : '$660.00 / yr'}
                      </span>
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #22222b', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9a9f' }}>
                        <span>Subtotal</span>
                        <span>{plusBillingCycle === 'monthly' ? '$69.00' : '$660.00'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C9B8FF' }}>
                        <span>Platform Transaction Fee</span>
                        <span>0% (Normally 10%)</span>
                      </div>
                      {upgradePromoApplied && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9be3c6' }}>
                          <span>Promo Discount (VIPCREATOR)</span>
                          <span>-$10.00</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: 16, marginTop: 4, paddingTop: 6, borderTop: '1px solid #22222b' }}>
                        <span>Total Due Today</span>
                        <span>
                          ${upgradePromoApplied ? (plusBillingCycle === 'monthly' ? '59.00' : '650.00') : (plusBillingCycle === 'monthly' ? '69.00' : '660.00')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <input
                      className="fi"
                      placeholder="Promo code (try VIPCREATOR)"
                      style={{ height: 38, fontSize: 13.5 }}
                      value={upgradePromoCode}
                      onChange={e => setUpgradePromoCode(e.target.value)}
                    />
                    <div
                      className="btn sm"
                      style={{ height: 38, padding: '0 14px', background: '#25252e', color: '#fff', fontSize: 13 }}
                      onClick={() => {
                        if (upgradePromoCode.trim().toUpperCase() === 'VIPCREATOR') {
                          setUpgradePromoApplied(true);
                          showToast('Promo code applied (-$10.00 discount)');
                        } else {
                          showToast('Invalid promo code');
                        }
                      }}
                    >
                      Apply
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 8 }}>
                      Payment Method
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {cards.map(card => {
                        const isSelected = selectedCardId === card.id;
                        return (
                          <div
                            key={card.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: 10,
                              background: isSelected ? 'rgba(201, 184, 255, 0.08)' : '#17171d',
                              border: isSelected ? '1px solid #C9B8FF' : '1px solid #24242d',
                              cursor: 'pointer',
                            }}
                            onClick={() => setSelectedCardId(card.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, background: '#26262e', color: '#fff', padding: '3px 6px', borderRadius: 4 }}>
                                {card.b}
                              </span>
                              <span style={{ fontSize: 14.5, color: '#fff', fontWeight: 500 }}>{card.l}</span>
                              <span style={{ fontSize: 13, color: '#8d8d94' }}>Exp {card.e}</span>
                            </div>
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: isSelected ? '5px solid #C9B8FF' : '2px solid #555',
                                background: '#121216',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upgrade Submit Button */}
                  <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                    <div
                      className="btn sm"
                      style={{ flex: 1, height: 46, background: '#1f1f26', color: '#c4c4c8', fontSize: 15 }}
                      onClick={() => setUpgradeModalOpen(false)}
                    >
                      Cancel
                    </div>
                    <div
                      className={`plus-upgrade-btn ${upgradingLoading ? 'loading' : ''}`}
                      style={{
                        flex: 2,
                        height: 46,
                        opacity: upgradingLoading ? 0.8 : 1,
                        cursor: upgradingLoading ? 'wait' : 'pointer',
                        gap: 8,
                        background: '#C9B8FF',
                        color: '#17141f',
                        fontWeight: 600,
                        borderRadius: 10,
                      }}
                      onClick={() => {
                        if (upgradingLoading) return;
                        setUpgradingLoading(true);
                        setTimeout(() => {
                          setUpgradingLoading(false);
                          setIsProSubscriber(true);
                          setIsPlusSubscriber(true);
                          setUpgradeSuccess(true);
                          showToast('Welcome to umi Pro!');
                        }, 1300);
                      }}
                    >
                      {upgradingLoading ? (
                        <>
                          <Spinner size={16} color="#17141f" />
                          <span>Authorizing with Stripe…</span>
                        </>
                      ) : (
                        <span>
                          Pay ${upgradePromoApplied ? (plusBillingCycle === 'monthly' ? '59.00' : '650.00') : (plusBillingCycle === 'monthly' ? '69.00' : '660.00')} & Start
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Success Receipt Screen */
                <div style={{ textAlign: 'center', padding: '12px 6px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#C9B8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#17141f', fontSize: 28 }}>
                    <i className="ti ti-check" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                    Welcome to umi Pro! 🎉
                  </div>
                  <div style={{ fontSize: 14.5, color: '#a6a6aa', marginTop: 6, lineHeight: '22px' }}>
                    Your subscription is active. You now have 0% platform fees, 5 team seats, unlimited keys, and daily payout runs.
                  </div>

                  <div style={{ marginTop: 20, background: '#181820', border: '1px solid #262630', borderRadius: 12, padding: '14px 18px', textAlign: 'left', fontSize: 13.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94' }}>
                      <span>Receipt Number</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>#UMI-PRO-9024</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94', marginTop: 6 }}>
                      <span>Billing Cycle</span>
                      <span style={{ color: '#fff' }}>{plusBillingCycle === 'monthly' ? '$69.00/mo' : '$660.00/yr'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d94', marginTop: 6 }}>
                      <span>Next Renewal</span>
                      <span style={{ color: '#fff' }}>Nov 29, 2026</span>
                    </div>
                  </div>

                  <div
                    className="plus-upgrade-btn"
                    style={{ marginTop: 24, width: '100%', height: 44, background: '#C9B8FF', color: '#17141f', fontWeight: 600, borderRadius: 10 }}
                    onClick={() => {
                      setUpgradeSuccess(false);
                      setUpgradeModalOpen(false);
                    }}
                  >
                    Go to Dashboard
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 7: Toast Popup */}
        <div id="tst" className={toastMsg ? 'on' : ''}>
          {toastMsg}
        </div>
      </div>
    </div>
  );
}
