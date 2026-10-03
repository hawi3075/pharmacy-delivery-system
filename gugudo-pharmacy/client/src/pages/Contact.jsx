import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';

export default function Contact() {
  const { user } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const [state, setState] = useState({ sending: false, sent: false, error: '' });
  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  async function send(e) {
    e.preventDefault();
    if (!user) return;
    setState({ sending: true, sent: false, error: '' });
    try {
      await api('/me/messages', { method: 'POST', body: { body: `Subject: ${form.subject}\n\n${form.message}` } });
      setForm((current) => ({ ...current, subject: '', message: '' }));
      setState({ sending: false, sent: true, error: '' });
    } catch (error) {
      setState({ sending: false, sent: false, error: error.message || 'We could not send your message. Please try again.' });
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 md:px-14 md:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand">Let’s talk</p>
          <h1 className="mt-3 text-5xl leading-tight text-[#173f3b] md:text-7xl">Your question has a home.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#52625b]">Need help choosing a medicine, checking an order, or understanding delivery? Send our team a message and we’ll get back to you with care.</p>
        </div>
        <div className="contact-art absolute -right-4 -top-10 hidden h-72 w-80 md:block" aria-hidden>
          <span className="contact-art__circle" />
          <span className="contact-art__cross">+</span>
          <span className="contact-art__pill" />
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[['◷', 'Open hours', 'Monday – Saturday', '8:00 AM – 8:00 PM'], ['✆', 'Call us', '+251 911 234 567', 'We’re happy to help.'], ['✉', 'Fastest reply', 'Send us a message', 'Our team will respond in support.']].map(([icon, title, line, detail]) => (
          <div className="card p-6" key={title}><p className="text-2xl text-brand">{icon}</p><h2 className="mt-4 text-2xl">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{line}<br />{detail}</p></div>
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="card p-6 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">Message the pharmacy</p>
          <h2 className="mt-2 text-3xl">How can we help?</h2>
          {!user ? (
            <div className="mt-6 rounded-2xl bg-[#f1eee5] p-5 text-sm leading-7 text-slate-600">
              Please sign in to send a message directly to our pharmacy team and keep the conversation connected to your account.
              <Link to="/login" className="mt-4 inline-flex btn">Sign in to message us</Link>
            </div>
          ) : (
            <form onSubmit={send} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label">Your name<input className="input mt-1.5" value={form.name} onChange={update('name')} required /></label>
                <label className="label">Email address<input type="email" className="input mt-1.5" value={form.email} onChange={update('email')} required /></label>
              </div>
              <label className="label">Subject<input className="input mt-1.5" placeholder="Order help, product question..." value={form.subject} onChange={update('subject')} required /></label>
              <label className="label">Message<textarea className="input mt-1.5 min-h-36 resize-y" placeholder="Tell us how we can help..." value={form.message} onChange={update('message')} maxLength={1700} required /></label>
              {state.error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{state.error}</p>}
              {state.sent && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Message sent. Our pharmacy team will reply through your support inbox.</p>}
              <button className="btn w-fit" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send message →'}</button>
            </form>
          )}
        </div>
        <div className="rounded-[1.5rem] bg-[#173f3b] p-7 text-white md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b9f0dc]">Here for your care</p>
          <h2 className="mt-3 text-3xl">A calmer way to get support.</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">Your message goes to the same pharmacy support team that helps with orders, products, and delivery updates.</p>
          <div className="mt-8 grid gap-4 text-sm">
            <div className="rounded-2xl bg-white/10 p-4"><b>Product guidance</b><p className="mt-1 text-white/60">Ask about everyday essentials and pharmacist-approved care.</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><b>Order support</b><p className="mt-1 text-white/60">We can help you follow an order from checkout to doorstep.</p></div>
            <Link to="/support" className="font-bold text-[#b9f0dc] hover:text-white">Open your support inbox →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
