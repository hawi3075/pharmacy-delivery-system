import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { LANGS } from '../i18n';

export function Prefs() {
  const { lang, changeLang, theme, changeTheme } = useApp();
  return (
    <div className="flex items-center gap-2">
      <select aria-label="Language" value={lang} onChange={(e) => changeLang(e.target.value)} className="input !w-auto !rounded-full !px-3 !py-1.5">
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <button className="btn-ghost !px-3 !py-1.5" aria-label="Toggle theme" onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
    </div>
  );
}

export default function Navbar() {
  const { t, user, logout, cart } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const staff = user && user.role !== 'CUSTOMER';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-bold transition ${isActive
      ? 'text-brand after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand'
      : 'text-slate-600 hover:text-brand dark:text-slate-300'}`;

  return (
    <header className={`sticky top-0 z-30 border-b transition duration-300 ${scrolled
      ? 'border-[#e5e4dc] bg-[#f8f6f0]/90 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/90'
      : 'border-transparent bg-[#f8f6f0] dark:bg-slate-950'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#207065]" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6f7e] text-lg text-white" style={{ fontFamily: 'inherit' }}>✚</span>Gugudo
        </Link>
        <button className="rounded-full border border-[#d6d9d2] px-3 py-1.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? '✕' : '☰'}</button>
        <nav
          className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-[#e5e4dc] bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:dark:bg-transparent`}
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end className={link}>{t('home')}</NavLink>
          <NavLink to="/catalog" className={link}>{t('catalog')}</NavLink>
          {user?.role === 'CUSTOMER' && <>
            <NavLink to="/orders" className={link}>{t('orders')}</NavLink>
            <NavLink to="/addresses" className={link}>{t('addresses')}</NavLink>
            <NavLink to="/support" className={link}>{t('support')}</NavLink>
          </>}
          {staff && <NavLink to="/admin" className={link}>{t('dashboard')}</NavLink>}
          <NavLink to="/cart" className={({ isActive }) => `ml-1 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-brand text-white' : 'bg-brand-light text-brand hover:bg-brand hover:text-white dark:bg-slate-800'}`}>
            🛒 {t('cart')}{count > 0 && <span className="rounded-full bg-white px-1.5 text-xs text-brand shadow-sm">{count}</span>}
          </NavLink>
          <div className="my-2 md:my-0 md:ml-2"><Prefs /></div>
          {user ? (
            <button className="btn-ghost !py-2" onClick={() => { logout(); nav('/'); }}>{t('logout')} ({user.name.split(' ')[0]})</button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-ghost !py-2">{t('login')}</Link>
              <Link to="/register" className="btn !py-2">{t('register')}</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}