import { Link } from 'react-router-dom';
import { img } from '../api';
import { useApp } from '../store';
import { money } from './ui';

export function ProductImg({ p, className = 'h-32 sm:h-36' }) {
  const src = img(p.imageUrl);
  return src
    ? <img src={src} alt={p.name} className={`${className} w-full rounded-lg object-cover`} />
    : <div className={`${className} flex w-full items-center justify-center rounded-lg bg-brand-light text-4xl dark:bg-slate-700`} aria-hidden>💊</div>;
}

export default function ProductCard({ p }) {
  const { t, addToCart } = useApp();
  const out = p.stock === 0;
  return (
    <div className="card group flex min-w-0 flex-col overflow-hidden rounded-xl p-2.5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(38,48,42,0.12)]">
      <Link to={`/product/${p.id}`}><ProductImg p={p} /></Link>
      <div className="mt-3 flex-1">
        <p className="text-xs text-slate-500">{p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-1 block min-h-10 font-bold leading-5 transition-colors group-hover:text-[#0e6f7e]">{p.name}</Link>
        {p.requiresRx && <p className="mt-1 text-xs font-bold text-rose-600">{t('rxRequired')}</p>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <b>{money(p.price)}</b>
        <button className="btn !px-3 !py-1.5" disabled={out} onClick={() => addToCart(p)}>{out ? t('outOfStock') : t('add')}</button>
      </div>
    </div>
  );
}
