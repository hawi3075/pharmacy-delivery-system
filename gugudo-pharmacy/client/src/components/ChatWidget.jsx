import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';

export default function ChatWidget() {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: 'user', content: text.trim() }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const { reply } = await api('/ai/chat', { method: 'POST', body: { messages: next, lang } });
      setMsgs([...next, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMsgs([...next, { role: 'assistant', content: err.message }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      {open && (
        <div className="card fixed bottom-20 right-4 z-40 flex h-[26rem] w-[calc(100vw-2rem)] max-w-sm flex-col shadow-xl">
          <div className="flex items-center justify-between rounded-t-xl bg-[#207065] px-4 py-3 text-white">
            <b className="text-sm">{t('chat')}</b>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-lg leading-none">×</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {msgs.length === 0 && <p className="text-slate-500">{t('chatHint')}</p>}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === 'user' ? 'ml-auto bg-brand text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{m.content}</div>
            ))}
            {busy && <div className="w-12 rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-700">…</div>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-2 dark:border-slate-700">
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('chatHint')} />
            <button className="btn" disabled={busy}>{t('send')}</button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0e6f7e] text-xl text-white shadow-lg hover:bg-[#0a4f5b]" aria-label={t('chat')}>💬</button>
    </>
  );
}
