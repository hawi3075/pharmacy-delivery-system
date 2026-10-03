import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { PageTitle, fmtDate } from '../components/ui';

export default function AdminCustomers() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
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
              <td className="td text-right"><button className="mr-3 font-semibold text-brand" onClick={() => setEditing({ ...c })}>{t('edit')}</button><button className={c.blocked ? 'mr-3 font-semibold text-brand' : 'mr-3 text-red-600'} onClick={() => toggle(c)}>{c.blocked ? 'Reactivate' : 'Suspend'}</button><button className="text-red-600" onClick={() => remove(c)}>Delete</button></td>
            </tr>))}
          </tbody></table></div>
      </div>
      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={edit} className="card w-full max-w-md space-y-4 p-6"><h2 className="text-xl font-bold">Edit customer</h2><label className="label">Name<input className="input mt-1.5" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></label><label className="label">Phone<input className="input mt-1.5" value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></label><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}
    </>
  );
}
