import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import ProductCard from '../components/ProductCard';

const heroImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85';
const categoryImages = [
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
];

function SectionTitle({ eyebrow, title, link = '/catalog' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">{eyebrow}</p><h2 className="mt-1 text-3xl md:text-4xl">{title}</h2></div>
      <Link to={link} className="shrink-0 text-sm font-bold text-brand hover:text-brand-dark">View all <span aria-hidden>→</span></Link>
    </div>
  );
}

export default function Home() {
  const { t } = useApp();
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api('/products').then((p) => setProducts(p)).catch(() => {});
    api('/categories').then(setCats).catch(() => {});
  }, []);

  const categoryNames = ['Vitamins & Supplements', 'Personal Care', 'Pain Relief', 'First Aid'];
  const visibleCategories = cats.length ? cats.slice(0, 4) : categoryNames.map((name, id) => ({ id, name }));
  const productRows = [products.slice(0, 4), products.slice(4, 8), products.slice(0, 4), products.slice(4, 8)];

  return (
    <div className="space-y-16 pb-0">
      <section className="hero-grid relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 md:px-14 md:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.25em] text-brand">Your health, thoughtfully delivered</p>
          <h1 className="text-5xl leading-[1.02] text-[#173f3b] md:text-7xl">{t('welcomeTitle')}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#52625b]">{t('welcomeSub')} Browse everyday essentials and pharmacist-approved care from one calm, trusted place.</p>
          <form className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-xl" onSubmit={(e) => { e.preventDefault(); nav('/catalog?q=' + encodeURIComponent(q)); }}>
            <input className="input border-0 shadow-none" placeholder="What are you looking for?" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn shrink-0">Search</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleCategories.map((c) => <Link key={c.id} to={`/catalog?category=${c.id}`} className="rounded-full border border-[#207065]/20 bg-white/70 px-4 py-2 text-sm font-bold text-[#207065]">{c.name}</Link>)}
          </div>
        </div>
        <div className="hero-image relative mt-8 md:absolute md:right-8 md:top-8 md:mt-0 md:w-[43%]">
          <img src={heroImage} alt="Pharmacist arranging trusted medicines" className="h-72 w-full rounded-[1.5rem] object-cover shadow-2xl md:h-[27rem]" />
          <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-4 shadow-xl"><p className="text-2xl font-black text-brand">4.9/5</p><p className="text-xs font-bold text-slate-500">from happy customers</p></div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[['◷', '24 hour service', 'Support whenever you need it'], ['✦', 'Easy categories', 'Find care in just a few taps'], ['✓', '100% secure checkout', 'Your privacy is always protected']].map(([icon, title, text], i) => (
          <div key={title} className={`feature-card card flex items-start gap-4 p-5 ${i === 0 ? 'border-0 bg-[#207065] text-white' : ''}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${i === 0 ? 'bg-white/15' : 'bg-brand-light text-brand'}`}>{icon}</span>
            <div><h3 className="text-xl">{title}</h3><p className={`mt-1 text-sm ${i === 0 ? 'text-white/70' : 'text-slate-500'}`}>{text}</p></div>
          </div>
        ))}
      </section>

      <div className="ticker overflow-hidden rounded-xl bg-[#173f3b] py-3 text-white">
        <div className="ticker-track flex w-max gap-12 text-xs font-extrabold uppercase tracking-[0.2em]"><span>Security first</span><span>Pharmacist approved</span><span>Quality care</span><span>Fast delivery</span><span>Security first</span><span>Pharmacist approved</span><span>Quality care</span><span>Fast delivery</span></div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['All sales', 'Fresh offers every week', 'bg-[#fcefe5]'], ['Wish lists', 'Save care for later', 'bg-[#e7f3ed]'], ['New arrivals', 'Discover what is new', 'bg-[#e8eff8]'], ['Pharmacist picks', 'Trusted recommendations', 'bg-[#f5edda]']].map(([title, text, color]) => (
          <Link to="/catalog" key={title} className={`rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg ${color}`}><span className="text-2xl text-[#173f3b]">↗</span><h3 className="mt-5 text-xl">{title}</h3><p className="mt-1 text-xs text-slate-600">{text}</p></Link>
        ))}
      </section>

      <section><SectionTitle eyebrow="Explore care" title="Shop by category" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{visibleCategories.map((c, i) => <Link to={`/catalog?category=${c.id}`} key={c.id} className="category-card group relative overflow-hidden rounded-2xl"><img src={categoryImages[i]} alt="" className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#173f3b]/85 to-transparent" /><h3 className="absolute bottom-4 left-4 text-xl text-white">{c.name}</h3></Link>)}</div></section>

      {products.length > 0 && <><section><SectionTitle eyebrow="Popular today" title="Trending products" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{productRows[0].map((p) => <ProductCard key={p.id} p={p} />)}</div></section>
        <section><SectionTitle eyebrow="Just arrived" title="New arrivals" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{productRows[1].map((p) => <ProductCard key={p.id} p={p} />)}</div></section>
        <section><SectionTitle eyebrow="Loved by customers" title="Top rated" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{productRows[2].map((p) => <ProductCard key={p.id} p={p} />)}</div></section></>}

      <section className="rounded-[2rem] bg-[#f1eee5] px-7 py-12 md:px-14"><SectionTitle eyebrow="Simple by design" title="How it works" /><div className="grid gap-8 md:grid-cols-3">{[['01', 'Find what you need', 'Browse trusted products and clear pharmacist guidance.'], ['02', 'Order with confidence', 'Add to cart and checkout securely in a few clicks.'], ['03', 'Care arrives at your door', 'Track your order and pay when it arrives.']].map(([num, title, text]) => <div key={num} className="flex gap-4"><b className="text-4xl text-brand/40">{num}</b><div><h3 className="text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></div>)}</div></section>

      <section><div className="mb-7 max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">The Doka difference</p><h2 className="mt-1 text-3xl md:text-4xl">Why we choose care over clutter</h2></div><div className="grid gap-4 md:grid-cols-4">{[['4.9/5', 'Average rating'], ['12k+', 'Happy customers'], ['98%', 'On-time delivery'], ['24/7', 'Care support']].map(([value, label]) => <div key={label} className="rounded-2xl border border-[#e5e4dc] p-6"><p className="text-3xl font-black text-brand">{value}</p><p className="mt-2 text-sm font-bold text-slate-500">{label}</p></div>)}</div></section>

      <section className="rounded-[2rem] bg-[#207065] px-7 py-12 text-white md:px-14"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">Built on trust</p><h2 className="mt-2 text-4xl">Why professionals trust Doka Mart</h2><p className="mt-4 leading-7 text-white/75">From carefully selected products to dependable delivery, every part of Doka Mart is designed with the same attention to detail that healthcare professionals bring to your care.</p><div className="mt-7 flex flex-wrap gap-3"><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Licensed pharmacists</span><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Quality checked</span><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Doorstep care</span></div></div></section>

      <footer className="grid gap-8 border-t border-[#e5e4dc] py-10 md:grid-cols-4"><div><Link to="/" className="text-2xl font-bold text-[#207065]">Doka Mart</Link><p className="mt-3 text-sm leading-6 text-slate-500">Thoughtful health essentials, delivered with care.</p></div><div><h3 className="text-lg">Shop</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/catalog">All products</Link><Link to="/catalog">New arrivals</Link><Link to="/catalog">Best sellers</Link></div></div><div><h3 className="text-lg">Help</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/contact">Contact us</Link><Link to="/about">About Doka Mart</Link><Link to="/support">Delivery & returns</Link></div></div><div><h3 className="text-lg">Your health, our care</h3><p className="mt-3 text-sm leading-6 text-slate-500">Secure checkout and friendly support whenever you need it.</p></div></footer>
    </div>
  );
}
