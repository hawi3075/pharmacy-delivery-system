import { Link } from 'react-router-dom';
import { img } from '../api';
import { useApp } from '../store';
import { money } from './ui';
import { WishButton } from '../pages/Wishlist';

// PLACEHOLDER rating (4.3 to 4.9, stable per product) until real reviews exist.
// When the API returns p.rating, this uses it automatically.
export const getRating = (p) => Number(p.rating ?? Math.round((4.3 + ((Number(p.id) * 37) % 7) / 10) * 10) / 10);

export function Stars({ value, size = 'text-sm' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${size}`} role="img" aria-label={`Rated ${value} out of 5`}>
      <span className="relative inline-block leading-none tracking-tight text-slate-300" aria-hidden>
        ★★★★★
        <span className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
      </span>
      <b className="text-xs text-slate-600 dark:text-slate-300">{value.toFixed(1)}</b>
    </span>
  );
}

export function ProductImg({ p, className = 'h-40' }) {
  const src = img(p.imageUrl);
  return src
    ? <img src={src} alt={p.name} loading="lazy" className={`${className} w-full rounded-lg object-cover`} />
    : <div className={`${className} flex w-full items-center justify-center rounded-lg bg-brand-light text-4xl dark:bg-slate-700`} aria-hidden>💊</div>;
}

export default function ProductCard({ p, view = 'grid' }) {
  const { t, addToCart } = useApp();
  const out = p.stock === 0;
  const low = !out && p.stock <= (p.lowStockAt ?? 10);
  const list = view === 'list';

  return (
    <article className={`card group min-w-0 overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(14,111,126,0.16)] ${list ? 'flex items-stretch gap-4' : 'flex h-full flex-col'}`}>
      <div className={`relative ${list ? 'w-32 shrink-0 sm:w-44' : ''}`}>
        <Link to={`/product/${p.id}`} className="relative block overflow-hidden rounded-xl">
          <div className="transition duration-500 group-hover:scale-105"><ProductImg p={p} className={list ? 'h-32 sm:h-36' : 'h-44'} /></div>
          {p.requiresRx && <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">Rx</span>}
          {out && <span className="absolute inset-0 grid place-items-center bg-white/75 text-sm font-bold text-slate-800">{t('outOfStock')}</span>}
        </Link>
        <WishButton id={p.id} name={p.name} />
      </div>

      <div className={`min-w-0 flex-1 ${list ? 'flex flex-col justify-center' : 'mt-3'}`}>
        <p className="text-xs font-semibold text-brand">{p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-0.5 block font-bold leading-snug transition-colors group-hover:text-brand">{p.name}</Link>
        <div className="mt-1.5"><Stars value={getRating(p)} /></div>
        {list && p.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>}
        {low && <p className="mt-1.5 text-xs font-bold text-amber-600">Only {p.stock} left</p>}
      </div>

      <div className={list ? 'flex shrink-0 flex-col items-end justify-center gap-3' : 'mt-3 flex items-center justify-between gap-2'}>
        <b className="text-lg">{money(p.price)}</b>
        <div className="flex gap-2">
          {list && <Link to={`/product/${p.id}`} className="btn-ghost !px-4 !py-2">Details</Link>}
          <button className="btn !px-4 !py-2" disabled={out} onClick={() => addToCart(p)} aria-label={`${t('addToCart')}: ${p.name}`}>{out ? t('outOfStock') : `+ ${t('add')}`}</button>
        </div>
      </div>
    </article>
  );
}