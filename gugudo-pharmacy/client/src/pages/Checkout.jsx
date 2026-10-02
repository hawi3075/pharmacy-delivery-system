import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import MapPicker from '../components/MapPicker';
import { Err, Field, PageTitle, money } from '../components/ui';
import { totals } from './Cart';

export default function Checkout() {
  const { t, cart, clearCart, user } = useApp();
  const nav = useNavigate();
  const [saved, setSaved] = useState([]);
  const [f, setF] = useState({ text: '', phone: user?.phone || '', lat: undefined, lng: undefined, notes: '', save: false });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const needsRx = cart.some((i) => i.requiresRx);
  const { subtotal, fee, total } = totals(cart);

  useEffect(() => { api('/me/addresses').then(setSaved).catch(() => {}); }, []);
  useEffect(() => { if (!cart.length) nav('/cart'); }, [cart, nav]);

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (needsRx && !file) return setErr(t('rxRequired') + ': ' + t('uploadRx'));
    setBusy(true);
    try {
      const form = new FormData();
      form.append('items', JSON.stringify(cart.map((i) => ({ id: i.id, qty: i.qty }))));
      form.append('addressText', f.text); form.append('phone', f.phone); form.append('notes', f.notes);
      if (f.lat) { form.append('lat', f.lat); form.append('lng', f.lng); }
      form.append('paymentMethod', 'COD');
      if (file) form.append('prescription', file);
      await api('/orders', { method: 'POST', form });
      if (f.save) await api('/me/addresses', { method: 'POST', body: { label: 'Home', text: f.text, phone: f.phone, lat: f.lat, lng: f.lng } }).catch(() => {});
      clearCart(); alert(t('orderPlaced')); nav('/orders');
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  const useSaved = (id) => { const a = saved.find((s) => s.id === Number(id)); if (a) setF({ ...f, text: a.text, phone: a.phone, lat: a.lat ?? undefined, lng: a.lng ?? undefined }); };

  return (
    <form onSubmit={submit}>
      <PageTitle>{t('checkout')}</PageTitle>
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <section className="card space-y-4 p-4">
            <h2 className="font-bold">{t('address')}</h2>
            {saved.length > 0 && (
              <select className="input" defaultValue="" onChange={(e) => useSaved(e.target.value)} aria-label={t('useSaved')}>
                <option value="" disabled>{t('useSaved')}</option>
                {saved.map((s) => <option key={s.id} value={s.id}>{s.label}: {s.text.slice(0, 50)}</option>)}
              </select>
            )}
            <p className="text-xs text-slate-500">{t('pinOnMap')}</p>
            <MapPicker value={f} onChange={(m) => setF((p) => ({ ...p, lat: m.lat, lng: m.lng, text: m.address || p.text }))} />
            <Field label={t('address')}><textarea required className="input" rows={2} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
            <Field label={t('phone')}><input required className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label={t('notes')}><input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.save} onChange={(e) => setF({ ...f, save: e.target.checked })} /> {t('saveAddress')}</label>
          </section>
          {needsRx && (
            <section className="card space-y-2 p-4">
              <h2 className="font-bold">{t('prescription')}</h2>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="text-sm" aria-label={t('uploadRx')} />
              <p className="text-xs text-slate-500">{t('uploadRx')}</p>
            </section>
          )}
          <section className="card p-4">
            <h2 className="font-bold">{t('payment')}</h2>
            <label className="mt-2 flex items-center gap-2 rounded-lg border border-brand bg-brand-light p-3 text-sm font-semibold dark:bg-slate-700"><input type="radio" checked readOnly /> {t('cod')}</label>
          </section>
        </div>
        <aside className="card h-fit space-y-2 p-4 text-sm">
          {cart.map((i) => <div key={i.id} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
          <div className="flex justify-between border-t pt-2 dark:border-slate-700"><span>{t('subtotal')}</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>{t('delivery')}</span><span>{fee ? money(fee) : t('free')}</span></div>
          <div className="flex justify-between text-base font-bold"><span>{t('total')}</span><span>{money(total)}</span></div>
          <Err msg={err} />
          <button className="btn w-full" disabled={busy}>{t('placeOrder')}</button>
        </aside>
      </div>
    </form>
  );
}
