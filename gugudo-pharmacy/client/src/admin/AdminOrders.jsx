import { useEffect, useState } from 'react';
import { api, img } from '../api';
import { useApp } from '../store';
import { Badge, Empty, PageTitle, STEPS, fmtDate, money } from '../components/ui';

export default function AdminOrders() {
  const { t } = useApp();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const load = () => api('/admin/orders' + (filter ? '?status=' + filter : '')).then(setOrders);
  useEffect(() => { load(); }, [filter]);
  const update = async (id, body) => { await api('/admin/orders/' + id, { method: 'PATCH', body }); load(); };

  return (
    <div>
      <PageTitle right={
        <select className="input !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter">
          <option value="">{t('all')}</option>
          {[...STEPS, 'CANCELLED'].map((s) => <option key={s} value={s}>{t('status_' + s)}</option>)}
        </select>}>{t('orders')}</PageTitle>
      {!orders.length && <Empty>{t('noItems')}</Empty>}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><b>{o.code}</b> <span className="ml-2 text-sm">{o.customer.name}</span> <span className="ml-2 text-xs text-slate-500">{fmtDate(o.createdAt)}</span></div>
              <div className="flex items-center gap-2"><Badge v={o.paymentStatus} label={o.paymentStatus} /><b>{money(o.total)}</b></div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className="input !w-auto !py-1.5" value={o.status} onChange={(e) => update(o.id, { status: e.target.value })} aria-label="Status">
                {[...STEPS, 'CANCELLED'].map((s) => <option key={s} value={s}>{t('status_' + s)}</option>)}
              </select>
              <select className="input !w-auto !py-1.5" value={o.paymentStatus} onChange={(e) => update(o.id, { paymentStatus: e.target.value })} aria-label="Payment">
                {['UNPAID', 'PAID', 'REFUNDED'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="btn-ghost !py-1.5" onClick={() => setOpen(open === o.id ? null : o.id)}>{t('view')}</button>
            </div>
            {open === o.id && (
              <div className="mt-3 space-y-1 border-t pt-3 text-sm dark:border-slate-700">
                {o.items.map((i) => <p key={i.id}>{i.name} × {i.qty} — {money(i.price * i.qty)}</p>)}
                <p>📍 {o.addressText} · {o.phone}</p>
                {o.notes && <p>📝 {o.notes}</p>}
                <p className="flex gap-3">
                  {o.lat && <a className="font-semibold text-brand" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${o.lat},${o.lng}`}>Open in Google Maps</a>}
                  {o.prescriptionUrl && <a className="font-semibold text-brand" target="_blank" rel="noreferrer" href={img(o.prescriptionUrl)}>View prescription</a>}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
