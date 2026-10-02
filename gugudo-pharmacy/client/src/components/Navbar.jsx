import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../store';
import { LANGS } from '../i18n';

export function Prefs() {
  const { lang, changeLang, theme, changeTheme } = useApp();
  return (
    <div className="flex items-center gap-2">
      <select aria-label="Language" value={lang} onChange={(e) => changeLang(e.target.value)} className="input !w-auto !py-1.5">
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <button className="btn-ghost !px-2.5 !py-1.5" aria-label="Toggle theme" onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
    </div>
  );
}

export default function Navbar() {
  const { t, user, logout, cart } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const link = ({ isActive }) => `px-2 py-1 text-sm font-semibold ${isActive ? 'text-brand' : 'text-slate-600 hover:text-brand dark:text-slate-300'}`;
  const staff = user && user.role !== 'CUSTOMER';

  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e4dc] bg-[#f8f6f0]/95 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#207065]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6f7e] text-lg text-white">✚</span>Gugudo</Link>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-2 border-b bg-white p-4 dark:bg-slate-900 md:static md:flex md:flex-row md:items-center md:border-0 md:p-0 md:dark:bg-transparent md:bg-transparent`} onClick={() => setOpen(false)}>
          <NavLink to="/" end className={link}>{t('home')}</NavLink>
          <NavLink to="/catalog" className={link}>{t('catalog')}</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
          <NavLink to="/contact" className={link}>Contact</NavLink>
          {user?.role === 'CUSTOMER' && <>
            <NavLink to="/orders" className={link}>{t('orders')}</NavLink>
            <NavLink to="/addresses" className={link}>{t('addresses')}</NavLink>
            <NavLink to="/support" className={link}>{t('support')}</NavLink>
          </>}
          {staff && <NavLink to="/admin" className={link}>{t('dashboard')}</NavLink>}
          <NavLink to="/cart" className={link}>🛒 {t('cart')}{count > 0 && <span className="ml-1 rounded-full bg-brand px-1.5 text-xs text-white">{count}</span>}</NavLink>
          <Prefs />
          {user ? (
            <button className="btn-ghost !py-1.5" onClick={() => { logout(); nav('/'); }}>{t('logout')} ({user.name.split(' ')[0]})</button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !py-1.5">{t('login')}</Link>
              <Link to="/register" className="btn !py-1.5">{t('register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
