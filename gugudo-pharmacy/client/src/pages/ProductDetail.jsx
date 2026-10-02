import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { ProductImg } from '../components/ProductCard';
import { money } from '../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const { t, addToCart } = useApp();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  useEffect(() => { api('/products/' + id).then(setP).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <p className="p-10 text-center">{err}</p>;
  if (!p) return null;
  const rows = [[t('category'), p.category?.name], ['Generic', p.generic], ['Manufacturer', p.manufacturer]].filter((r) => r[1]);

  return (
    <div className="grid gap-10 md:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-[2rem] bg-[#e8eee7] p-5 md:p-10"><ProductImg p={p} className="h-[26rem]" /></div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6f7e]">{p.category?.name || 'Pharmacy essential'}</p><h1 className="mt-3 text-5xl leading-tight text-[#173f3b]">{p.name}</h1>
        <p className="mt-4 text-3xl font-bold text-[#0e6f7e]">{money(p.price)}</p>
        {p.requiresRx && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{t('rxRequired')}</p>}
        <p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">{p.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">{rows.map(([k, v]) => <div key={k} className="rounded-xl bg-[#f1eee5] p-3 dark:bg-slate-700"><p className="text-xs font-bold uppercase text-slate-500">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}</div>
        <p className="mt-4 text-sm">{p.stock > 0 ? `${p.stock} in stock` : t('outOfStock')}</p>
        <div className="mt-5 flex items-center gap-3">
          <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="input !w-20" aria-label="Quantity" />
          <button className="btn" disabled={p.stock === 0} onClick={() => addToCart(p, qty)}>{t('addToCart')}</button>
        </div>
      </div>
    </div>
  );
}
