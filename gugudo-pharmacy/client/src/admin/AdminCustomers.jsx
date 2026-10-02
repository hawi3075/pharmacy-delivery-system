import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { PageTitle, fmtDate } from '../components/ui';

export default function AdminCustomers() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  const load = () => api('/admin/customers').then(setList);
  useEffect(() => { load(); }, []);
  const toggle = async (c) => { await api(`/admin/customers/${c.id}/block`, { method: 'PATCH', body: { blocked: !c.blocked } }); load(); };

  return (
    <div>
      <PageTitle>{t('customers')}</PageTitle>
      <div className="card overflow-x-auto"><table className="w-full">
        <thead><tr><th className="th">{t('name')}</th><th className="th">{t('email')}</th><th className="th">{t('phone')}</th><th className="th">{t('orders')}</th><th className="th">Joined</th><th className="th" /></tr></thead>
        <tbody>{list.map((c) => (
          <tr key={c.id} className="border-t dark:border-slate-700">
            <td className="td font-semibold">{c.name}</td><td className="td">{c.email}</td><td className="td">{c.phone}</td><td className="td">{c._count.orders}</td>
            <td className="td text-xs">{fmtDate(c.createdAt)}</td>
            <td className="td text-right"><button className={c.blocked ? 'font-semibold text-brand' : 'text-red-600'} onClick={() => toggle(c)}>{c.blocked ? 'Reactivate' : 'Suspend'}</button></td>
          </tr>))}
        </tbody></table></div>
    </div>
  );
}
