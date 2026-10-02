import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { PageTitle, fmtDate } from '../components/ui';

export default function Support() {
  const { t } = useApp();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const end = useRef();
  const load = () => api('/me/messages').then(setMsgs);
  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs.length]);

  async function send(e) { e.preventDefault(); if (!text.trim()) return; await api('/me/messages', { method: 'POST', body: { body: text } }); setText(''); load(); }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-3xl bg-[#207065] p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e6f6f8]">We are here for you</p><h1 className="mt-2 text-4xl">{t('support')}</h1><p className="mt-2 text-sm text-white/70">{t('supportIntro')}</p></div>
      <div className="card h-[30rem] space-y-2 overflow-y-auto p-5">
        {msgs.map((m) => (
          <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.fromStaff ? 'bg-slate-100 dark:bg-slate-700' : 'ml-auto bg-brand text-white'}`}>
            {m.body}<div className="mt-1 text-[10px] opacity-70">{fmtDate(m.createdAt)}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('writeMessage')} />
        <button className="btn">{t('send')}</button>
      </form>
    </div>
  );
}
