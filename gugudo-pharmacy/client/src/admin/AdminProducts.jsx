import { useEffect, useState } from 'react';
import { api, img } from '../api';
import { useApp } from '../store';
import { Err, Field, PageTitle, money } from '../components/ui';

const blank = { name: '', generic: '', description: '', price: '', stock: 0, lowStockAt: 10, requiresRx: false, categoryId: '', batchNo: '', expiry: '', manufacturer: '', active: true };

export default function AdminProducts() {
  const { t } = useApp();
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null); // null = closed
  const [file, setFile] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => { api('/admin/products').then(setList); api('/categories').then(setCats); };
  useEffect(load, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const open = (p) => { setErr(''); setFile(null); setForm(p ? { ...p, categoryId: p.categoryId ?? '', expiry: p.expiry ? p.expiry.slice(0, 10) : '' } : { ...blank }); };

  async function save(e) {
    e.preventDefault(); setErr('');
    const fd = new FormData();
    for (const k of Object.keys(blank)) fd.append(k, form[k] ?? '');
    if (file) fd.append('image', file);
    try {
      await api(form.id ? '/admin/products/' + form.id : '/admin/products', { method: form.id ? 'PUT' : 'POST', form: fd });
      setForm(null); load();
    } catch (e2) { setErr(e2.message); }
  }
  async function remove(p) {
    if (!confirm(`${t('delete')} ${p.name}?`)) return;
    const r = await api('/admin/products/' + p.id, { method: 'DELETE' });
    if (r.hidden) alert('This product has past orders, so it was hidden from the store instead of deleted.');
    load();
  }
  async function aiFill() {
    setBusy(true); setErr('');
    try {
      const d = await api('/ai/product-draft', { method: 'POST', body: { prompt: aiPrompt } });
      const cat = cats.find((c) => c.name.toLowerCase() === (d.category || '').toLowerCase());
      setForm((f) => ({ ...f, name: d.name || f.name, generic: d.generic || f.generic, description: d.description || f.description, manufacturer: d.manufacturer || f.manufacturer, requiresRx: !!d.requiresRx, categoryId: cat?.id ?? f.categoryId }));
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <PageTitle right={<button className="btn" onClick={() => open(null)}>+ {t('add')}</button>}>{t('products')}</PageTitle>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">{t('products')}</th><th className="th">{t('category')}</th><th className="th">{t('price')}</th><th className="th">{t('stock')}</th><th className="th" /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={`border-t dark:border-slate-700 ${p.active ? '' : 'opacity-50'}`}>
                <td className="td"><div className="flex items-center gap-3">
                  {p.imageUrl ? <img src={img(p.imageUrl)} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded bg-brand-light">💊</span>}
                  <div><b>{p.name}</b>{p.requiresRx && <span className="ml-2 text-xs font-semibold text-rose-600">Rx</span>}{!p.active && <span className="ml-2 text-xs">(hidden)</span>}</div>
                </div></td>
                <td className="td">{p.category?.name}</td>
                <td className="td">{money(p.price)}</td>
                <td className={`td font-semibold ${p.stock <= p.lowStockAt ? 'text-red-600' : ''}`}>{p.stock}</td>
                <td className="td whitespace-nowrap text-right"><button className="mr-3 font-semibold text-brand" onClick={() => open(p)}>{t('edit')}</button><button className="text-red-600" onClick={() => remove(p)}>{t('delete')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} className="card my-6 w-full max-w-2xl space-y-4 p-6">
            <h2 className="text-lg font-bold">{form.id ? t('edit') : t('add')} — {t('products')}</h2>
            <div className="flex gap-2 rounded-lg bg-brand-light p-3 dark:bg-slate-700">
              <input className="input" placeholder="AI: describe the product, e.g. 'ibuprofen 400mg tablets'" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
              <button type="button" className="btn whitespace-nowrap" disabled={busy || aiPrompt.length < 2} onClick={aiFill}>{busy ? '…' : 'AI fill'}</button>
            </div>
            <Err msg={err} />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name *"><input required className="input" value={form.name} onChange={set('name')} /></Field>
              <Field label="Generic name"><input className="input" value={form.generic || ''} onChange={set('generic')} /></Field>
              <Field label={`${t('price')} (ETB) *`}><input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={set('price')} /></Field>
              <Field label={t('category')}>
                <select className="input" value={form.categoryId} onChange={set('categoryId')}><option value="">—</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </Field>
              <Field label={t('stock')}><input type="number" min="0" className="input" value={form.stock} onChange={set('stock')} /></Field>
              <Field label="Low-stock alert at"><input type="number" min="0" className="input" value={form.lowStockAt} onChange={set('lowStockAt')} /></Field>
              <Field label="Batch number"><input className="input" value={form.batchNo || ''} onChange={set('batchNo')} /></Field>
              <Field label="Expiry date"><input type="date" className="input" value={form.expiry} onChange={set('expiry')} /></Field>
              <Field label="Manufacturer"><input className="input" value={form.manufacturer || ''} onChange={set('manufacturer')} /></Field>
              <Field label="Image"><input type="file" accept="image/*" className="text-sm" onChange={(e) => setFile(e.target.files[0])} /></Field>
            </div>
            <Field label="Description"><textarea rows={3} className="input" value={form.description || ''} onChange={set('description')} /></Field>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.requiresRx} onChange={set('requiresRx')} /> {t('rxRequired')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.active} onChange={set('active')} /> Visible in store</label>
            </div>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>{t('cancel')}</button><button className="btn">{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
