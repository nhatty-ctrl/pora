import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type Screen = 'disc' | 'earn' | 'prof' | 'pers' | 'camp' | 'join' | 'new' | 'wd' | 'dev';
type CampaignTab = 'd' | 'j' | 'c';
type Card = { id: number; brand: string; label: string; expires: string };

const DESIGN_WIDTH = 1360;
const readCampaignTab = (): CampaignTab => {
  if (typeof window === 'undefined') return 'd';
  const tab = new URLSearchParams(window.location.search).get('campaigns');
  return tab === 'j' || tab === 'c' ? tab : 'd';
};

const campaigns = [
  { name: 'Palazzo Lens', color: '#e4d8ff', icon: 'ti-aperture', category: 'Photo and video', share: '20%', detail: 'First payment plus 6 months of renewals', end: 'Ends Nov 27', founder: 'Maya Chen', desc: 'Palazzo Lens turns ordinary shots into polished portraits in seconds. Creators earn a share of every subscription they bring in, with no minimum audience and no exclusivity.' },
  { name: 'Tidal', color: '#cfe8dc', icon: 'ti-wave-sine', category: 'Productivity', share: '25%', detail: 'First payment plus 6 months of renewals', end: 'Ends Dec 3', founder: 'Dawit Bekele', desc: 'Tidal is a focus timer that follows your natural energy through the day. Share your link, earn a share of every subscription, and watch results arrive in real time.' },
  { name: 'Lumen Habit', color: '#ffd9e8', icon: 'ti-sun', category: 'Health', share: '15%', detail: 'First payment plus 6 months of renewals', end: 'Ends Nov 30', founder: 'Hana Mulugeta', desc: 'Lumen Habit helps people build small routines that stick, with gentle reminders and weekly summaries. A great fit for wellness and lifestyle creators.' },
];
const categories = ['All Categories', 'Productivity', 'Photo and video', 'Finance', 'Social', 'Games', 'Health', 'Education'];
const fmt = (n: number) => `$${n.toFixed(2)}`;
const Icon = ({ name, className = '' }: { name: string; className?: string }) => <i aria-hidden="true" className={`ti ${name} ${className}`} />;
const BrandMark = ({ size = 24 }: { size?: number }) => <img src="/assets/brand-logo.png" alt="Logo" style={{ height: size, width: 'auto' }} className="object-contain" />;
const RetroAvatar = ({ size = 128 }: { size?: number }) => <img src="/assets/avatar-retro-circle.png" alt="Profile avatar" style={{ width: size, height: size }} className="rounded-full object-cover" />;
const NavAvatar = ({ size = 22 }: { size?: number }) => <img src="/assets/avatar-retro-circle.png" alt="Profile" style={{ width: size, height: size }} className="rounded-full object-cover" />;
const Avatar = ({ color = '#9be3c6', size = 42 }: { color?: string; size?: number }) => <span className="inline-flex flex-none items-center justify-center gap-[5px] rounded-full" style={{ width: size, height: size, background: color }}><b className="h-3 w-[6px] rounded-full bg-[#101010]" /><b className="h-3 w-[6px] rounded-full bg-[#101010]" /></span>;

function Chart({ empty = false, labels = ['Sep 29', 'Oct 5', 'Oct 11', 'Oct 17', 'Oct 23'], width = 984 }: { empty?: boolean; labels?: string[]; width?: number }) {
  const points = useMemo(() => Array.from({ length: 28 }, (_, i) => [28 + i * (width - 114) / 27, 24 + 148 + 76 * Math.sin(i / 3.4 + 2) + 36 * Math.sin(i / 1.4 + 4)] as const), [width]);
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return <div className="graph mt-[26px]">
    <svg viewBox={`0 0 ${width} 300`} className="block w-full" style={{ cursor: 'crosshair' }} aria-label="Performance chart">
      {[20, 130, 240].map(y => <line key={y} x1="28" x2={width - 86} y1={y} y2={y} stroke="#1d1d20" />)}
      {empty ? <><text x={width / 2} y="137" fill="#a6a6aa" fontSize="19" textAnchor="middle">No data yet</text><text x={width / 2} y="162" fill="#6f6f74" fontSize="16" textAnchor="middle">Claim your code to start tracking.</text></> : <path d={d} fill="none" stroke="#C9B8FF" strokeWidth="2.5" />}
      {labels.map((label, i) => <text key={label} x={28 + i * (width - 114) / (labels.length - 1)} y="282" fill="#7d7d82" fontSize="15" textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}>{label}</text>)}
    </svg>
  </div>;
}

