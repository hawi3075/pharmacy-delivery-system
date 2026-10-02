import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { ProductImg } from '../components/ProductCard';
import { Empty, PageTitle, money } from '../components/ui';

export const FREE_OVER = 1000, FEE = 50;
export const totals = (cart) => {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = subtotal === 0 || subtotal >= FREE_OVER ? 0 : FEE;
  return { subtotal, fee, total: subtotal + fee };
};

export default function Cart() {
  const { t, cart, setQty, removeFromCart, user } = useApp();
  const nav = useNavigate();
  const { subtotal, fee, total } = totals(cart);
  if (!cart.length) return <Empty>{t('empty')} <Link className="font-semibold text-brand" to="/catalog">{t('shopNow')}</Link></Empty>;

  return (
    <div>
      <PageTitle>{t('cart')}</PageTitle>
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          {cart.map((i) => (
            <div key={i.id} className="card flex items-center gap-4 p-3">
              <div className="w-20"><ProductImg p={i} className="h-16" /></div>
              <div className="flex-1">
                <Link to={`/product/${i.id}`} className="font-semibold">{i.name}</Link>
                <p className="text-sm text-slate-500">{money(i.price)}</p>
                {i.requiresRx && <p className="text-xs font-semibold text-rose-600">{t('rxRequired')}</p>}
              </div>
              <input type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, Number(e.target.value))} className="input !w-16" aria-label="Quantity" />
              <b className="w-24 text-right">{money(i.price * i.qty)}</b>
              <button className="text-red-600" onClick={() => removeFromCart(i.id)} aria-label={t('delete')}>✕</button>
            </div>
          ))}
        </div>
        <aside className="card h-fit space-y-2 p-4 text-sm">
          <div className="flex justify-between"><span>{t('subtotal')}</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>{t('delivery')}</span><span>{fee ? money(fee) : t('free')}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold dark:border-slate-700"><span>{t('total')}</span><span>{money(total)}</span></div>
          <button className="btn w-full" onClick={() => nav(user ? '/checkout' : '/login?next=/checkout')}>{user ? t('checkout') : t('loginToCheckout')}</button>
        </aside>
      </div>
    </div>
  );
}
