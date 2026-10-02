import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { PageTitle, fmtDate } from '../components/ui';

export default function AdminAudit() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  useEffect(() => { api('/super/audit').then(setList); }, []);
  return (
    <div>
      <PageTitle>{t('audit')}</PageTitle>
      <div className="card overflow-x-auto"><table className="w-full">
        <thead><tr><th className="th">When</th><th className="th">Who</th><th className="th">Action</th><th className="th">Detail</th></tr></thead>
        <tbody>{list.map((l) => <tr key={l.id} className="border-t dark:border-slate-700"><td className="td text-xs">{fmtDate(l.createdAt)}</td><td className="td">{l.actor.name}</td><td className="td font-semibold">{l.action}</td><td className="td text-xs">{l.detail}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
