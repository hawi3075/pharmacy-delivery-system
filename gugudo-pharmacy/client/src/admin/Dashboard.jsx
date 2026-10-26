import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { Badge, fmtDate, money } from '../components/ui';

const icons = {
  orders: 'M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6l2-4zM4 6h16M9 10a3 3 0 0 0 6 0',
  clock: 'M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  cash: 'M3 7h18v10H3zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.5l8.7-5M12 22V12.5',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  plus: 'M12 5v14M5 12h14',
};

const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={icons[name]} />
  </svg>
);

const tones = {
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

const Stat = ({ label, value, hint, icon, tone = 'teal', warn }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_30px_rgba(6,59,72,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(6,59,72,0.12)] dark:border-slate-700 dark:bg-slate-800">
    <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-[#9ee7d5]/20 transition group-hover:scale-125" />
    <div className="relative flex items-start justify-between">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[warn ? 'red' : tone]}`}><Icon name={icon} /></span>
    </div>
    <p className={`relative mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white ${warn ? 'text-red-600 dark:text-red-300' : ''}`}>{value}</p>
    <p className="relative mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>
  </div>
);

const QuickAction = ({ to, icon, title, detail, tone = 'teal' }) => (
  <Link to={to} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#08a0b5] hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon name={icon} /></span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-bold text-slate-800 dark:text-white">{title}</span>
      <span className="mt-0.5 block truncate text-xs text-slate-500">{detail}</span>
    </span>
    <Icon name="arrow" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand" />
  </Link>
);

function RevenueChart({ days }) {
  const max = Math.max(1, ...days.map(([, value]) => value));
  const points = days.map(([day, value], index) => {
    const x = days.length === 1 ? 50 : (index / (days.length - 1)) * 100;
    const y = 94 - (value / max) * 76;
    return { day, value, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = points.length ? `0,100 ${line} 100,100` : '';

  if (!days.length) {
    return <div className="mt-6 grid h-48 place-items-center rounded-xl border border-dashed text-center text-sm text-slate-500 dark:border-slate-700"><div><p className="font-semibold text-slate-700 dark:text-slate-200">No sales yet</p><p>Revenue will appear here once your first order is paid.</p></div></div>;
  }

  return (
    <div className="mt-5">
      <div className="relative h-52">
        {[0, 25, 50, 75, 100].map((grid) => <div key={grid} className="absolute inset-x-0 border-t border-dashed border-slate-200 dark:border-slate-700" style={{ top: `${grid}%` }} />)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#08a0b5" stopOpacity=".35" /><stop offset="100%" stopColor="#08a0b5" stopOpacity=".02" /></linearGradient></defs>
          <polygon points={area} fill="url(#revenueFill)" />
          <polyline points={line} fill="none" stroke="#078b9d" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          {points.map((point) => <circle key={point.day} cx={point.x} cy={point.y} r="1.8" fill="white" stroke="#078b9d" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex justify-between pt-2">
          {points.map((point) => <span key={point.day} className="text-[10px] text-slate-500">{point.day.slice(5)}</span>)}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>7-day revenue trend</span><span className="font-bold text-brand">Peak: {money(Math.max(...days.map(([, value]) => value)))}</span></div>
    </div>
  );
}

export default function Dashboard() {
  const { t, user } = useApp();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSuper = user?.role === 'SUPER_ADMIN';

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api('/admin/stats').then(setS).catch(() => setError('We could not load the latest pharmacy metrics. Please try again.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => s ? Object.entries(s.byDay).sort() : [], [s]);
  const mean = days.length ? days.reduce((sum, [, value]) => sum + value, 0) / days.length : 0;
  const stockIssues = s ? s.lowStock + s.outOfStock : 0;
  const greeting = isSuper ? 'System overview' : 'Today at the pharmacy';

  if (error && !s) return <div className="card mx-auto mt-8 max-w-xl p-8 text-center"><p className="font-bold text-red-600">{error}</p><button onClick={load} className="btn mt-5">Try again</button></div>;
  if (!s) return <div className="grid min-h-96 place-items-center text-sm font-semibold text-slate-500">Loading your pharmacy dashboard...</div>;

  return (
    <div className="pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#063b48] px-5 py-6 text-white shadow-xl shadow-[#063b48]/20 sm:px-8 sm:py-7">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#08a0b5]/30 blur-2xl" />
        <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#9ee7d5]/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9ee7d5]"><span className="h-2 w-2 rounded-full bg-[#9ee7d5]" />Live operations</div>
            <p className="text-sm font-semibold text-white/60">{greeting}</p>
            <h1 className="mt-1 font-serif text-3xl font-extrabold sm:text-4xl">{t('dashboard')}, {user?.name?.split(' ')[0] || 'there'}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">A clear view of orders, revenue, customer activity and stock risks across Gugudo Pharma.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#9ee7d5] px-4 py-2.5 text-sm font-bold text-[#063b48] transition hover:bg-white"><Icon name="orders" className="h-4 w-4" />Open order queue</Link>
            <button onClick={load} disabled={loading} className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 transition hover:bg-white/20 disabled:opacity-60" aria-label="Refresh dashboard"><Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
      </section>

      {error && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{error}</div>}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total orders" value={s.orders} hint="All-time orders" icon="orders" />
        <Stat label="Needs review" value={s.pending} hint={s.pending ? 'Pending order queue' : 'All caught up'} icon="clock" tone="amber" warn={s.pending > 0} />
        <Stat label="Revenue collected" value={money(s.revenue)} hint="Paid order revenue" icon="cash" />
        <Stat label={t('customers')} value={s.customers} hint="Registered customers" icon="users" tone="blue" />
        <Stat label="Low stock" value={s.lowStock} hint={s.lowStock ? 'Restock soon' : 'Stock levels healthy'} icon="alert" warn={s.lowStock > 0} />
        <Stat label="Out of stock" value={s.outOfStock} hint={s.outOfStock ? 'Unavailable now' : 'Nothing missing'} icon="box" warn={s.outOfStock > 0} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#08a0b5]" /><h2 className="font-serif text-2xl font-bold">Revenue pulse</h2></div><p className="mt-1 text-xs text-slate-500">Paid and completed orders from the last seven days</p></div>
            <div className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-right dark:bg-teal-900/30"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily average</p><p className="text-sm font-extrabold text-[#087f8d]">{money(mean)}</p></div>
          </div>
          <RevenueChart days={days} />
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="font-serif text-2xl font-bold">Inventory health</h2><p className="mt-1 text-xs text-slate-500">Items needing attention today</p></div><Link to="/admin/products" className="text-xs font-bold text-brand hover:underline">Manage stock</Link></div>
          <div className="mt-6 flex items-center gap-5"><div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#ef4444 ${stockIssues ? Math.max(8, (s.outOfStock / stockIssues) * 100) : 0}%, #f59e0b 0  ${stockIssues ? Math.max(18, ((s.outOfStock + s.lowStock) / Math.max(1, s.orders)) * 100) : 0}%, #0d9488 0)` }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center dark:bg-slate-800"><b className="text-2xl">{stockIssues}</b><span className="text-[10px] text-slate-500">at risk</span></div></div><div className="min-w-0 flex-1 space-y-3 text-sm"><div className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-500" />Low stock</span><b>{s.lowStock}</b></div><div className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-red-500" />Out of stock</span><b>{s.outOfStock}</b></div><div className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-teal-600" />Healthy</span><b>{Math.max(0, s.orders - stockIssues)}</b></div></div></div>
          <div className={`mt-6 rounded-xl p-3 text-sm font-semibold ${stockIssues ? tones.red : tones.teal}`}>{stockIssues ? `${stockIssues} product${stockIssues > 1 ? 's' : ''} need restocking.` : 'All products are well stocked.'}</div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-700"><div><h2 className="font-serif text-2xl font-bold">Latest orders</h2><p className="mt-1 text-xs text-slate-500">Keep the fulfillment queue moving</p></div><Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">View all <Icon name="arrow" className="h-3.5 w-3.5" /></Link></div>
          {s.recent.length === 0 ? <p className="p-5 text-sm text-slate-500">No orders yet. New orders will show up here.</p> : <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-slate-50 text-left dark:bg-slate-900/40"><th className="td text-[11px] uppercase tracking-wider text-slate-500">Order</th><th className="td text-[11px] uppercase tracking-wider text-slate-500">Customer</th><th className="td text-[11px] uppercase tracking-wider text-slate-500">Total</th><th className="td text-[11px] uppercase tracking-wider text-slate-500">Status</th><th className="td text-[11px] uppercase tracking-wider text-slate-500">Date</th></tr></thead><tbody>{s.recent.map((o) => <tr key={o.id} className="border-t border-slate-100 dark:border-slate-700"><td className="td font-bold text-brand">{o.code}</td><td className="td">{o.customer.name}</td><td className="td font-semibold">{money(o.total)}</td><td className="td"><Badge v={o.status} /></td><td className="td whitespace-nowrap text-xs text-slate-500">{fmtDate(o.createdAt)}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold">Quick actions</h2><p className="mt-1 text-xs text-slate-500">Common pharmacy tasks</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f7f5] text-brand dark:bg-teal-900/30"><Icon name="plus" className="h-4 w-4" /></span></div>
          <div className="mt-4 grid gap-2.5"><QuickAction to="/admin/products" icon="box" title="Add a product" detail="Update your medicine catalog" /><QuickAction to="/admin/orders" icon="clock" title="Review pending orders" detail={`${s.pending} order${s.pending === 1 ? '' : 's'} waiting`} tone="amber" /><QuickAction to="/admin/customers" icon="users" title="View customers" detail="Open customer activity" tone="blue" />{isSuper && <QuickAction to="/admin/audit" icon="shield" title="Review audit trail" detail="Monitor system activity" tone="teal" />}</div>
        </section>
      </div>

      {isSuper && <section className="mt-5 overflow-hidden rounded-2xl border border-[#b9e8dd] bg-gradient-to-r from-[#e7f8f3] to-white p-5 dark:border-teal-900 dark:from-teal-950/60 dark:to-slate-800 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#063b48] text-[#9ee7d5]"><Icon name="shield" /></span><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#087f8d]">Super admin control center</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#063b48] dark:text-white">Keep the whole operation accountable</h2><p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Manage privileged users and review changes across the pharmacy without leaving your command center.</p></div></div><div className="flex gap-2"><Link to="/admin/admins" className="btn !rounded-xl !px-3 !py-2 text-xs">Manage admins</Link><Link to="/admin/audit" className="btn-ghost !rounded-xl !px-3 !py-2 text-xs">Open audit trail</Link></div></div></section>}
    </div>
  );
}
