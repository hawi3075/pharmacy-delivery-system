import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Badge, PageTitle, fmtDate, money } from '../components/ui';

export default function AdminFinance() {
  const { t } = useApp();
  const [d, setD] = useState(null);
  useEffect(() => { api('/admin/finance').then(setD); }, []);
  if (!d) return null;
  const Card = ({ l, v, n }) => <div className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-2xl font-extrabold">{money(v)}</p>{n !== undefined && <p className="text-xs text-slate-500">{n} orders</p>}</div>;
  return (
    <div>
      <PageTitle>{t('finance')}</PageTitle>
      <div className="grid gap-4 md:grid-cols-3">
        <Card l="Collected" v={d.collected} n={d.collectedCount} />
        <Card l="Still to collect (COD)" v={d.outstanding} n={d.outstandingCount} />
        <Card l="Refunded" v={d.refunded} />
      </div>
      <div className="card mt-6 overflow-x-auto"><table className="w-full">
        <thead><tr><th className="th">Order</th><th className="th">{t('customers')}</th><th className="th">Method</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Updated</th></tr></thead>
        <tbody>{d.payments.map((p) => (
          <tr key={p.id} className="border-t dark:border-slate-700"><td className="td font-semibold">{p.code}</td><td className="td">{p.customer.name}</td><td className="td">{p.paymentMethod}</td><td className="td">{money(p.total)}</td><td className="td"><Badge v={p.paymentStatus} label={p.paymentStatus} /></td><td className="td text-xs">{fmtDate(p.updatedAt)}</td></tr>))}
        </tbody></table></div>
    </div>
  );
}
