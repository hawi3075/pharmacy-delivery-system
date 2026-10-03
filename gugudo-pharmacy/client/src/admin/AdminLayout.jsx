import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';

const L = {
  en: { orders: 'Orders', reviews: 'Reviews', manage: 'Manage', superAdmin: 'Super admin', store: 'Back to store', admin: 'Admin', super: 'Super admin', console: 'Pharmacy console' },
  om: { orders: 'Ajajawwan', reviews: 'Yaada', manage: 'Bulchiinsa', superAdmin: 'Bulchaa olaanaa', store: 'Gara suuqiitti deebi’i', admin: 'Bulchaa', super: 'Bulchaa olaanaa', console: 'Gabatee bulchiinsaa' },
  am: { orders: 'ትዕዛዞች', reviews: 'ግምገማዎች', manage: 'አስተዳደር', superAdmin: 'ዋና አስተዳዳሪ', store: 'ወደ መደብር ተመለስ', admin: 'አስተዳዳሪ', super: 'ዋና አስተዳዳሪ', console: 'የአስተዳደር ፓነል' },
};

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  orders: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12h6M9 16h4" /></>,
  products: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 7.5 12 12l8.7-4.5M12 22V12" /></>,
  reviews: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  customers: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  finance: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" /><circle cx="16" cy="14.5" r="1" /></>,
  admins: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  audit: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  store: <><path d="M3 9l1-5h16l1 5" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">{ICONS[name]}</svg>
);

export default function AdminLayout() {
  const { t, lang, user, logout } = useApp();
  const nav = useNavigate();
  const x = (k) => L[lang]?.[k] ?? L.en[k];
  const [counts, setCounts] = useState({ pending: 0, unread: 0 });

  // Live badges (pending orders, unread messages), refreshed every 30 seconds
  useEffect(() => {
    const load = () => {
      api('/admin/stats').then((s) => setCounts((c) => ({ ...c, pending: s.pending }))).catch(() => {});
      api('/admin/messages').then((th) => setCounts((c) => ({ ...c, unread: th.reduce((n, i) => n + i.unread, 0) }))).catch(() => {});
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const manage = [
    { to: '/admin', end: true, icon: 'dashboard', label: t('dashboard') },
    { to: '/admin/orders', icon: 'orders', label: x('orders'), badge: counts.pending },
    { to: '/admin/products', icon: 'products', label: t('products') },
    { to: '/admin/reviews', icon: 'reviews', label: x('reviews') },
    { to: '/admin/messages', icon: 'messages', label: t('messages'), badge: counts.unread },
    { to: '/admin/customers', icon: 'customers', label: t('customers') },
    { to: '/admin/finance', icon: 'finance', label: t('finance') },
  ];
  const isSuper = user.role === 'SUPER_ADMIN';
  const sup = [
    { to: '/admin/admins', icon: 'admins', label: t('admins') },
    { to: '/admin/audit', icon: 'audit', label: t('audit') },
  ];

  const side = ({ isActive }) =>
    `flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-bold transition ${isActive
      ? 'bg-brand text-white shadow-md'
      : 'text-slate-600 hover:bg-brand-light hover:text-brand dark:text-slate-300 dark:hover:bg-slate-700'}`;
  const pill = ({ isActive }) =>
    `flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${isActive
      ? 'border-brand bg-brand text-white'
      : 'border-[#d6d9d2] bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`;

  const Badge = ({ n }) => n > 0 ? <span className="ml-auto grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-rose-600 px-1.5 text-xs font-bold text-white">{n}</span> : null;
  const group = (title, items) => (
    <div className="mt-2">
      <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="grid gap-1">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={side}>
            <Icon name={i.icon} /><span>{i.label}</span><Badge n={i.badge} />
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Mobile: compact scrolling tabs */}
      <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden" aria-label="Admin">
        {[...manage, ...(isSuper ? sup : [])].map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={pill}><Icon name={i.icon} />{i.label}{i.badge > 0 && <span className="rounded-full bg-rose-600 px-1.5 text-xs text-white">{i.badge}</span>}</NavLink>
        ))}
      </nav>

      {/* Desktop: large full-height sidebar */}
      <aside className="card hidden flex-col p-5 md:sticky md:top-[5.25rem] md:flex md:h-[calc(100vh-6.5rem)]" aria-label="Admin">
        <div className="flex items-center gap-3 rounded-2xl bg-brand-light p-4 dark:bg-slate-700">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-white">{user.name[0]?.toUpperCase()}</span>
          <div className="min-w-0">
            <p className="truncate font-bold">{user.name}</p>
            <p className="text-xs font-semibold text-brand">{isSuper ? x('super') : x('admin')} · {x('console')}</p>
          </div>
        </div>

        <nav className="no-scrollbar mt-3 flex-1 overflow-y-auto" aria-label="Admin menu">
          {group(x('manage'), manage)}
          {isSuper && group(x('superAdmin'), sup)}
        </nav>

        <div className="mt-3 grid gap-1 border-t border-[#e5e4dc] pt-3 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-600 transition hover:bg-brand-light hover:text-brand dark:text-slate-300 dark:hover:bg-slate-700"><Icon name="store" />{x('store')}</Link>
          <button type="button" onClick={() => { logout(); nav('/'); }} className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-left text-[15px] font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"><Icon name="logout" />{t('logout')}</button>
        </div>
      </aside>

      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}