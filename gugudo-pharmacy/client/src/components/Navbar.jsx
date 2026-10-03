import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store';
import { LANGS } from '../i18n';
import { useWishlist } from '../pages/Wishlist';
import { api } from '../api';

/* ============ EASY SETTINGS ============ */
const NAV_THEME = 'white'; // 'white' (clean, like your Figma) or 'teal' (solid brand colour)
const ROUTES = { about: '/about', contact: '/contact', wishlist: '/wishlist' };
/* ======================================= */

const THEMES = {
  white: {
    bar: 'bg-white/95 border-[#e5e4dc] dark:bg-slate-900/95 dark:border-slate-700',
    logo: 'text-[#0e6f7e] dark:text-white', mark: 'bg-[#0e6f7e] text-white',
    link: 'text-slate-600 hover:text-brand dark:text-slate-300', linkOn: 'text-brand after:bg-brand',
    icon: 'border-[#d6d9d2] bg-white text-slate-700 hover:border-brand hover:text-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
    iconOn: 'border-brand bg-brand text-white',
    cta: 'btn', account: 'border-[#d6d9d2] bg-white text-slate-800 hover:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white',
  },
  teal: {
    bar: 'bg-[#0e6f7e] border-[#0a4f5b] dark:bg-[#0a4f5b]',
    logo: 'text-white', mark: 'bg-white text-[#0e6f7e]',
    link: 'text-white/80 hover:text-white', linkOn: 'text-white after:bg-white',
    icon: 'border-white/30 bg-white/10 text-white hover:bg-white/20',
    iconOn: 'border-white bg-white text-[#0e6f7e]',
    cta: 'btn !bg-white !text-[#0e6f7e] hover:!bg-[#e6f6f8]', account: 'border-white/30 bg-white/10 text-white hover:bg-white/20',
  },
};

// Labels this navbar adds itself, so no other file needs editing.
const EXTRA = {
  en: { wishlist: 'Wishlist', about: 'About', contact: 'Contact', signInUp: 'Log in / Sign up', categories: 'Categories', allMeds: 'All medicines' },
  om: { wishlist: 'Fedhii koo', about: 'Waa’ee keenya', contact: 'Nu qunnamaa', signInUp: "Seeni / Galmaa'i", categories: 'Gosoota', allMeds: 'Qorichoota hunda' },
  am: { wishlist: 'ተወዳጆች', about: 'ስለ እኛ', contact: 'አግኙን', signInUp: 'ግባ / ተመዝገብ', categories: 'ምድቦች', allMeds: 'ሁሉም መድኃኒቶች' },
};

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const HeartIcon = () => <Svg><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></Svg>;
const CartIcon = () => <Svg><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></Svg>;
const GlobeIcon = () => <Svg><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></Svg>;

function useOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return ref;
}

// Category dropdown: opens on hover (desktop), on tap/click, or as an expandable list on mobile
function CategoryMenu({ th, x, inline = false }) {
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const timer = useRef(null);
  useEffect(() => { api('/categories').then(setCats).catch(() => {}); }, []);
  const show = () => { clearTimeout(timer.current); setOpen(true); };
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 160); };
  const item = 'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-brand-light hover:text-brand dark:text-slate-200 dark:hover:bg-slate-700';
  const arrow = <span aria-hidden className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>;
  const list = (
    <>
      <Link to="/catalog" className={`${item} !font-bold`} onClick={() => setOpen(false)}>{x('allMeds')}</Link>
      {cats.map((c) => (
        <Link key={c.id} to={`/catalog?category=${c.id}`} className={item} onClick={() => setOpen(false)}>
          {c.name}<span aria-hidden className="text-slate-300">›</span>
        </Link>
      ))}
    </>
  );
  const btn = `flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition ${th.link}`;

  if (inline) return (
    <div>
      <button type="button" className={`${btn} w-full justify-between`} aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{x('categories')}{arrow}</button>
      {open && <div className="ml-3 border-l pl-2 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>{list}</div>}
    </div>
  );
  return (
    <div className="relative" ref={ref} onMouseEnter={show} onMouseLeave={hide} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button type="button" className={btn} aria-haspopup="menu" aria-expanded={open} onClick={show}>{x('categories')}{arrow}</button>
      {open && <div role="menu" className="card absolute left-0 top-full z-50 mt-1 w-64 p-1.5 shadow-xl">{list}</div>}
    </div>
  );
}

