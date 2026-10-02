import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { Err, Field } from '../components/ui';

export default function Auth({ mode }) {
  const isReg = mode === 'register';
  const { t, login } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const data = await api(isReg ? '/auth/register' : '/auth/login', { method: 'POST', body: isReg ? f : { email: f.email, password: f.password } });
      login(data);
      nav(sp.get('next') || (data.user.role === 'CUSTOMER' ? '/' : '/admin'), { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-[#207065] shadow-2xl md:grid-cols-[.9fr_1.1fr]">
      <div className="hidden flex-col justify-between p-10 text-white md:flex"><div><span className="text-4xl">✚</span><p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-[#e6f6f8]">Gugudo Pharmacy</p><h2 className="mt-4 text-5xl leading-tight">Care that comes closer.</h2><p className="mt-5 max-w-xs leading-7 text-white/70">Your trusted neighborhood pharmacy, now just a few taps away.</p></div><p className="text-sm text-white/60">Safe, simple, and always human.</p></div>
    <form onSubmit={submit} className="space-y-4 bg-white p-7 md:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6f7e]">Welcome back</p><h1 className="text-4xl text-[#173f3b]">{isReg ? t('register') : t('login')}</h1>
      <Err msg={err} />
      {isReg && <Field label={t('name')}><input className="input" required value={f.name} onChange={set('name')} /></Field>}
      <Field label={t('email')}><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
      {isReg && <Field label={t('phone')}><input className="input" value={f.phone} onChange={set('phone')} /></Field>}
      <Field label={t('password')}><div className="relative"><input className="input pr-12" type={showPassword ? 'text' : 'password'} required minLength={6} value={f.password} onChange={set('password')} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-brand" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9.5 5 9.5 5s-1.3 2.1-3.5 3.7M6.2 6.2C3.9 7.7 2.5 9 2.5 9s4 5 9.5 5c.7 0 1.3-.1 1.9-.2" /></svg> : <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 9S6.5 4 12 4s9.5 5 9.5 5-4 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="9" r="2.5" /></svg>}</button></div></Field>
      <button className="btn w-full" disabled={busy}>{isReg ? t('register') : t('login')}</button>
      <p className="text-center text-sm text-slate-500">
        {isReg ? <Link className="font-semibold text-brand" to="/login">{t('login')}</Link> : <Link className="font-semibold text-brand" to="/register">{t('register')}</Link>}
      </p>
    </form></div>
  );
}