function Stats({ items }: { items: [string, string, string, string?][] }) {
  return <div className="mt-[30px] flex h-[112px]">
    {items.map(([title, value, note, icon]) => <div className="stat" key={title}>
      <div className="a1">{icon && <Icon name={icon} className="text-[18px]" />}{title}</div>
      <div className="a2">{value}</div><div className="a3">{note}</div>
    </div>)}
  </div>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('disc');
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? DESIGN_WIDTH : window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(() => typeof window === 'undefined' ? 940 : window.innerHeight);
  const [stageHeight, setStageHeight] = useState(940);
  const stageRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const [subTab, setSubTab] = useState('c');
  const [settingsTab, setSettingsTab] = useState('d');
  const [devTab, setDevTab] = useState('asc');
  const [search, setSearch] = useState('');
  const [campaignTab, setCampaignTab] = useState<CampaignTab>(readCampaignTab);
  const [categorySet, setCategorySet] = useState<string[]>(['All Categories']);
  const [calendar, setCalendar] = useState({ year: 2026, month: 9 });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileName, setProfileName] = useState('Nathaniel Ber');
  const [firstName, setFirstName] = useState('Nathaniel');
  const [lastName, setLastName] = useState('Ber');
  const [handle, setHandle] = useState('nhatty-ctrl');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [socialLink, setSocialLink] = useState('LinkedIn and 1 more');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(1);
  const [emailNotif, setEmailNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);
  const [chatGoalAlerts, setChatGoalAlerts] = useState(false);
  const [orgAccount, setOrgAccount] = useState(false);
  const [query, setQuery] = useState('Earned');
  const [metricOpen, setMetricOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [createdName, setCreatedName] = useState('Palazzo Lens');
  const [funded, setFunded] = useState(true);
  const [appleConnected, setAppleConnected] = useState(true);
  const [sdkConnected, setSdkConnected] = useState(true);
  const [amount, setAmount] = useState('99.50');
  const [balance, setBalance] = useState(99.5);
  const [cards, setCards] = useState<Card[]>([{ id: 1, brand: 'VISA', label: 'Visa ••••4417', expires: '08/28' }]);
  const [selectedCard, setSelectedCard] = useState(1);
  const [addingCard, setAddingCard] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardError, setCardError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [toast, setToast] = useState('');
  const [devError, setDevError] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [keyFile, setKeyFile] = useState(false);
  const [eventSent, setEventSent] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);
  const scale = viewportWidth < 1100 ? Math.min(1, Math.max(0.65, viewportWidth / 1100)) : 1;
  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    const updateTabFromUrl = () => setCampaignTab(readCampaignTab());
    window.addEventListener('resize', updateViewport);
    window.addEventListener('popstate', updateTabFromUrl);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('popstate', updateTabFromUrl);
    };
  }, []);
  const selectCampaignTab = (tab: CampaignTab) => {
    setCampaignTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'd') url.searchParams.delete('campaigns');
    else url.searchParams.set('campaigns', tab);
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };
  const go = (to: Screen, tab?: string) => {
    setNotificationOpen(false); setSettingsOpen(false); setMoreOpen(false); setScreen(to);
    if (to === 'pers' && tab) setSubTab(tab);
    if (to === 'dev' && tab) setDevTab(tab);
    if (to === 'wd') { setWithdrawDone(false); setWithdrawError(''); setAmount(balance.toFixed(2)); }
  };
  const live = appleConnected && sdkConnected && funded;
  const matching = campaigns.filter(c => (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (campaignTab !== 'd' || categorySet.includes('All Categories') || categorySet.includes(c.category)));
  const isCompact = notificationOpen;
  const nav = (active: Screen) => <aside className={`rail ${isCompact ? 'compact' : ''}`}>
    <div className={`absolute ${isCompact ? 'left-[17px]' : 'left-[15px]'} top-4`}><BrandMark size={22} /></div>
    <div className="rl">
      <div className={`it ${active === 'disc' && !notificationOpen ? 'active' : ''}`} onClick={() => go('disc')} role="button" tabIndex={0} data-testid="nav-campaigns" title="Campaigns">
        <Icon name="ti-calendar-event" /><span>Campaigns</span>
      </div>
      <div className={`it ${active === 'earn' && !notificationOpen ? 'active' : ''}`} onClick={() => go('earn')} role="button" tabIndex={0} data-testid="nav-earnings" title="Earnings">
        <Icon name="ti-coin" /><span>Earnings</span>
      </div>
      <div className="it" onClick={() => { if (active !== 'disc') go('disc'); setTimeout(() => { const el = document.querySelector('input[data-testid="input-campaign-search"]') as HTMLInputElement; el?.focus(); }, 50); }} role="button" tabIndex={0} data-testid="nav-search" title="Search">
        <Icon name="ti-search" /><span>Search</span>
      </div>
      <div className={`it ${notificationOpen ? 'active' : ''}`} onClick={() => { setMoreOpen(false); setNotificationOpen(v => !v); }} role="button" tabIndex={0} data-testid="nav-notifications" title="Notifications">
        <Icon name="ti-bell" /><span>Notifications</span>
      </div>
      <div className={`it ${active === 'prof' && !notificationOpen ? 'active' : ''}`} onClick={() => go('prof')} role="button" tabIndex={0} data-testid="nav-profile" title="Profile">
        <NavAvatar size={20} /><span>Profile</span>
      </div>
    </div>
    <div className={`it absolute bottom-4 ${isCompact ? 'left-[4px]' : 'left-0'}`} onClick={() => setMoreOpen(v => !v)} role="button" tabIndex={0} data-testid="button-more" title="More">
      <Icon name="ti-menu-2" /><span>More</span>
    </div>
  </aside>;
  const Header = ({ title, right }: { title: string; right?: ReactNode }) => <div className="hh flex h-10 items-center justify-between"><div className="h1">{title}</div>{right}</div>;
  const campaignTile = (c: typeof campaigns[number], click: () => void, subtitle?: string) => <div className="campaign-item" onClick={click} role="button" tabIndex={0} key={`${c.name}-${subtitle || ''}`}>
    <div className="flex gap-3"><div className="campaign-icon" style={{ background: c.color }}><Icon name={c.icon} /></div><div className="pt-1"><div className="campaign-title">{c.name}<span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#c9b8ff] text-[9px] text-[#0a0a0a]"><Icon name="ti-check" /></span></div><div className="mt-[2px] text-[15px] leading-[19px] text-[#a6a6aa]">{subtitle || `${c.share} of subscription revenue · ${c.end}`}</div></div></div>
    <div className="mt-2 flex h-5 items-center gap-2 text-[14px] text-[#9a9a9f]"><Icon name="ti-user" />{c.founder} · {c.category}</div><div className="mt-[6px] text-[14px] leading-5 text-[#e8e8ea]">{c.desc.slice(0, 142)}… <b className="font-semibold text-white">see more</b></div>
  </div>;
  const cashStat: [string, string, string, string?][] = [['Pending', '$12.00', 'In the 30-day hold', 'ti-clock'], ['Payable', '$6.00', 'Next weekly payout run', 'ti-calendar-event'], ['Paid out', '$188.00', 'Sent to your Stripe balance', 'ti-send'], ['Reversed', '$4.20', '2 refunded payments', 'ti-arrow-back-up']];

  const discovery = <section className="scr on">
    {nav('disc')}
    <div className="ml-[230px] flex gap-10 px-8 pb-20 pt-5 max-w-[1240px]">
      <div className="w-[540px] flex-none">
        <div className="flex h-[28px] items-center justify-between">
          <div className="text-[20px] font-semibold leading-[26px]">Campaigns</div>
          <div className="relative"><Icon name="ti-search" className="absolute left-3 top-[8px] text-[16px] text-[#6f6f74]" /><input className="h-8 w-[240px] rounded-[9px] border border-[#242427] bg-transparent pl-[34px] pr-3 text-[14px] text-white outline-none placeholder:text-[#6f6f74]" placeholder="Search campaigns" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-campaign-search" /></div>
        </div>
        <div className="mt-[15px] flex h-[32px] gap-5 border-b border-transparent" role="tablist" aria-label="Campaign sections">{([
          ['Discover', 'd'], ['Joined', 'j'], ['Created', 'c'],
        ] as const).map(([label, value]) => <button
          key={value}
          id={`campaign-tab-${value}`}
          type="button"
          role="tab"
          aria-selected={campaignTab === value}
          aria-controls="campaign-tab-panel"
          data-testid={`campaign-tab-${value}`}
          className={`flex h-[32px] cursor-pointer items-center border-b-2 bg-transparent text-[15px] font-medium ${campaignTab === value ? 'border-white text-white' : 'border-transparent text-[#8d8d92]'}`}
          onClick={() => selectCampaignTab(value)}
        >{label}</button>)}</div>
        <div id="campaign-tab-panel" role="tabpanel" aria-labelledby={`campaign-tab-${campaignTab}`} data-testid={`campaign-panel-${campaignTab}`}>
          {campaignTab === 'd' ? <><div className="mt-[30px] flex h-[26px] items-center justify-between text-[20px] font-semibold"><span>Featured</span><span className="flex gap-5 text-[16px] text-[#8d8d92]"><Icon name="ti-chevron-left" /><Icon name="ti-chevron-right" /></span></div>{matching.filter(c => c.name === 'Palazzo Lens').map(c => campaignTile(c, () => go('camp')))}<div className="mt-[30px] flex h-[32px] items-start justify-between border-b border-[#161618] pb-3 text-[20px] font-semibold">New this week</div>{matching.filter(c => c.name !== 'Palazzo Lens').map(c => campaignTile(c, () => go('camp'), `${c.share} of subscription revenue · ${c.end} · NEW`))}</> :
            <><div className="mt-[30px] text-[20px] font-semibold">{campaignTab === 'j' ? 'Joined' : 'Created'}</div>{campaignTab === 'j' ? campaignTile(campaigns[0], () => go('join'), 'Approved · 18 paying subscribers · $90.00 earned') : campaignTile({ ...campaigns[0], name: createdName, founder: 'You' }, () => go('pers', 'i'), `${live ? 'Live' : 'Setting up'} · 20% of subscription revenue`)}</>}
        </div>
      </div>
      <div className="w-[270px] flex-none">
        <button className="nb h-8 w-full rounded-[9px] border border-[#242427] text-[14px] font-semibold" onClick={() => go('new')} data-testid="button-new-campaign">New Campaign <Icon name="ti-chevron-down" className="text-[13px]" /></button>
        <div className="card mt-[18px] p-4 pb-5">
          <div className="flex h-[34px] items-center justify-between px-2 text-[17px] font-semibold"><span>{new Date(calendar.year, calendar.month).toLocaleString('en-US', { month: 'short' })} {calendar.year}</span><span className="flex gap-[14px] text-[15px] text-[#a6a6aa]"><button onClick={() => setCalendar(c => c.month ? { ...c, month: c.month - 1 } : { year: c.year - 1, month: 11 })}><Icon name="ti-chevron-left" /></button><button onClick={() => setCalendar(c => c.month < 11 ? { ...c, month: c.month + 1 } : { year: c.year + 1, month: 0 })}><Icon name="ti-chevron-right" /></button></span></div>
          <div className="mt-1 grid grid-cols-7 text-center text-[12px] text-[#7d7d82]">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="flex h-[30px] items-center justify-center">{d}</span>)}</div>
          <div className="grid grid-cols-7 text-center">{Array.from({ length: 42 }, (_, i) => { const first = new Date(calendar.year, calendar.month, 1).getDay(); const days = new Date(calendar.year, calendar.month + 1, 0).getDate(); const n = i - first + 1; return <span key={i} className={`mx-auto flex h-[31px] w-[31px] items-center justify-center rounded-full text-[14px] ${n < 1 || n > days ? 'text-[#6a6a6e]' : calendar.year === 2026 && calendar.month === 9 && n === 27 ? 'bg-[#26262a]' : ''}`}>{n < 1 ? new Date(calendar.year, calendar.month, 0).getDate() + n : n > days ? n - days : n}</span>; })}</div>
          <div className="mt-4 h-px bg-[#1f1f22]" /><div className="mt-5 pl-2 text-[17px] font-semibold">Categories</div>
          <div className="mt-2">{categories.map(c => <div key={c} onClick={() => setCategorySet(old => c === 'All Categories' ? [c] : old.includes(c) ? (old.filter(x => x !== c).length ? old.filter(x => x !== c) : ['All Categories']) : [...old.filter(x => x !== 'All Categories'), c])} className="flex h-[28px] cursor-pointer items-center gap-[11px] pl-[6px] text-[14px]">
            <span className={`flex h-[17px] w-[17px] items-center justify-center rounded-[4px] border text-[11px] ${categorySet.includes(c) ? 'border-[#c9b8ff] bg-[#c9b8ff] text-[#0a0a0a]' : 'border-[#4a4a4f]'}`}>{categorySet.includes(c) && <Icon name="ti-check" />}</span><span className={categorySet.includes(c) ? '' : 'text-[#a6a6aa]'}>{c}</span>
          </div>)}</div>
        </div>
      </div>
    </div>
  </section>;

  const earnings = <section className="scr on">{nav('earn')}<div className="ml-[230px] max-w-[1040px] px-8 pb-24 pt-5">
    <Header title="Earnings" right={<button className="btn white h-12 px-6 text-[20px]" onClick={() => go('wd')}><Icon name="ti-arrow-up-right" />Withdraw</button>} />
    <div className="mt-[34px] text-[18px] leading-[26px] text-[#bdbdc1]">Available to withdraw</div><div className="flex items-baseline gap-[14px]"><span className="text-[64px] font-medium leading-[76px] tracking-[-1px]">{fmt(balance)}</span><span className="text-[18px] text-[#a6a6aa]">USD in your Stripe balance</span></div>
    <Stats items={cashStat} /><div className="info"><Icon name="ti-info-circle" />Earnings are held for 30 days to cover refunds, then paid out in the weekly run.</div><div className="divider" />
        <div className="mt-[38px] flex h-[38px] items-center justify-between"><div className="h2">Performance</div><div className="flex gap-[6px]"><div className="relative"><button className="btn w-[190px] justify-between" onClick={() => setMetricOpen(v=>!v)}>{query}<Icon name="ti-chevron-down" /></button>{metricOpen&&<div className="pop-menu">{['Earned','Paying subscribers'].map(v=><button key={v} className={query===v?'selected':''} onClick={()=>{setQuery(v);setMetricOpen(false)}}>{v}</button>)}</div>}</div><button className="btn w-[140px]">Last 28 days <Icon name="ti-chevron-down" /></button></div></div>
    <Chart /><div className="divider" /><div className="h2 mt-[39px]">By Campaign</div><div className="sub mt-[3px]">What each campaign has earned you.</div>
    <div className="mt-[18px]"><div className="grid h-[46px] grid-cols-[1fr_130px_140px_140px] items-center px-1 text-[16px] font-medium text-[#7d7d82]"><span>Campaign</span><span className="text-right">Share</span><span className="text-right">Subscribers</span><span className="text-right">Earned</span></div>
      {campaigns.map((c, i) => <div key={c.name} className="grid h-[72px] grid-cols-[1fr_130px_140px_140px] items-center border-t border-[#1f1f22] px-1 text-[19px]"><span className="flex items-center gap-[14px]"><span className="flex h-11 w-11 items-center justify-center rounded-[11px] text-[22px] text-[#17141f]" style={{ background: c.color }}><Icon name={c.icon} /></span><b className="text-[20px] font-medium">{c.name}</b></span><span className="text-right text-[#a6a6aa]">{c.share}</span><span className="text-right">{[18,12,6][i]}</span><span className="text-right font-medium">{['$90.00','$67.00','$31.00'][i]}</span></div>)}
    </div>
  </div></section>;

  const profile = <section className="scr on">{nav('prof')}<div className="ml-[210px] flex min-h-screen">
    <div className="relative w-[780px] flex-none">
      <div className="h-[215px] w-full bg-[#18181b]" />
      <div className="absolute left-[32px] top-[152px] z-10 flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#0a0a0a]">
        <RetroAvatar size={130} />
      </div>

      <div className="absolute right-[32px] top-[236px] z-10 flex items-center gap-2.5">
        {!editing ? <>
          <button
            type="button"
            data-testid="button-profile-settings"
            className="rounded-lg border border-[#27272a] bg-[#141416] px-4 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1f1f23] cursor-pointer"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
          <button
            type="button"
            data-testid="button-profile-edit"
            className="rounded-lg border border-[#27272a] bg-[#141416] px-4 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1f1f23] cursor-pointer"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </> : <>
          <button
            type="button"
            data-testid="button-profile-cancel"
            className="rounded-lg border border-[#27272a] bg-[#141416] px-4 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1f1f23] cursor-pointer"
            onClick={() => {
              setFirstName(profileName.split(' ')[0] || '');
              setLastName(profileName.split(' ').slice(1).join(' ') || '');
              setEditing(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="button-profile-save"
            className="rounded-lg bg-[#c9b8ff] px-6 py-1.5 text-[14px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#b8a3f8] cursor-pointer"
            onClick={() => {
              const full = `${firstName} ${lastName}`.trim() || 'Nathaniel Ber';
              setProfileName(full);
              setEditing(false);
              setToast('Profile updated');
            }}
          >
            Save
          </button>
        </>}
      </div>

      <div className="absolute left-[32px] top-[298px] pr-8">
        {!editing ? <>
          <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight">{profileName}</h1>
          <div className="mt-1 text-[15px] text-[#8d8d92]">{handle}</div>
          <div className="mt-4 flex items-center gap-2 text-[14.5px] font-medium text-white">
            <Icon name="ti-link" className="text-[16px] text-white" />
            <span>{socialLink}</span>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[14.5px] text-[#8d8d92]">
            <span><strong className="font-semibold text-white">{followers}</strong> followers</span>
            <span><strong className="font-semibold text-white">{following}</strong> following</span>
          </div>
        </> : <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First"
              className="h-10 w-32 rounded-lg border border-[#2a2a2e] bg-[#121214] px-3 text-[20px] font-bold text-white outline-none focus:border-[#c9b8ff]"
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last"
              className="h-10 w-28 rounded-lg border border-[#2a2a2e] bg-[#121214] px-3 text-[20px] font-bold text-white outline-none focus:border-[#c9b8ff]"
            />
          </div>
          <div className="mt-2 text-[15px] text-[#8d8d92]">{handle}</div>
          <div className="mt-4">
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Add a description..."
              className="h-10 w-[380px] rounded-lg border border-[#2a2a2e] bg-[#121214] px-3 text-[14.5px] text-white placeholder-[#5d5d62] outline-none focus:border-[#c9b8ff]"
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="text-[14.5px] font-medium text-white hover:underline cursor-pointer"
              onClick={() => setToast('Edit social links')}
            >
              Edit Social Links
            </button>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[14.5px] text-[#8d8d92] hover:text-white cursor-pointer"
              onClick={() => setToast('Location picker')}
            >
              <Icon name="ti-map-pin" className="text-[16px]" />
              <span>{location || 'Add location'}</span>
            </button>
          </div>
        </>}
      </div>
    </div>

    <div className="w-[360px] flex-none border-l border-[#1a1a1c] px-6 pt-5 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[19px] font-semibold text-white">All Inbound</h2>
          <button
            type="button"
            onClick={() => setToast('Refreshed conversations')}
            title="Refresh"
            className="text-[#8d8d92] hover:text-white transition-colors cursor-pointer"
          >
            <Icon name="ti-refresh" className="text-[16px]" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setToast('Filter conversations')}
          title="Filter"
          className="text-[#8d8d92] hover:text-white transition-colors cursor-pointer"
        >
          <Icon name="ti-menu-2" className="text-[17px]" />
        </button>
      </div>
      <div className="mt-40 text-center text-[15px] text-[#8d8d92]">
        No conversations yet
      </div>
    </div>
  </div></section>;

  const tabs = [['Campaigns','c'],['Creators','r'],['Payment','p'],['Insights','i'],['Settings','s']];
  const personal = <section className="scr on">{nav('pers')}<div className="ml-[210px]">
    <div className="ml-[32px] mt-[40px] text-[34px] font-semibold leading-[44px] tracking-[-.4px]">Personal</div>
    <div className="flex h-[55px] gap-5 border-b border-[#232325] pl-[32px]">{tabs.map(([name,key])=><div key={key} className={`tab ${subTab===key?'active':''}`} onClick={()=>setSubTab(key)}>{name}</div>)}</div>
    <div className="max-w-[1040px] pb-[90px] pl-[32px] pt-[30px]">
      {subTab === 'c' && <><div className="flex h-[38px] items-center justify-between"><div className="h2">Campaigns</div><button className="btn w-[107px]" onClick={()=>go('new')}>Create</button></div><div className="sub mt-[3px]">Campaigns you’ve created and funded.</div>
        <div className="card mt-[25px] overflow-hidden">{[
          [createdName, '20% of subscription revenue · 128 creators', live?'Live':'Setting up', '#e4d8ff', 'ti-aperture'],
          ['Tidal','25% of subscription revenue · 74 creators','Live','#cfe8dc','ti-wave-sine'],['Pocket Ledger','15% of subscription revenue · 41 creators','Paused','#ffe1c8','ti-notebook']
        ].map(([name,info,status,color,icon])=><div key={name} className="flex h-[83px] cursor-pointer items-center gap-4 border-t border-[#242427] px-5 first:border-t-0" onClick={()=>go('pers','i')}><span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-[#17141f]" style={{background:color}}><Icon name={icon}/></span><div><div className="text-[20px] font-medium">{name}</div><div className="text-[17.5px] text-[#9a9a9f]">{info}</div></div><span className="pill light ml-auto">{status}</span></div>)}</div>
      </>}
      {subTab === 'r' && <><div className="h2">Creators</div><div className="sub mt-[3px]">Approve creators and see what they’ve earned you.</div><div className="mt-[30px] border-b border-[#26262a] pb-3 text-[17px] font-medium text-[#8d8d92]">Requests</div><div className="card mt-3 overflow-hidden">{[['Amira Hassan','Requested Palazzo Lens · 2h ago','#f4c4d8'],['Dawit Bekele','Requested Tidal · 5h ago','#b9d7ff']].map(([n,d,c])=><div className="flex h-[83px] items-center gap-4 border-t border-[#242427] px-5 first:border-0" key={n}><Avatar color={c} size={44}/><div><div className="text-[20px] font-medium">{n}</div><div className="text-[17.5px] text-[#9a9a9f]">{d}</div></div><div className="ml-auto flex gap-3"><button className="btn" onClick={e=>e.currentTarget.textContent='Declined'}>Decline</button><button className="btn white" onClick={e=>e.currentTarget.textContent='Approved'}>Approve</button></div></div>)}</div><div className="mt-8 border-b border-[#26262a] pb-3 text-[17px] font-medium text-[#8d8d92]">Approved</div><div className="card mt-3 overflow-hidden">{[['Selam Tesfaye','9 paying subscribers · $45.00 earned','#9be3c6'],['Yonas Girma','6 paying subscribers · $30.00 earned','#ffd9a8']].map(([n,d,c])=><div className="flex h-[83px] items-center gap-4 border-t border-[#242427] px-5 first:border-0" key={n}><Avatar color={c} size={44}/><div><div className="text-[20px] font-medium">{n}</div><div className="text-[17.5px] text-[#9a9a9f]">{d}</div></div><span className="pill light ml-auto">Active</span></div>)}</div></>}
      {subTab === 'p' && <><div className="h2">Funding</div><div className="card mt-[23px] flex items-center gap-5 p-6"><div className="flex-1"><div className="text-[20px] font-semibold">{funded?'Wallet funded · $2,000.00':'Add funds to your wallet'}</div><div className="mt-1.5 text-[17.5px] leading-[26px] text-[#a6a6aa]">Creators are paid from this wallet. Funds are reserved as soon as an earning is created.</div></div><button className="btn white h-12 px-6 text-[20px]" onClick={()=>{setFunded(true);setToast('Wallet funded')}}>{funded?'Add more':'Add funds'}</button></div><div className="divider"/><div className="h2 mt-[39px]">Payment Methods</div><div className="sub mt-[6px]">Choose accepted payment methods for deposits.</div><div className="card mt-[25px] overflow-hidden">{[['Cards','Major credit and debit cards, Apple Pay and Google Pay are always accepted.'],['Bank debit','For large deposits. Settles over a few days.']].map(([n,d],i)=><div key={n} className="flex h-[86px] items-center justify-between border-t border-[#242427] px-5 first:border-0"><div><div className="text-[20px] font-medium">{n}</div><div className="text-[17.5px] text-[#9a9a9f]">{d}</div></div>{i===0?<span className="pill light">On</span>:<button className="tg" onClick={e=>e.currentTarget.classList.toggle('on')}/>}</div>)}</div><div className="mt-8 text-[17px] text-[#8d8d92]">Regional Payment Methods</div><div className="mt-4 grid grid-cols-3 gap-[11px]">{['Alipay','Bancontact','FPX','iDEAL','Konbini','PayNow','Pix','Przelewy24','Swish','TWINT','UPI','WeChat Pay','Zip'].map(n=><div className="flex h-14 items-center gap-2 rounded-[14px] border border-[#242427] px-4 text-[18px] font-medium" key={n}><span className="rounded bg-[#2a2a2d] px-1 text-[11px]">{n.slice(0,3).toUpperCase()}</span>{n}<button className="tg ml-auto scale-75" onClick={e=>e.currentTarget.classList.toggle('on')}/></div>)}</div></>}
      {subTab === 'i' && <><div className="flex h-14 items-center gap-[14px]"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px] text-[28px] text-[#17141f]" style={{background:'#e4d8ff'}}><Icon name="ti-aperture"/></span><div className="text-[25px] font-semibold">{createdName}</div><span className={`pill ${live?'light':''}`}>{live?'Live':'Setting up'}</span></div><Stats items={live?[['Attributed revenue','$4,820.00','$612.00 last week','ti-chart-bar'],['Paying subscribers','214','31 last week','ti-users'],['Creator earnings','$819.40','20% share · $81.94 fee','ti-percentage'],['Wallet balance','$1,098.66','$196.60 reserved','ti-wallet']]:[['Attributed revenue','$0.00','—','ti-chart-bar'],['Paying subscribers','0','—','ti-users'],['Creator earnings','$0.00','20% share','ti-percentage'],['Wallet balance',funded?'$2,000.00':'$0.00',funded?'$0.00 reserved':'Not funded','ti-wallet']]}/><div className="info"><Icon name="ti-info-circle"/>Creators earn only from verified subscription payments, never from installs or clicks.</div><div className="divider"/><div className="mt-8 flex justify-between"><div className="h2">Performance</div><button className="btn">{query}<Icon name="ti-chevron-down"/></button></div><Chart empty={!live}/></>}
      {subTab === 's' && <div className="flex gap-8"><div className="w-[240px] flex-none">{[['Defaults','d','ti-adjustments-horizontal'],['Developer','v','ti-code'],['Billing','b','ti-heart']].map(([n,k,ic])=><div key={k} className={`flex h-[45px] cursor-pointer items-center gap-[15px] text-[20px] ${settingsTab===k?'font-semibold text-white':'text-[#9a9a9f]'}`} onClick={()=>setSettingsTab(k)}><Icon name={ic}/>{n}</div>)}</div><div className="w-[745px]">{settingsTab==='d'?<><div className="h2">Campaign Defaults</div><div className="sub mt-1.5">Default settings for new campaigns.</div><div className="card mt-[25px] overflow-hidden">{[['Revenue share','Share of subscription revenue paid to creators.','20%'],['Paid renewals','Months of renewals that earn creators a share.','6 months'],['Auto-approve Creators','Approve creator requests without review.','toggle']].map(([n,d,v])=><div className="flex h-[86px] items-center justify-between border-t border-[#242427] px-5 first:border-0" key={n}><div><div className="text-[20px] font-medium">{n}</div><div className="text-[17.5px] text-[#9a9a9f]">{d}</div></div>{v==='toggle'?<button className="tg" onClick={e=>e.currentTarget.classList.toggle('on')}/>:<span className="btn w-[97px]">{v}</span>}</div>)}</div></>:settingsTab==='v'?<><div className="h2">Developer</div><div className="sub mt-1.5">App key, App Store connection and SDK.</div><div className="card mt-[25px] flex items-center gap-4 p-6"><Icon name="ti-code" className="text-4xl text-[#5d5d62]"/><div className="flex-1"><div className="text-xl">Developer console</div><div className="text-[17.5px] text-[#9a9a9f]">Connect App Store Connect and install the SDK.</div></div><button className="btn white h-[46px]" onClick={()=>go('dev','asc')}>Open</button></div></>:<div className="card p-6"><div className="text-[17px] text-[#a6a6aa]">Upgrade to</div><div className="text-[25px] font-medium text-[#c9b8ff]">umi Pro</div><div className="mt-1.5 text-[64px] font-medium">$69 <span className="text-[18px] text-[#a6a6aa]">Per month</span></div><button className="btn purple mt-5 h-12 w-full text-xl" onClick={()=>setToast('Upgrade options coming soon')}>Upgrade to umi Pro</button></div>}</div></div>}
    </div>
  </div></section>;

  const campaignDetail = <section className="scr on"><div className="px-[100px] pb-[100px] pt-9"><button className="flex h-10 items-center gap-2 text-[18px] text-[#a6a6aa]" onClick={()=>go('disc')}><Icon name="ti-arrow-left"/>Back</button>
    <div className="mt-[14px] flex gap-10"><div className="w-[413px] flex-none"><div className="flex h-[412px] items-center justify-center rounded-[22px] border border-[#2a2a2e] bg-[#e4d8ff] text-[170px] text-[#17141f]"><Icon name="ti-aperture"/></div><div className="mt-[41px] flex items-center gap-3"><Avatar color="#f4c4d8" size={40}/><div><div className="text-[15px] text-[#8d8d92]">Presented by</div><div className="text-[20px] font-medium">Maya Chen</div></div></div><div className="mt-4 text-[17.5px] leading-[26px] text-[#9a9a9f]">Photo editing tools for creators, built in Addis Ababa.</div><div className="mt-[34px] border-b border-[#26262a] pb-3 text-[17px] text-[#8d8d92]">Founder</div><div className="mt-3 flex h-[50px] items-center gap-3"><Avatar color="#f4c4d8" size={32}/><span className="text-[20px]">Maya Chen</span><span className="ml-auto flex gap-3 text-xl text-[#8d8d92]"><Icon name="ti-brand-instagram"/><Icon name="ti-brand-x"/></span></div></div>
      <div className="w-[708px] flex-none"><div className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#242427] px-2 text-[15.5px] text-[#8d8d92]"><Icon name="ti-apps" className="text-xl text-[#d8d8dc]"/>Featured in <span className="font-medium text-white">Photo and video</span></div><div className="mt-[18px] text-[55px] font-semibold leading-[70px] tracking-[-1px]">Palazzo Lens</div><div className="mt-5 flex items-center gap-4"><span className="flex h-[50px] w-[50px] items-center justify-center rounded-xl border border-[#2a2a2e] text-2xl"><Icon name="ti-percentage"/></span><div><div className="text-[20px] font-medium">20% of subscription revenue</div><div className="text-[18px] text-[#9a9a9f]">First payment plus 6 months of renewals</div></div></div><div className="mt-[23px] flex items-center gap-4"><span className="flex h-[50px] w-[50px] items-center justify-center rounded-xl border border-[#2a2a2e] text-2xl"><Icon name="ti-calendar"/></span><div><div className="text-[20px] font-medium">Oct 27 – Nov 27</div><div className="text-[18px] text-[#9a9a9f]">Ends in 31 days</div></div></div>
        <div className="mt-[34px] overflow-hidden rounded-[20px] bg-[#c9b8ff] text-[#17141f]"><div className="flex h-[45px] items-center bg-[#b9a5f2] px-5 text-[18px] text-[#3a3158]">Join</div><div className="p-5"><div className="text-2xl font-semibold">{requested?'Request sent':'Request to join'}</div><div className="mt-1.5 text-[17.5px] leading-[26px] text-[#3a3158]">{requested?'Waiting for the founder to approve you. We’ll notify you when it’s done.':'The founder approves each creator. Once approved, you claim your own link, QR code and creator code and earn 20% of every subscription payment.'}</div><button className="btn black mt-[18px] h-12 w-full text-xl" onClick={()=>setRequested(v=>!v)}>{requested?'Requested':'Request to join'}</button>{requested&&<button className="mt-3 w-full text-[15px] font-semibold underline" onClick={()=>go('join')}>Preview as approved</button>}</div></div>
        <div className="mt-11 border-b border-[#26262a] pb-3 text-[17px] text-[#8d8d92]">About Campaign</div><div className="mt-[22px] text-[20px] leading-[30px] text-[#e4e4e6]">{campaigns[0].desc}</div><div className="mt-9 border-b border-[#26262a] pb-3 text-[17px] text-[#8d8d92]">Get the app</div><div className="flex h-16 items-center gap-[14px] border-b border-[#1f1f22]"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#2a2a2e] text-[22px]"><Icon name="ti-brand-apple"/></span><span className="text-[20px] font-medium">App Store</span><Icon name="ti-arrow-up-right" className="ml-auto text-xl text-[#8d8d92]"/></div>
      </div></div>
  </div></section>;

  const joinScreen = <section className="scr on"><div className="mx-auto w-[820px] pb-[90px] pt-9"><button className="flex h-10 items-center gap-2 text-[18px] text-[#a6a6aa]" onClick={()=>go('disc')}><Icon name="ti-arrow-left"/>Back to campaigns</button>
    <div className="mt-5 flex h-[72px] items-center gap-[18px]"><span className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-[#e4d8ff] text-[40px] text-[#17141f]"><Icon name="ti-aperture"/></span><div><div className="text-[34px] font-semibold leading-[42px] tracking-[-.5px]">Palazzo Lens</div><div className="text-[18px] leading-[26px] text-[#9a9a9f]">20% of subscription revenue · by Maya Chen</div></div><span className="pill light ml-auto">Approved</span></div>
    <div className="mt-[46px]"><div className="h2">Your link and code</div><div className="sub mt-[3px]">Claim your personal link, QR code and creator code.</div></div>
    {!claimed ? <button className="mt-6 flex h-[68px] w-full items-center justify-center rounded-[24px] border border-[#2e2e33] text-[19px] font-semibold hover:bg-[#111113]" onClick={()=>{setClaimed(true);setToast('Referral code claimed')}}>Claim code</button> :
      <div className="mt-6 flex gap-8 rounded-[24px] border border-[#2e2e33] p-8"><div className="flex flex-1 flex-col"><div className="text-[27px] font-bold">Your referral link</div><div className="mt-2 text-[17px] text-[#a6a6aa]">Everyone who subscribes through your link or code earns you a share, every payment.</div>{[['umi.link/pl-maya27','Copy link'],['MAYA-MAYA27','Copy code']].map(([value,label],i)=><div className="mt-4 flex gap-[10px]" key={value}><div className="flex h-[50px] flex-1 items-center overflow-hidden rounded-xl border border-[#2a2a2e] px-4 text-[17px]">{value}</div><button className="flex h-[50px] min-w-[144px] items-center justify-center gap-2 rounded-xl bg-[#c9b8ff] px-5 font-semibold text-[#0a0a0a]" onClick={async()=>{try{await navigator.clipboard.writeText(i===0?'https://umi.link/pl-maya27':'MAYA-MAYA27')}catch{} setCopied(label);window.setTimeout(()=>setCopied(''),1400)}}><Icon name={copied===label?'ti-check':'ti-copy'}/>{copied===label?'Copied':label}</button></div>)}<div className="mt-auto flex pt-6">{[['20%','Revenue share'],['6 mo','Of renewals'],['30 days','Refund hold']].map(([v,n])=><div className="flex-1 border-l border-[#26262a] pl-[18px] first:border-0 first:pl-0" key={n}><b className="block text-[26px]">{v}</b><span className="text-[13.5px] text-[#7d7d82]">{n}</span></div>)}</div></div><div className="flex w-[240px] flex-none flex-col items-center rounded-[22px] border border-[#2e2e33] px-5 py-[22px] text-center"><div className="text-[14.5px] text-[#a6a6aa]">Scan with your phone</div><div className="mt-4 grid h-[174px] w-[174px] grid-cols-9 gap-[2px] rounded-[14px] bg-white p-3">{Array.from({length:81},(_,i)=><span key={i} className={`${(i*17+i%5*7)%4===0?'bg-[#0a0a0a]':''}`}/>)}</div><button className="btn mt-[14px] h-[42px]" onClick={()=>setToast('Download PNG') }><Icon name="ti-download"/>Download PNG</button><div className="mt-3 text-[12.5px] text-[#6f6f74]">Preview only</div></div></div>}
    <div className="divider mt-[44px]"/><div className="mt-[38px] flex h-[38px] items-center justify-between"><div className="h2">Analytics</div><div className="flex gap-[6px]"><div className="relative"><button className="btn w-[190px] justify-between" onClick={()=>setMetricOpen(v=>!v)}>{query}<Icon name="ti-chevron-down"/></button>{metricOpen&&<div className="pop-menu">{['Earned','Link clicks','Referred users','Paying subscribers'].map(v=><button key={v} className={query===v?'selected':''} onClick={()=>{setQuery(v);setMetricOpen(false)}}>{v}</button>)}</div>}</div><button className="btn w-[140px]">Last 14 days<Icon name="ti-chevron-down"/></button></div></div><Stats items={claimed?[['Link clicks','214','31 last week'],['Referred users','63','9 last week'],['Paying subscribers','18','3 last week'],['Earned','$90.00','20% of revenue']]:[['Link clicks','0','—',''],['Referred users','0','—',''],['Paying subscribers','0','—',''],['Earned','$0.00','—','']]}/><Chart empty={!claimed} width={820} labels={['Oct 14','Oct 20','Oct 27']}/>
    <div className="mt-[34px]"><div className="text-[20px] font-semibold">How people found you</div>{[['ti-link','Link or QR code',claimed?'47 people · 75%':'0 people',claimed?'75%':'0%'],['ti-keyboard','Creator code typed in the app',claimed?'16 people · 25%':'0 people',claimed?'25%':'0%']].map(([ic,n,value,p])=><div className="flex h-[62px] items-center gap-[14px] border-t border-[#1f1f22]" key={n}><Icon name={ic} className="text-[22px] text-[#bdbdc1]"/><div className="flex-1"><div className="flex justify-between text-[18px]"><span>{n}</span><span className="text-[#a6a6aa]">{value}</span></div><div className="mt-2 h-[6px] rounded bg-[#1d1d20]"><div className="h-full rounded bg-[#c9b8ff]" style={{width:p}}/></div></div></div>)}</div>
  </div></section>;

  const newCampaign = <section className="scr on"><div className="px-[100px] pb-[100px] pt-9"><button className="flex h-10 items-center gap-2 text-[18px] text-[#a6a6aa]" onClick={()=>go('disc')}><Icon name="ti-arrow-left"/>Cancel</button><div className="mt-[14px] flex gap-10">
    <div className="flex h-[413px] w-[412px] flex-none items-center justify-center rounded-[22px] border border-[#2a2a2e] bg-[#141416] text-[64px] text-[#5d5d62]"><Icon name="ti-photo"/></div>
    <div className="relative w-[708px] flex-none"><input value={campaignName} onChange={e=>setCampaignName(e.target.value)} placeholder="Campaign Name" className="h-16 w-full border-0 bg-transparent p-0 text-[48px] font-semibold text-white outline-none placeholder:text-white" style={{fontFamily:'"Roboto Slab", Georgia, serif'}} />
      <div className="mt-[30px] flex gap-4"><div className="flex h-[110px] w-[517px] items-center gap-[14px] rounded-[14px] border border-[#242427] px-3 pl-5"><div className="flex flex-col gap-[30px] text-[20px]"><span>Start</span><span>End</span></div><div className="ml-auto flex flex-col gap-[10px]"><div className="flex gap-[10px]"><button className="btn h-11 w-[158px] text-[19px]" onClick={e=>e.currentTarget.textContent=e.currentTarget.textContent==='Tue, Oct 27'?'Wed, Oct 28':'Tue, Oct 27'}>Tue, Oct 27</button><button className="btn h-11 w-[123px] text-[19px]" onClick={e=>e.currentTarget.textContent=e.currentTarget.textContent==='10:30 AM'?'11:00 AM':'10:30 AM'}>10:30 AM</button></div><div className="flex gap-[10px]"><button className="btn h-11 w-[158px] text-[19px]" onClick={e=>e.currentTarget.textContent=e.currentTarget.textContent==='Tue, Oct 27'?'Wed, Oct 28':'Tue, Oct 27'}>Tue, Oct 27</button><button className="btn h-11 w-[123px] text-[19px]" onClick={e=>e.currentTarget.textContent=e.currentTarget.textContent==='11:30 AM'?'12:00 PM':'11:30 AM'}>11:30 AM</button></div></div></div><div className="h-[110px] w-[175px] rounded-[14px] border border-[#242427] p-[16px_18px]"><Icon name="ti-world" className="text-xl text-[#bdbdc1]"/><div className="mt-1 text-[18px] font-medium">GMT+03:00</div><div className="text-[17px] text-[#9a9a9f]">Addis Ababa</div></div></div>
      <button className="mt-[21px] flex h-[73px] w-full items-center gap-3 rounded-[14px] border border-[#242427] px-[18px] text-left"><Icon name="ti-link" className="text-[22px] text-[#bdbdc1]"/><span><b className="block text-[20px] font-medium">Add App Link</b><span className="text-[17.5px] text-[#9a9a9f]">App Store link</span></span></button>
      <button className="mt-5 flex h-[47px] w-full items-center gap-3 rounded-[14px] border border-[#242427] px-[18px] text-[20px] font-medium"><Icon name="ti-align-left" className="text-xl text-[#bdbdc1]"/>Add Description</button>
      <div className="mt-[33px] text-[17px] font-medium text-[#9a9a9f]">Campaign Options</div><div className="mt-3 overflow-hidden rounded-[14px] border border-[#242427]">{[['ti-percentage','Revenue share','20%'],['ti-repeat','Paid renewals','6 months'],['ti-lock','Require Approval','toggle']].map(([ic,label,value])=><div className="flex h-[50px] items-center gap-3 border-t border-[#242427] px-[18px] text-[20px] font-medium first:border-0" key={label}><Icon name={ic} className="text-[22px] text-[#bdbdc1]"/>{label}{value==='toggle'?<button className="tg on ml-auto" onClick={e=>e.currentTarget.classList.toggle('on')}/>:<span className="ml-auto text-[#a6a6aa]">{value}</span>}</div>)}</div>
      <button className="btn white mt-[50px] h-[54px] w-full rounded-xl text-[22px]" onClick={()=>{const n=campaignName.trim()||'Untitled campaign';setCreatedName(n);setFunded(false);setAppleConnected(false);setSdkConnected(false);go('pers','i');setToast('Campaign created. Finish setup to go live.')}} data-testid="button-create-campaign">Create Campaign</button>
    </div></div></div></section>;

  const withdraw = <section className="scr on"><div className="px-[100px] pb-[100px] pt-9"><button className="flex h-10 items-center gap-2 text-[18px] text-[#a6a6aa]" onClick={()=>go('earn')}><Icon name="ti-arrow-left"/>Back to earnings</button>
    {!withdrawDone ? <div className="mt-[14px] flex gap-10"><div className="w-[412px] flex-none"><div className="text-[34px] font-semibold leading-[44px]">Withdraw</div><div className="mt-1.5 text-[20px] text-[#dcdcde]">Send your earnings to your card.</div><div className="mt-[34px] text-[17px] text-[#9a9a9f]">Amount</div><div className="mt-2 flex h-24 items-center gap-[6px] rounded-2xl border border-[#242427] px-5"><span className="text-[50px] font-medium text-[#8d8d92]">$</span><input value={amount} onChange={e=>{setAmount(e.target.value);setWithdrawError('')}} className="h-16 min-w-0 flex-1 bg-transparent text-[50px] font-medium outline-none" aria-label="Withdrawal amount" /><button className="btn h-[34px]" onClick={()=>setAmount(balance.toFixed(2))}>Max</button></div>{withdrawError&&<div className="mt-2 text-[15px] text-[#fca5a5]">{withdrawError}</div>}<div className="mt-2 text-[15px] text-[#8d8d92]">Available {fmt(balance)} · Minimum $10.00</div><div className="mt-[22px]">{[['Fee','$0.00'],['Arrives','2 to 3 business days'],['You’ll receive',fmt(Math.max(0,Number(amount)||0))]].map(([k,v])=><div key={k} className="flex h-[54px] items-center justify-between border-t border-[#1f1f22] text-[18px]"><span className="text-[#9a9a9f]">{k}</span><span className={k==='You’ll receive'?'text-[20px] font-semibold':''}>{v}</span></div>)}</div></div>
      <div className="w-[708px] flex-none"><div className="h2">Pay out to</div><div className="sub mt-[3px]">Choose a card or add a new one.</div><div className="card mt-[25px] overflow-hidden">{cards.map(c=><div className="flex h-[83px] cursor-pointer items-center gap-4 border-t border-[#242427] px-[22px] first:border-0" key={c.id} onClick={()=>setSelectedCard(c.id)}><span className="flex h-9 w-[54px] items-center justify-center rounded-[7px] bg-[#26262a] text-[13px] font-bold">{c.brand}</span><div><div className="text-[20px] leading-7">{c.label}</div><div className="text-[17.5px] text-[#9a9a9f]">Expires {c.expires}</div></div><span className={`ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 ${selectedCard===c.id?'border-[#c9b8ff]':''}`}>{selectedCard===c.id&&<span className="h-3 w-3 rounded-full bg-[#c9b8ff]"/>}</span></div>)}
        <button className="flex h-[68px] w-full items-center gap-3 border-t border-[#242427] px-[22px] text-[20px] font-medium" onClick={()=>{setAddingCard(v=>!v);setCardError('')}}><Icon name="ti-plus" className="text-[22px]"/>Add a card</button>
        {addingCard&&<div className="border-t border-[#242427] p-[20px_22px_22px]"><label className="small-label mt-0 block">Name on card</label><input className="input-dark" placeholder="Full name" value={cardName} onChange={e=>setCardName(e.target.value)}/><label className="small-label block">Card number</label><input className="input-dark" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e=>setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 '))}/><div className="flex gap-[14px]"><div className="flex-1"><label className="small-label block">Expiry</label><input className="input-dark" placeholder="MM/YY" value={expiry} onChange={e=>{const v=e.target.value.replace(/\D/g,'').slice(0,4);setExpiry(v.length>2?`${v.slice(0,2)}/${v.slice(2)}`:v)}}/></div><div className="flex-1"><label className="small-label block">CVC</label><input className="input-dark" placeholder="123" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,'').slice(0,4))}/></div></div>{cardError&&<div className="mt-2 text-[15px] text-[#fca5a5]">{cardError}</div>}<div className="mt-[14px] text-[14.5px] text-[#7d7d82]">Card details go straight to Stripe. umi never stores them.</div><div className="mt-4 flex justify-end gap-[10px]"><button className="btn h-11" onClick={()=>setAddingCard(false)}>Cancel</button><button className="btn white h-11" onClick={()=>{const digits=cardNumber.replace(/\D/g,'');const [m,y]=expiry.split('/').map(Number);let error='';if(!cardName.trim())error='Enter the name on the card.';else if(digits.length<15)error='Enter a valid card number.';else if(!(m>=1&&m<=12)||!y)error='Enter an expiry date as MM/YY.';else if(cvc.length<3)error='Enter the security code.';if(error){setCardError(error);return}const id=Date.now();const brand=digits.startsWith('4')?'VISA':digits.startsWith('5')?'MC':'CARD';setCards(old=>[...old,{id,brand,label:`${brand==='MC'?'Mastercard':brand==='VISA'?'Visa':'Card'} ••••${digits.slice(-4)}`,expires:expiry}]);setSelectedCard(id);setAddingCard(false);setCardNumber('');setCardName('');setExpiry('');setCvc('')}}>Save card</button></div></div>}
      </div><button className="btn white mt-6 h-[54px] w-full rounded-xl text-[22px]" onClick={()=>{const n=Number(amount);let err='';if(!Number.isFinite(n)||!amount.trim())err='Enter an amount.';else if(n<10)err='The minimum withdrawal is $10.00.';else if(n>balance)err=`That’s more than your available balance of ${fmt(balance)}.`;else if(!cards.some(c=>c.id===selectedCard))err='Add a card to withdraw to.';if(err){setWithdrawError(err);return}setBalance(Math.round((balance-n)*100)/100);setWithdrawDone(true)}}>Withdraw</button></div>
    </div> : <div className="mx-auto mt-[90px] w-[520px] text-center"><div className="inline-flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[rgba(201,184,255,.16)] text-[38px] text-[#c9b8ff]"><Icon name="ti-check"/></div><div className="mt-5 text-[34px] font-semibold">Withdrawal requested</div><div className="mt-2 text-[19px] leading-7 text-[#a6a6aa]">We’ll send your withdrawal to your selected card. You’ll get a receipt by email.</div><button className="btn white mt-7 h-12 w-full text-xl" onClick={()=>go('earn')}>Back to earnings</button></div>}
  </div></section>;

  const developer = <section className="scr on"><div className="flex h-14 items-center gap-3 border-b border-[#1f1f22] px-5"><BrandMark size={26}/><span className="text-xl text-[#4a4a4f]">/</span><span className="text-[19px] font-semibold">Developer</span></div>
    <aside className="absolute bottom-0 left-0 top-14 w-[280px] border-r border-[#1f1f22] px-[14px]"><button className="mb-[22px] flex h-[60px] w-[280px] items-center gap-2 border-b border-[#1f1f22] px-5 text-[18px] text-[#a6a6aa]" onClick={()=>go('pers','i')}><Icon name="ti-arrow-left"/>Back to Personal</button><div className="mb-2 px-[6px] font-mono text-[14px] tracking-[.1em] text-[#7d7d82]">DEVELOPER</div>{[['API Keys','asc'],['SDK Setup','sdk']].map(([n,k])=><div key={k} className={`flex h-[38px] cursor-pointer items-center rounded-[9px] px-2 text-[18px] ${devTab===k?'bg-[#1b1b1d] text-white':'text-[#a6a6aa]'}`} onClick={()=>setDevTab(k)}>{n}</div>)}</aside>
    <main className="ml-[332px] w-[860px] pb-[100px] pt-[50px]">
      {devTab==='asc'?<><div className="text-[34px] font-medium leading-[42px] tracking-[-.5px]">API Keys</div><div className="sub mt-[6px]">Connect your app so umi can verify subscription purchases with Apple.</div><div className="mt-[34px] text-[21px] font-semibold">Umi app key</div><div className="mt-[6px] text-[17px] text-[#a6a6aa]">Public. Safe to put in your app.</div><div className="mt-4 flex gap-[10px]"><div className="flex h-[50px] flex-1 items-center overflow-hidden rounded-xl border border-[#2a2a2e] px-4 font-mono text-[17px]">umi_app_pl_8f2kQ4mT9x</div><button className="btn h-[50px] px-5" onClick={async()=>{try{await navigator.clipboard.writeText('umi_app_pl_8f2kQ4mT9x')}catch{}setCopied('appkey');window.setTimeout(()=>setCopied(''),1400)}}><Icon name={copied==='appkey'?'ti-check':'ti-copy'}/>{copied==='appkey'?'Copied':'Copy'}</button></div><div className="divider"/><div className="mt-[34px] flex items-center justify-between"><div className="h2 text-[21px]">App Store Connect key</div><span className={`pill ${appleConnected?'light':''}`}>{appleConnected?'Connected':'Not connected'}</span></div><div className="mt-[6px] text-[17px] leading-[25px] text-[#a6a6aa]">Create an In-App Purchase key in App Store Connect and enter its details. umi encrypts the private key and never shows it again.</div>
        {!appleConnected ? <><label className="small-label block">Bundle ID</label><input className="input-dark" placeholder="com.example.palazzolens" value={bundleId} onChange={e=>setBundleId(e.target.value)}/><div className="flex gap-[14px]"><div className="flex-1"><label className="small-label block">Issuer ID</label><input className="input-dark" placeholder="69a6de70-…" value={issuerId} onChange={e=>setIssuerId(e.target.value)}/></div><div className="flex-1"><label className="small-label block">Key ID</label><input className="input-dark" placeholder="2X9R4HXF34" value={keyId} onChange={e=>setKeyId(e.target.value)}/></div></div><label className="small-label block">Private key</label><button className="flex h-[60px] w-full items-center rounded-xl border border-dashed border-[#2a2a2e] px-4 text-[17px] text-[#9a9a9f]" onClick={()=>setKeyFile(true)}><Icon name={keyFile?'ti-file':'ti-upload'} className="mr-[10px] text-xl text-[#c9b8ff]"/>{keyFile?'AuthKey_2X9R4HXF34.p8':'Upload the .p8 file'}</button>{devError&&<div className="mt-2 text-[15px] text-[#fca5a5]">{devError}</div>}<button className="btn purple mt-5 h-[50px] px-6 text-[18px]" onClick={()=>{if(!bundleId.trim()||!issuerId.trim()||!keyId.trim()){setDevError('Fill in the bundle ID, issuer ID and key ID.');return}if(!keyFile){setDevError('Upload the .p8 private key.');return}setAppleConnected(true);setDevError('');setToast('App Store connected')}}>Connect App Store</button></>:
        <div className="mt-5 flex h-[72px] items-center gap-[14px] rounded-[14px] border border-[#242427] px-5"><Icon name="ti-circle-check" className="text-[26px] text-[#c9b8ff]"/><div><div className="text-[19px] font-medium">Key {keyId||'2X9R4HXF34'} connected</div><div className="text-[16px] text-[#8d8d92]">Private key encrypted. It won’t be shown again.</div></div></div>}
      </>:<><div className="flex items-start justify-between"><div><div className="text-[34px] font-medium leading-[42px] tracking-[-.5px]">SDK Setup</div><div className="sub mt-[6px]">iOS for now. Add the SDK so referrals and purchases are verified.</div></div><span className={`pill mt-2 ${sdkConnected?'light':''}`}>{sdkConnected?'Connected':'Not connected'}</span></div>
        {[
          ['Install the SDK',<><span className="text-[#6f6f74]">// Swift Package Manager (placeholder URL)</span><br/><span className="text-[#9be3c6]">https://github.com/umi/umi-ios</span></>],
          ['Configure it at launch',<><span className="text-[#c9b8ff]">Umi</span>.configure(appKey: <span className="text-[#9be3c6]">"umi_app_pl_8f2kQ4mT9x"</span>)</>],
          ['Resolve the referral',<><span className="text-[#c9b8ff]">Umi</span>.resolveReferral()<br/><span className="text-[#6f6f74]">// If nothing arrives, let people type a creator code:</span><br/><span className="text-[#c9b8ff]">Umi</span>.claimCreatorCode(code)</>],
          ['Bind and report purchases',<><span className="text-[#c9b8ff]">Umi</span>.bind(appAccountToken: token)<br/><span className="text-[#6f6f74]">// after a purchase</span><br/><span className="text-[#c9b8ff]">Umi</span>.reportTransaction(transaction.id)</>]
        ].map(([title,code],i)=><div className="mt-[34px] flex gap-4" key={String(title)}><span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-md border border-[#2e2e32] text-[14px] text-[#bdbdc1]">{i+1}</span><div className="min-w-0 flex-1"><div className="text-[21px] font-semibold">{title}</div><pre className="mt-[14px] whitespace-pre-wrap break-all rounded-xl border border-[#232326] p-[18px] font-mono text-[15.5px] leading-[25px] text-[#d8d8dc]">{code}</pre></div></div>)}
        <div className="mt-[34px] flex gap-4"><span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-md border border-[#2e2e32]">5</span><div><div className="text-[21px] font-semibold">Verify the connection</div><div className="mt-1 text-[18px] text-[#a6a6aa]">Run your app, then send a test event from here.</div><div className="mt-[14px] flex items-center gap-[14px]"><button className="btn white h-11 px-5 text-[18px]" onClick={()=>{setEventSent(true);setSdkConnected(true);setToast('Connected · test event received')}}>Send test event</button><span className="text-[17px] text-[#c9b8ff]">{eventSent?'Connected · test event received':''}</span></div></div></div>
      </>}
    </main>
  </section>;

  const notifications = (
    <>
      <div className="overlay" onClick={() => setNotificationOpen(false)} />
      <div className="notification-panel fixed bottom-0 left-[56px] top-0 z-50 w-[420px] overflow-y-auto border-r border-[#1a1a1c] bg-[#0a0a0a] px-4 pb-12 shadow-2xl">
        <div className="flex h-[54px] items-center justify-between pt-2 border-b border-[#18181b]">
          <div className="text-[20px] font-bold text-white">Notifications</div>
          <button
            type="button"
            onClick={() => setNotificationOpen(false)}
            className="text-[#8d8d92] hover:text-white transition-colors cursor-pointer text-[18px]"
          >
            <Icon name="ti-x" />
          </button>
        </div>

        {/* 1. Meta Global AI Developer Hackathon */}
        <div className="mt-4 flex gap-3">
          <img src="/assets/meta-hackathon-badge.png?v=2" alt="Meta Global AI Developer Hackathon" className="h-9 w-9 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold leading-5 text-white">
              Meta Global AI Developer Hackathon <span className="ml-1 text-[13px] font-normal text-[#8d8d92]">4d</span>
            </div>
            <div className="mt-0.5 text-[14.5px] font-medium leading-5 text-white">
              You're approved for this event
            </div>
          </div>
        </div>

        {/* 2. Cerebral Valley - Jul 7 */}
        <div className="mt-6 flex gap-3">
          <img src="/assets/cerebral-valley-badge.png?v=2" alt="Cerebral Valley" className="h-9 w-9 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold leading-5 text-white">
              Cerebral Valley <span className="ml-1 text-[13px] font-normal text-[#8d8d92]">Jul 7</span>
            </div>
            <div className="mt-0.5 text-[14px] leading-5 text-white">
              sent an announcement for <b className="font-semibold text-white">Built with Claude: Life Sciences...</b>
            </div>
            <div className="mt-2 rounded-xl border border-[#27272a] bg-[#121214] p-3 text-[13.5px] leading-[19px] text-[#d4d4d8]">
              Thank you for applying to Built with Claude: Life Sciences in partnership with <b className="text-white font-semibold">Gladstone Institutes</b>. We received an incredible number of applicatio...
            </div>
          </div>
        </div>

        {/* 3. Cerebral Valley - Apr 23 */}
        <div className="mt-6 flex gap-3">
          <img src="/assets/cerebral-valley-badge.png?v=2" alt="Cerebral Valley" className="h-9 w-9 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold leading-5 text-white">
              Cerebral Valley <span className="ml-1 text-[13px] font-normal text-[#8d8d92]">Apr 23</span>
            </div>
            <div className="mt-0.5 text-[14px] leading-5 text-white">
              sent an announcement for <b className="font-semibold text-white">Built with Opus 4.7: a Claude Code hackathon.</b>
            </div>
            <div className="mt-2 rounded-xl border border-[#27272a] bg-[#121214] p-3 text-[13.5px] leading-[19px] text-[#d4d4d8]">
              Thank you for applying to the Built with Opus 4.7: a Claude Code hackathon. After reviewing all subm...
            </div>
          </div>
        </div>

        {/* 4. Cerebral Valley - Apr 21 */}
        <div className="mt-6 flex gap-3">
          <img src="/assets/cerebral-valley-badge.png?v=2" alt="Cerebral Valley" className="h-9 w-9 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold leading-5 text-white">
              Cerebral Valley <span className="ml-1 text-[13px] font-normal text-[#8d8d92]">Apr 21</span>
            </div>
            <div className="mt-0.5 text-[14px] leading-5 text-white">
              sent an announcement for <b className="font-semibold text-white">Built with Opus 4.7: a Claude Code hackathon.</b>
            </div>
            <div className="mt-2 rounded-xl border border-[#27272a] bg-[#121214] p-3 text-[13.5px] leading-[19px] text-[#d4d4d8]">
              Thank you for applying to the Built with Opus 4.7: a Claude Code hackathon. We received an incredibl...
            </div>
          </div>
        </div>

        {/* 5. Cerebral Valley - Apr 20 */}
        <div className="mt-6 flex gap-3">
          <img src="/assets/cerebral-valley-badge.png?v=2" alt="Cerebral Valley" className="h-9 w-9 flex-none rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold leading-5 text-white">
              Cerebral Valley <span className="ml-1 text-[13px] font-normal text-[#8d8d92]">Apr 20</span>
            </div>
            <div className="mt-0.5 text-[14px] leading-5 text-white">
              sent an announcement for <b className="font-semibold text-white">Built with Opus 4.7: a Claude Code hackathon.</b>
            </div>
            <div className="mt-2 rounded-xl border border-[#27272a] bg-[#121214] p-3 text-[13.5px] leading-[19px] text-[#d4d4d8]">
              Thank you for applying to Built with Opus 4.7: a Claude Code hackathon! We received an incredible nu...
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const moreMenu = (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
      <div className="fixed bottom-14 left-3 z-50 w-[190px] rounded-2xl border border-[#26262a] bg-[#111113] py-2 shadow-2xl">
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => go('disc')}>Campaigns</button>
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => go('earn')}>Earnings</button>
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => go('pers','c')}>Personal</button>
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => go('dev','asc')}>Developer</button>
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => { setMoreOpen(false); setSettingsOpen(true); }}>Settings</button>
        {['About','Privacy Policy','Terms of Service'].map(label => <button key={label} className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium hover:bg-[#1a1a1c]" onClick={() => { setMoreOpen(false); setToast(label); }}>{label}</button>)}
        <div className="my-1 border-t border-[#26262a]"/>
        <button className="flex h-[41px] w-full items-center px-4 text-left text-[16px] font-medium text-[#fca5a5] hover:bg-[#1a1a1c]" onClick={() => { setMoreOpen(false); setToast('Signed out'); }}>Log Out</button>
      </div>
    </>
  );

  const settingsModal = (
    <>
      <div className="overlay" onClick={() => setSettingsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSettingsOpen(false)}>
        <div className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#242428] bg-[#0c0c0e] p-6 shadow-2xl my-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-2 border-b border-[#1c1c20]">
            <h2 className="text-[20px] font-bold text-white">Settings</h2>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="text-[#8d8d92] hover:text-white transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <Icon name="ti-x" className="text-[20px]" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-[17px] font-bold text-white">Notifications</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Email Notifications</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Receive updates by email.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailNotif}
                  onClick={() => setEmailNotif(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors duration-200 cursor-pointer ${emailNotif ? 'bg-[#c9b8ff]' : 'bg-[#2c2c30]'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${emailNotif ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Event Invitations</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Emails inviting you to events you haven't joined.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={eventNotif}
                  onClick={() => setEventNotif(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors duration-200 cursor-pointer ${eventNotif ? 'bg-[#c9b8ff]' : 'bg-[#2c2c30]'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${eventNotif ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">SMS Notifications</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Verify your phone number to receive text messages.</div>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-[#2b2b30] bg-[#161618] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#202024] cursor-pointer whitespace-nowrap flex-none"
                  onClick={() => setToast('Verification SMS sent')}
                >
                  Verify Phone Number
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Chat Goal Alerts</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Get notified when your bot completes its chat goal.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={chatGoalAlerts}
                  onClick={() => setChatGoalAlerts(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors duration-200 cursor-pointer ${chatGoalAlerts ? 'bg-[#c9b8ff]' : 'bg-[#2c2c30]'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${chatGoalAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[17px] font-bold text-white">Account</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Organization Account</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Switch to an organization account to add and manage members.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={orgAccount}
                  onClick={() => setOrgAccount(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors duration-200 cursor-pointer ${orgAccount ? 'bg-[#c9b8ff]' : 'bg-[#2c2c30]'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${orgAccount ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Log Out</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Log out on this device.</div>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-[#2b2b30] bg-[#161618] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#202024] cursor-pointer whitespace-nowrap flex-none"
                  onClick={() => setToast('Logged out')}
                >
                  Log Out
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">Delete Account</div>
                  <div className="text-[13.5px] text-[#8d8d92]">Permanently delete your account and profile. This cannot be undone.</div>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-[#2f1c20] hover:bg-[#3d2429] border border-[#5a2c33]/40 px-4 py-1.5 text-[13px] font-medium text-[#fca5a5] transition-colors cursor-pointer whitespace-nowrap flex-none"
                  onClick={() => setToast('Account deletion requested')}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const current = screen === 'disc' ? discovery : screen === 'earn' ? earnings : screen === 'prof' ? profile : screen === 'pers' ? personal : screen === 'camp' ? campaignDetail : screen === 'join' ? joinScreen : screen === 'new' ? newCampaign : screen === 'wd' ? withdraw : developer;
  const isScaled = scale < 1;

  return (
    <div ref={stageRef} className="umi-stage">
      <div
        ref={appRef}
        className="umi-app"
        style={isScaled ? { transform: `scale(${scale})`, transformOrigin: 'top left', width: 1100 } : undefined}
      >
        {current}
      </div>
      {moreOpen && moreMenu}
      {notificationOpen && notifications}
      {settingsOpen && settingsModal}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
