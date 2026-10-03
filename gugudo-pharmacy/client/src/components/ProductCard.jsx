import { Link } from 'react-router-dom';
import { img } from '../api';
import { useApp } from '../store';
import { money } from './ui';
import { WishButton } from '../pages/Wishlist';

export function ProductImg({ p, className = 'h-32 sm:h-36' }) {
  const src = img(p.imageUrl);
  return src
    ? <img src={src} alt={p.name} className={`${className} w-full rounded-lg object-cover`} />
    : <div className={`${className} flex w-full items-center justify-center rounded-lg bg-brand-light text-4xl dark:bg-slate-700`} aria-hidden>💊</div>;
}

export default function ProductCard({ p, view = 'grid' }) {
  const { t, addToCart } = useApp();
  const out = p.stock === 0;
  return (
    <div className={`card group min-w-0 overflow-hidden rounded-xl p-2.5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(38,48,42,0.12)] ${view === 'list' ? 'flex items-center gap-4 sm:p-3' : 'flex flex-col'}`}>
      <div className="relative">
        <Link to={`/product/${p.id}`}><ProductImg p={p} className={view === 'list' ? 'h-28 w-28 shrink-0' : undefined} /></Link>
        <WishButton id={p.id} name={p.name} />
      </div>
      <div className={`${view === 'list' ? 'min-w-0 flex-1' : 'mt-3 flex-1'}`}>
        <p className="text-xs text-slate-500">{p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-1 block font-bold leading-5 transition-colors group-hover:text-[#0e6f7e]">{p.name}</Link>
        {p.requiresRx && <p className="mt-1 text-xs font-bold text-rose-600">{t('rxRequired')}</p>}
      </div>
      <div className={`${view === 'list' ? 'flex shrink-0 flex-col items-end gap-2' : 'mt-3 flex flex-wrap items-center justify-between gap-2'}`}>
        <b>{money(p.price)}</b>
        <div className="flex gap-2">
          <Link to={`/product/${p.id}`} className="btn-ghost !px-3 !py-1.5 text-xs">Details</Link>
          <button className="btn !px-3 !py-1.5" disabled={out} onClick={() => addToCart(p)}>{out ? t('outOfStock') : t('add')}</button>
        </div>
      </div>
    </div>
  );
}
