import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { PageTitle, fmtDate } from '../components/ui';

export default function AdminCustomers() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openActions, setOpenActions] = useState(null);
  const load = () => api('/admin/customers').then(setList);
  useEffect(() => { load(); }, []);
  const toggle = async (c) => { await api(`/admin/customers/${c.id}/block`, { method: 'PATCH', body: { blocked: !c.blocked } }); load(); };
  const edit = async (e) => { e.preventDefault(); await api(`/admin/customers/${editing.id}`, { method: 'PATCH', body: { name: editing.name, phone: editing.phone || undefined } }); setEditing(null); load(); };
  const remove = async (c) => { if (!confirm(`Delete ${c.name}?`)) return; try { await api(`/admin/customers/${c.id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); } };

  return (
    <>
      <div>
        <PageTitle>{t('customers')}</PageTitle>
        <div className="card overflow-x-auto"><table className="w-full">
          <thead><tr><th className="th">{t('name')}</th><th className="th">{t('email')}</th><th className="th">{t('phone')}</th><th className="th">{t('orders')}</th><th className="th">Joined</th><th className="th" /></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id} className="border-t dark:border-slate-700">
              <td className="td font-semibold">{c.name}</td><td className="td">{c.email}</td><td className="td">{c.phone}</td><td className="td">{c._count.orders}</td>
              <td className="td text-xs">{fmtDate(c.createdAt)}</td>
              <td className="td relative text-right">
                <button
                  type="button"
                  aria-label={`Actions for ${c.name}`}
                  aria-expanded={openActions === c.id}
                  className="btn-ghost !px-3 !py-2"
                  onClick={() => setOpenActions(openActions === c.id ? null : c.id)}
                >
                  <svg className={`h-4 w-4 transition-transform ${openActions === c.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {openActions === c.id && (
                  <div className="absolute right-3 top-12 z-20 grid min-w-36 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl dark:border-slate-600 dark:bg-slate-800">
                    <button type="button" className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => { setEditing({ ...c }); setOpenActions(null); }}>{t('edit')}</button>
                    <button type="button" className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/30" onClick={() => { toggle(c); setOpenActions(null); }}>{c.blocked ? 'Reactivate' : 'Suspend'}</button>
                    <button type="button" className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30" onClick={() => { remove(c); setOpenActions(null); }}>Delete</button>
                  </div>
                )}
              </td>
            </tr>))}
          </tbody></table></div>
      </div>
      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={edit} className="card w-full max-w-md space-y-4 p-6"><h2 className="text-xl font-bold">Edit customer</h2><label className="label">Name<input className="input mt-1.5" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></label><label className="label">Phone<input className="input mt-1.5" value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></label><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}
    </>
  );
}
