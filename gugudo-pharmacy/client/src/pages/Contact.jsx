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
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand">Partner with Gugudo</p>
          <h1 className="mt-3 text-5xl leading-tight text-[#173f3b] md:text-7xl">Let’s build a stronger supply chain.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#52625b]">For wholesale orders, institutional supply, tender participation, or product questions, our Hawassa team is ready to help.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-[#173f3b]">
            <span className="rounded-full bg-white/80 px-4 py-2">Fast response</span>
            <span className="rounded-full bg-white/80 px-4 py-2">Trusted supply</span>
            <span className="rounded-full bg-white/80 px-4 py-2">Local support</span>
          </div>
        </div>
        <div className="relative mt-10 md:absolute md:right-10 md:top-10 md:mt-0 md:block md:w-[38%]">
          <img src="/image4.jpeg" alt="Gugudo Pharma team preparing medical supplies" className="h-64 w-full rounded-3xl object-cover shadow-xl md:h-72" />
          <div className="absolute -bottom-4 -left-4 rounded-2xl bg-[#173f3b] px-5 py-4 text-white shadow-lg">
            <p className="text-2xl font-black">Ready to help</p>
            <p className="mt-1 text-xs text-white/70">From Hawassa to your facility</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[['✉', 'Email us', 'gugudopharma27@gmail.com', 'For quotations and partnerships.', 'mailto:gugudopharma27@gmail.com'], ['✆', 'WhatsApp', '0916 853 543', 'Call or message our team.', 'tel:+251916853543'], ['➤', 'Telegram', '0950 477 994', 'Connect with Gugudo Pharma.', 'tel:+251950477994']].map(([icon, title, line, detail, href]) => (
          <a href={href} className="card group p-6 transition hover:-translate-y-1 hover:border-brand hover:shadow-lg" key={title}><p className="text-2xl text-brand">{icon}</p><h2 className="mt-4 text-2xl">{title} <span className="text-base text-brand opacity-0 transition group-hover:opacity-100">↗</span></h2><p className="mt-2 text-sm leading-7 text-slate-500">{line}<br />{detail}</p></a>
        ))}
      </div>

      <section className="mt-10 grid items-center gap-8 rounded-[2rem] bg-[#f1eee5] p-7 md:grid-cols-[.8fr_1.2fr] md:p-10">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">What can we help with?</p>
          <h2 className="mt-2 text-4xl text-[#173f3b]">One conversation can move your care forward.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[['01', 'Wholesale orders'], ['02', 'Tender support'], ['03', 'Scheduled supply']].map(([number, title]) => (
            <div className="rounded-2xl bg-white p-5 shadow-sm" key={number}><span className="text-sm font-black text-brand">{number}</span><h3 className="mt-5 text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Practical support for your next order.</p></div>
          ))}
        </div>
      </section>

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
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b9f0dc]">Institutional supply</p>
          <h2 className="mt-3 text-3xl">A practical partner for procurement teams.</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">We support bulk orders, tender participation, scheduled replenishment, and dependable delivery for healthcare providers.</p>
          <div className="mt-8 grid gap-4 text-sm">
            <div className="rounded-2xl bg-white/10 p-4"><b>Wholesale quotations</b><p className="mt-1 text-white/60">Tell us what your facility needs and we’ll help shape the right order.</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><b>Quality & compliance</b><p className="mt-1 text-white/60">Ask about sourcing, storage, cold-chain handling, and product documentation.</p></div>
            <Link to="/support" className="font-bold text-[#b9f0dc] hover:text-white">Open your support inbox →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
