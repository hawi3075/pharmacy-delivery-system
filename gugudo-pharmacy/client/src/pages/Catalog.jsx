import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import ProductCard from '../components/ProductCard';
import { Empty, PageTitle } from '../components/ui';

export default function Catalog() {
  const { t } = useApp();
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [cats, setCats] = useState([]);
  const q = sp.get('q') || '';
  const category = sp.get('category') || '';
  useEffect(() => { api('/categories').then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    const p = new URLSearchParams(); if (q) p.set('q', q); if (category) p.set('category', category);
    api('/products?' + p).then(setProducts).catch(() => setProducts([]));
  }, [q, category]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };

  return (
    <div>
      <PageTitle>{t('catalog')}</PageTitle>
      <div className="mb-5 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder={t('search')} value={q} onChange={(e) => set('q', e.target.value)} />
        <select className="input max-w-xs" value={category} onChange={(e) => set('category', e.target.value)} aria-label={t('category')}>
          <option value="">{t('category')}: {t('all')}</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {products && products.length === 0 ? <Empty>{t('noItems')}</Empty> :
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{(products || []).map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </div>
  );
}
