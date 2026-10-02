import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Badge, PageTitle, fmtDate, money } from '../components/ui';

const Stat = ({ label, value, warn }) => (
  <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-extrabold ${warn ? 'text-red-600' : ''}`}>{value}</p></div>
);

export default function Dashboard() {
  const { t } = useApp();
  const [s, setS] = useState(null);
  useEffect(() => { api('/admin/stats').then(setS); }, []);
  if (!s) return null;
  const days = Object.entries(s.byDay).sort();
  const max = Math.max(1, ...days.map((d) => d[1]));

  return (
    <div>
      <PageTitle>{t('dashboard')}</PageTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total orders" value={s.orders} />
        <Stat label="Pending orders" value={s.pending} warn={s.pending > 0} />
        <Stat label="Revenue collected" value={money(s.revenue)} />
        <Stat label={t('customers')} value={s.customers} />
        <Stat label="Low stock items" value={s.lowStock} warn={s.lowStock > 0} />
        <Stat label="Out of stock" value={s.outOfStock} warn={s.outOfStock > 0} />
      </div>
      <div className="card mt-6 p-4">
        <h2 className="mb-3 font-bold">Sales, last 7 days</h2>
        {days.length === 0 ? <p className="text-sm text-slate-500">{t('noItems')}</p> : (
          <div className="flex h-40 items-end gap-3">
            {days.map(([d, v]) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{Math.round(v)}</span>
                <div className="w-full rounded-t bg-brand" style={{ height: `${(v / max) * 100}%` }} />
                <span className="text-[10px] text-slate-500">{d.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card mt-6 overflow-x-auto">
        <h2 className="p-4 font-bold">Recent orders</h2>
        <table className="w-full"><tbody>
          {s.recent.map((o) => (
            <tr key={o.id} className="border-t dark:border-slate-700"><td className="td font-semibold">{o.code}</td><td className="td">{o.customer.name}</td><td className="td">{money(o.total)}</td><td className="td"><Badge v={o.status} /></td><td className="td text-xs text-slate-500">{fmtDate(o.createdAt)}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
