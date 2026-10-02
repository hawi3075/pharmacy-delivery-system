import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Empty, PageTitle, fmtDate } from '../components/ui';

export default function AdminMessages() {
  const { t } = useApp();
  const [threads, setThreads] = useState([]);
  const [sel, setSel] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef();

  const loadThreads = () => api('/admin/messages').then(setThreads);
  const loadThread = (id) => api('/admin/messages/' + id).then((m) => { setMsgs(m); loadThreads(); });
  useEffect(() => { loadThreads(); const i = setInterval(loadThreads, 15000); return () => clearInterval(i); }, []);
  useEffect(() => { if (sel) { loadThread(sel); const i = setInterval(() => loadThread(sel), 10000); return () => clearInterval(i); } }, [sel]);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs.length]);

  async function send(e) { e.preventDefault(); if (!text.trim()) return; await api('/admin/messages/' + sel, { method: 'POST', body: { body: text } }); setText(''); loadThread(sel); }
  async function draft() {
    setBusy(true);
    try { const { reply } = await api('/ai/reply-draft', { method: 'POST', body: { thread: msgs.slice(-15).map((m) => ({ fromStaff: m.fromStaff, body: m.body })) } }); setText(reply); }
    catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <PageTitle>{t('messages')}</PageTitle>
      <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
        <div className="card max-h-[32rem] overflow-y-auto">
          {!threads.length && <p className="p-4 text-sm text-slate-500">{t('noItems')}</p>}
          {threads.map((th) => (
            <button key={th.customer.id} onClick={() => setSel(th.customer.id)} className={`block w-full border-b p-3 text-left text-sm last:border-0 dark:border-slate-700 ${sel === th.customer.id ? 'bg-brand-light dark:bg-slate-700' : ''}`}>
              <div className="flex justify-between"><b>{th.customer.name}</b>{th.unread > 0 && <span className="rounded-full bg-red-600 px-2 text-xs text-white">{th.unread}</span>}</div>
              <p className="truncate text-xs text-slate-500">{th.last.body}</p>
            </button>
          ))}
        </div>
        {sel ? (
          <div className="card flex h-[32rem] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {msgs.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.fromStaff ? 'ml-auto bg-brand text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {m.body}<div className="mt-1 text-[10px] opacity-70">{fmtDate(m.createdAt)}</div>
                </div>
              ))}
              <div ref={end} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t p-3 dark:border-slate-700">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('reply')} />
              <button type="button" className="btn-ghost whitespace-nowrap" onClick={draft} disabled={busy}>{busy ? '…' : 'AI draft'}</button>
              <button className="btn">{t('send')}</button>
            </form>
          </div>
        ) : <Empty>{t('messages')}</Empty>}
      </div>
    </div>
  );
}
