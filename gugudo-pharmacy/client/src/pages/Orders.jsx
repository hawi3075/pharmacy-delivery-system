import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Badge, Empty, PageTitle, Timeline, fmtDate, money } from '../components/ui';

export default function Orders() {
  const { t } = useApp();
  const [orders, setOrders] = useState(null);
  const load = () => api('/orders').then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, []);
  async function cancel(id) { if (confirm(t('cancelOrder') + '?')) { await api(`/orders/${id}/cancel`, { method: 'PATCH' }); load(); } }

  return (
    <div className="pb-10">
      <div className="mb-8 rounded-3xl bg-[#207065] p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e6f6f8]">Your care journey</p><h1 className="mt-2 text-4xl">{t('orderHistory')}</h1><p className="mt-2 max-w-lg text-sm text-white/70">Stay close to every order, from our pharmacy shelves to your front door.</p></div>
      {orders && !orders.length && <Empty>{t('noItems')}</Empty>}
      <div className="space-y-4">
        {(orders || []).map((o) => (
          <div key={o.id} className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><b>{o.code}</b> <span className="ml-2 text-xs text-slate-500">{fmtDate(o.createdAt)}</span></div>
              <div className="flex items-center gap-2"><Badge v={o.paymentStatus} label={o.paymentStatus} /><b>{money(o.total)}</b></div>
            </div>
            <Timeline status={o.status} />
            <ul className="mt-1 text-sm text-slate-600 dark:text-slate-300">{o.items.map((i) => <li key={i.id}>{i.name} × {i.qty}</li>)}</ul>
            <p className="mt-2 text-xs text-slate-500">📍 {o.addressText}</p>
            <div className="mt-3 flex gap-2">
              {o.lat && <a className="btn-ghost !py-1" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${o.lat},${o.lng}`}>Map</a>}
              {o.status === 'PENDING' && <button className="btn-ghost !py-1" onClick={() => cancel(o.id)}>{t('cancelOrder')}</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