function IconLink({ th, to, label, count, children }) {
  return (
    <NavLink to={to} aria-label={label} title={label}
      className={({ isActive }) => `relative grid h-10 w-10 place-items-center rounded-full border transition ${isActive ? th.iconOn : th.icon}`}>
      {children}
      {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">{count}</span>}
    </NavLink>
  );
}

// Custom language dropdown (replaces the plain browser select)
function LangMenu({ th, align = 'right' }) {
  const { lang, changeLang } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
        className={`flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-bold transition ${th.icon}`}>
        <GlobeIcon />{cur.label}<span aria-hidden className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <ul role="listbox" className={`card absolute top-full z-50 mt-2 w-52 p-1.5 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {LANGS.map((l) => {
            const on = l.code === lang;
            return (
              <li key={l.code}>
                <button type="button" role="option" aria-selected={on} onClick={() => { changeLang(l.code); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-brand-light dark:hover:bg-slate-700 ${on ? 'bg-brand-light text-brand dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200'}`}>
                  {l.label}{on && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Prefs({ th, align }) {
  const { theme, changeTheme } = useApp();
  return (
    <div className="flex items-center gap-2">
      <LangMenu th={th} align={align} />
      <button type="button" className={`grid h-10 w-10 place-items-center rounded-full border transition ${th.icon}`} aria-label="Toggle light and dark mode" title="Light / dark" onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
    </div>
  );
}

// One button: "Log in / Sign up" when signed out, account menu when signed in.
function Account({ th, inline = false, x }) {
  const { t, user, logout } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));

  if (!user) return <Link to="/login" className={`${th.cta} !py-2.5 whitespace-nowrap`}>{x('signInUp')}</Link>;

  const items = user.role === 'CUSTOMER'
    ? [['/orders', t('orders')], ['/addresses', t('addresses')], ['/support', t('support')]]
    : [['/admin', t('dashboard')]];
  const out = () => { logout(); nav('/'); };
  const row = 'block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-brand-light dark:text-slate-200 dark:hover:bg-slate-700';

  if (inline) return (
    <div className="grid gap-1">
      {items.map(([to, label]) => <Link key={to} to={to} className={row}>{label}</Link>)}
      <button className={`${row} !text-red-600`} onClick={out}>{t('logout')} ({user.name.split(' ')[0]})</button>
    </div>
  );
  return (
    <div className="relative" ref={ref}>
      <button className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-bold ${th.account}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-xs text-white">{user.name[0]?.toUpperCase()}</span>{user.name.split(' ')[0]} <span aria-hidden className="text-[10px]">▼</span>
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-full z-50 mt-2 w-52 p-1.5 shadow-xl" onClick={() => setOpen(false)}>
          {items.map(([to, label]) => <Link key={to} to={to} className={row}>{label}</Link>)}
          <button className={`${row} !text-red-600`} onClick={out}>{t('logout')}</button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { t, lang, cart } = useApp();
  const wish = useWishlist().ids;
  const th = THEMES[NAV_THEME] || THEMES.white;
  const lightTh = THEMES.white; // mobile menu panel is always light
  const x = (k) => EXTRA[lang]?.[k] ?? EXTRA.en[k];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = (t_) => ({ isActive }) =>
    `relative px-3 py-2 text-sm font-bold transition ${isActive ? `${t_.linkOn} after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full` : t_.link}`;
  const links = (t_, inline = false) => (
    <>
      <NavLink to="/" end className={linkCls(t_)}>{t('home')}</NavLink>
      <NavLink to="/catalog" className={linkCls(t_)}>{t('catalog')}</NavLink>
      <CategoryMenu th={t_} x={x} inline={inline} />
      <NavLink to={ROUTES.about} className={linkCls(t_)}>{x('about')}</NavLink>
      <NavLink to={ROUTES.contact} className={linkCls(t_)}>{x('contact')}</NavLink>
    </>
  );

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur transition duration-300 ${th.bar} ${scrolled ? 'shadow-md' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className={`flex items-center gap-2 text-2xl font-bold ${th.logo}`} style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          <span className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${th.mark}`}>✚</span>Gugudo
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{links(th)}</nav>

        <div className="hidden items-center gap-2 md:flex">
          <IconLink th={th} to={ROUTES.wishlist} label={x('wishlist')} count={wish.length}><HeartIcon /></IconLink>
          <IconLink th={th} to="/cart" label={t('cart')} count={count}><CartIcon /></IconLink>
          <Prefs th={th} align="right" />
          <Account th={th} x={x} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <IconLink th={th} to={ROUTES.wishlist} label={x('wishlist')} count={wish.length}><HeartIcon /></IconLink>
          <IconLink th={th} to="/cart" label={t('cart')} count={count}><CartIcon /></IconLink>
          <button className={`grid h-10 w-10 place-items-center rounded-full border ${th.icon}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? '✕' : '☰'}</button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#e5e4dc] bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:hidden" onClick={() => setOpen(false)}>
          <nav className="flex flex-col" aria-label="Mobile">{links(lightTh, true)}</nav>
          <div className="my-3 border-t pt-3 dark:border-slate-700" onClick={(e) => e.stopPropagation()}><Prefs th={lightTh} align="left" /></div>
          <div className="border-t pt-3 dark:border-slate-700"><Account th={lightTh} inline x={x} /></div>
        </div>
      )}
    </header>
  );
}