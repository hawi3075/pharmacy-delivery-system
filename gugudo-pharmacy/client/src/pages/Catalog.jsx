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
  const sort = sp.get('sort') || 'newest';
  const view = sp.get('view') || 'grid';
  useEffect(() => { api('/categories').then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    const p = new URLSearchParams(); if (q) p.set('q', q); if (category) p.set('category', category);
    api('/products?' + p).then(setProducts).catch(() => setProducts([]));
  }, [q, category]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  const rating = (p) => Number(p.rating ?? (4.3 + ((Number(p.id) * 37) % 7) / 10));
  const sortedProducts = [...(products || [])].sort((a, b) => {
    if (sort === 'price-low') return Number(a.price) - Number(b.price);
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'top-rated') return rating(b) - rating(a);
    return Number(b.id) - Number(a.id);
  });
  const viewButton = (value, label, icon) => (
    <button type="button" onClick={() => set('view', value)} aria-label={label} aria-pressed={view === value}
      className={`grid h-10 w-10 place-items-center rounded-xl text-lg transition ${view === value ? 'bg-brand text-white shadow-md' : 'text-slate-500 hover:bg-brand-light hover:text-brand dark:hover:bg-slate-700'}`}>
      {icon}
    </button>
  );

  return (
    <div>
      <div className="rounded-[2rem] bg-[#e6f6f8] px-6 py-8 dark:bg-slate-800 md:px-10">
        <PageTitle>{t('catalog')}</PageTitle>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Find trusted medicines and everyday wellness essentials, thoughtfully organized for you.</p>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => set('category', '')} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${!category ? 'bg-[#173f3b] text-white' : 'bg-white text-slate-600 hover:text-brand dark:bg-slate-900 dark:text-slate-300'}`}>All medicines</button>
          {cats.map((c) => <button type="button" key={c.id} onClick={() => set('category', String(c.id))} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${String(c.id) === category ? 'bg-[#173f3b] text-white' : 'bg-white text-slate-600 hover:text-brand dark:bg-slate-900 dark:text-slate-300'}`}>{c.name}</button>)}
        </div>
      </div>
      <div className="my-7 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[16rem] flex-1 gap-3">
          <input className="input max-w-md" placeholder={t('search')} value={q} onChange={(e) => set('q', e.target.value)} />
          <select className="input max-w-[13rem]" value={category} onChange={(e) => set('category', e.target.value)} aria-label={t('category')}>
            <option value="">{t('category')}: {t('all')}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="catalog-sort" className="text-sm font-bold text-slate-500">Sort by</label>
          <select id="catalog-sort" className="input !w-auto !py-2.5" value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="top-rated">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="name">Name: A-Z</option>
          </select>
          <div className="flex rounded-xl border border-[#d6d9d2] bg-white p-1 dark:border-slate-600 dark:bg-slate-900">
            {viewButton('grid', 'Show grid view', '▦')}
            {viewButton('list', 'Show list view', '☰')}
          </div>
        </div>
      </div>
      {products && products.length === 0 ? <Empty>{t('noItems')}</Empty> :
        <div className={view === 'list' ? 'grid gap-4' : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'}>{sortedProducts.map((p) => <ProductCard key={p.id} p={p} view={view} />)}</div>}
    </div>
  );
}
