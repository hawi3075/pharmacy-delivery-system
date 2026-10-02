import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { t } = useApp();
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api('/products').then((p) => setProducts(p.slice(0, 8))).catch(() => {});
    api('/categories').then(setCats).catch(() => {});
  }, []);

  return (
    <div className="space-y-14 pb-10">
      <section className="mesh-bg relative overflow-hidden rounded-[2rem] px-7 py-12 md:px-16 md:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-[#0e6f7e]">Your health, thoughtfully delivered</p>
          <h1 className="max-w-2xl text-5xl leading-[1.02] text-[#173f3b] md:text-7xl dark:text-white">{t('welcomeTitle')}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#52625b] dark:text-slate-300">{t('welcomeSub')} Browse everyday essentials and pharmacist-approved care from one calm, trusted place.</p>
          <form className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-xl" onSubmit={(e) => { e.preventDefault(); nav('/catalog?q=' + encodeURIComponent(q)); }}>
            <input className="input border-0 shadow-none" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn">{t('search')}</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {cats.slice(0, 4).map((c) => <Link key={c.id} to={`/catalog?category=${c.id}`} className="rounded-full border border-[#207065]/20 bg-white/70 px-4 py-2 text-sm font-bold text-[#207065] dark:bg-slate-900">{c.name}</Link>)}
          </div>
        </div>
        <div className="absolute -right-10 -top-8 hidden h-72 w-72 rounded-full border-[28px] border-white/40 md:block" />
        <div className="absolute -bottom-24 right-24 hidden h-64 w-64 rounded-full bg-[#0e6f7e]/20 md:block" />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-0 bg-[#207065] p-6 text-white"><span className="text-2xl">✦</span><h3 className="mt-4 text-2xl">Pharmacist care</h3><p className="mt-2 text-sm leading-6 text-white/75">Real people are here to help you choose with confidence.</p></div>
        <div className="card p-6"><span className="text-2xl text-[#0e6f7e]">◷</span><h3 className="mt-4 text-2xl">Care on your time</h3><p className="mt-2 text-sm leading-6 text-slate-500">Order online and follow every step from checkout to doorstep.</p></div>
        <div className="card bg-[#e6f6f8] p-6"><span className="text-2xl text-[#0e6f7e]">♡</span><h3 className="mt-4 text-2xl">Made for everyday life</h3><p className="mt-2 text-sm leading-6 text-slate-600">Essentials, wellness, and trusted advice in one place.</p></div>
      </div>
      <div>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6f7e]">Curated for you</p><h2 className="mt-1 text-3xl">{t('featured')}</h2></div><Link to="/catalog" className="text-sm font-bold text-[#0e6f7e]">View all →</Link></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </div>
  );
}
