import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Err, Field, PageTitle, fmtDate } from '../components/ui';

export default function AdminAdmins() {
  const { t, user } = useApp();
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/super/admins').then(setList);
  useEffect(() => { load(); }, []);

  async function create(e) { e.preventDefault(); setErr(''); try { await api('/super/admins', { method: 'POST', body: f }); setF(null); load(); } catch (e2) { setErr(e2.message); } }
  async function toggle(a) { await api('/super/admins/' + a.id, { method: 'PATCH', body: { blocked: !a.blocked } }); load(); }
  async function del(a) { if (confirm(`${t('delete')} ${a.name}?`)) { try { await api('/super/admins/' + a.id, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); } } }
  async function reset(a) { const password = prompt('New password (min 8 characters)'); if (password) { try { await api('/super/admins/' + a.id, { method: 'PATCH', body: { password } }); alert('Password updated'); } catch (e) { alert(e.message); } } }

  return (
    <div>
      <PageTitle right={<button className="btn" onClick={() => { setErr(''); setF({ name: '', email: '', phone: '', password: '' }); }}>+ {t('add')}</button>}>{t('admins')}</PageTitle>
      <div className="card overflow-x-auto"><table className="w-full">
        <thead><tr><th className="th">{t('name')}</th><th className="th">{t('email')}</th><th className="th">Role</th><th className="th">Status</th><th className="th">Created</th><th className="th" /></tr></thead>
        <tbody>{list.map((a) => (
          <tr key={a.id} className="border-t dark:border-slate-700">
            <td className="td font-semibold">{a.name}</td><td className="td">{a.email}</td><td className="td">{a.role}</td>
            <td className="td">{a.blocked ? 'Suspended' : 'Active'}</td><td className="td text-xs">{fmtDate(a.createdAt)}</td>
            <td className="td whitespace-nowrap text-right">
              {a.id !== user.id && a.role === 'ADMIN' && <>
                <button className="mr-3 font-semibold text-brand" onClick={() => toggle(a)}>{a.blocked ? 'Reactivate' : 'Suspend'}</button>
                <button className="mr-3 font-semibold text-brand" onClick={() => reset(a)}>Reset password</button>
                <button className="text-red-600" onClick={() => del(a)}>{t('delete')}</button>
              </>}
            </td>
          </tr>))}
        </tbody></table></div>
      {f && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <form onSubmit={create} className="card w-full max-w-md space-y-3 p-6">
            <h2 className="text-lg font-bold">{t('add')} — {t('admins')}</h2>
            <Err msg={err} />
            <Field label={t('name')}><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label={t('email')}><input required type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label={t('phone')}><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label={t('password') + ' (min 8)'}><input required minLength={8} type="text" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setF(null)}>{t('cancel')}</button><button className="btn">{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
