import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { ProductImg } from '../components/ProductCard';
import { Empty, PageTitle, money } from '../components/ui';

/* ---------- Wishlist storage (browser only, saved as product ids) ---------- */
const KEY = 'gugudo_wishlist';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const listeners = new Set();

export function toggleWish(id) {
  const cur = read();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn(next));
}

export function useWishlist() {
  const [ids, setIds] = useState(read);
  useEffect(() => {
    listeners.add(setIds);
    const onStorage = () => setIds(read());
    window.addEventListener('storage', onStorage);
    return () => { listeners.delete(setIds); window.removeEventListener('storage', onStorage); };
  }, []);
  return { ids, has: (id) => ids.includes(id), toggle: toggleWish };
}

/* Heart button: put inside any element that has the "relative" class */
export function WishButton({ id, name = '', className = 'absolute right-2 top-2' }) {
  const { has } = useWishlist();
  const saved = has(id);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(id); }}
      aria-pressed={saved}
      aria-label={`Wishlist: ${name}`}
      className={`${className} z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-lg shadow transition hover:scale-110 ${saved ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

/* ---------- Page ---------- */
const L = {
  en: { title: 'My wishlist', empty: 'Your wishlist is empty. Tap the heart on a medicine to save it.', remove: 'Remove' },
  om: { title: 'Tarree fedhii koo', empty: "Tarreen kee duwwaa dha. Qorichoota olkaa'uuf onnee isaanii tuqi.", remove: 'Haqi' },
  am: { title: 'የእኔ ተወዳጆች', empty: 'ዝርዝርዎ ባዶ ነው። ለማስቀመጥ በመድኃኒቱ ላይ ያለውን ልብ ይንኩ።', remove: 'አስወግድ' },
};

export default function Wishlist() {
  const { t, lang, addToCart } = useApp();
  const x = (k) => L[lang]?.[k] ?? L.en[k];
  const { ids, toggle } = useWishlist();
  const [all, setAll] = useState(null);

  useEffect(() => { api('/products').then(setAll).catch(() => setAll([])); }, []);
  const items = (all || []).filter((p) => ids.includes(p.id));

  return (
    <div>
      <PageTitle>{x('title')}</PageTitle>
      {all && items.length === 0 ? (
        <Empty>{x('empty')} <Link className="font-semibold text-brand" to="/catalog">{t('shopNow')}</Link></Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="card flex flex-col p-3">
              <Link to={`/product/${p.id}`}><ProductImg p={p} className="h-40" /></Link>
              <div className="mt-3 flex-1">
                <p className="text-xs font-semibold text-brand">{p.category?.name}</p>
                <Link to={`/product/${p.id}`} className="font-bold hover:text-brand">{p.name}</Link>
                {p.requiresRx && <p className="mt-1 text-xs font-semibold text-rose-600">{t('rxRequired')}</p>}
              </div>
              <b className="mt-2 text-lg">{money(p.price)}</b>
              <div className="mt-3 flex gap-2">
                <button className="btn flex-1 !px-3 !py-2" disabled={p.stock === 0} onClick={() => addToCart(p)}>{p.stock === 0 ? t('outOfStock') : t('addToCart')}</button>
                <button className="btn-ghost !px-3 !py-2" onClick={() => toggle(p.id)} aria-label={`${x('remove')}: ${p.name}`}>{x('remove')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}