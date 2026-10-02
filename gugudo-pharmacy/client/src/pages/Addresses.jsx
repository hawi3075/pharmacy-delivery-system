import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import MapPicker from '../components/MapPicker';
import { Empty, Err, Field, PageTitle } from '../components/ui';

export default function Addresses() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  const [f, setF] = useState({ label: 'Home', text: '', phone: '', lat: undefined, lng: undefined });
  const [err, setErr] = useState('');
  const load = () => api('/me/addresses').then(setList);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault(); setErr('');
    try { await api('/me/addresses', { method: 'POST', body: f }); setF({ ...f, text: '' }); load(); } catch (e2) { setErr(e2.message); }
  }
  async function del(id) { await api('/me/addresses/' + id, { method: 'DELETE' }); load(); }

  return (
    <div>
      <PageTitle>{t('savedAddresses')}</PageTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {!list.length && <Empty>{t('noItems')}</Empty>}
          {list.map((a) => (
            <div key={a.id} className="card flex items-start justify-between gap-3 p-4">
              <div><b>{a.label}</b><p className="text-sm">{a.text}</p><p className="text-xs text-slate-500">{a.phone}</p></div>
              <button className="text-sm text-red-600" onClick={() => del(a.id)}>{t('delete')}</button>
            </div>
          ))}
        </div>
        <form onSubmit={add} className="card space-y-3 p-4">
          <Err msg={err} />
          <MapPicker value={f} onChange={(m) => setF((p) => ({ ...p, lat: m.lat, lng: m.lng, text: m.address || p.text }))} height={220} />
          <Field label="Label"><input className="input" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
          <Field label={t('address')}><textarea required className="input" rows={2} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
          <Field label={t('phone')}><input required className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <button className="btn">{t('save')}</button>
        </form>
      </div>
    </div>
  );
}
