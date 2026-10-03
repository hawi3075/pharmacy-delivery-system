import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { ProductImg } from '../components/ProductCard';
import { money } from '../components/ui';
import { WishButton } from './Wishlist';

const heroImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85';
const catImages = [
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
];

/* PLACEHOLDER rating (4.3 to 4.9, stable per product) until real reviews exist.
   When the API returns p.rating, this uses it automatically. */
const getRating = (p) => p.rating ?? Math.round((4.3 + ((p.id * 37) % 7) / 10) * 10) / 10;

function Stars({ value, size = 'text-sm' }) {
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

function ShopCard({ p }) {
  const { t, addToCart } = useApp();
  const out = p.stock === 0;
  return (
    <div className="group card flex h-full flex-col overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(14,111,126,0.18)]">
      <Link to={`/product/${p.id}`} className="relative block overflow-hidden rounded-xl">
        <div className="transition duration-500 group-hover:scale-105"><ProductImg p={p} className="h-44" /></div>
        {p.requiresRx && <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">Rx</span>}
        {out && <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-slate-800">{t('outOfStock')}</span>}
        <WishButton id={p.id} name={p.name} />
      </Link>
      <div className="mt-3 flex-1">
        <p className="text-xs font-semibold text-brand">{p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-0.5 block font-bold leading-snug hover:text-brand">{p.name}</Link>
        <div className="mt-1.5"><Stars value={getRating(p)} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <b className="text-lg">{money(p.price)}</b>
        <div className="flex gap-2">
          <Link to={`/product/${p.id}`} className="btn-ghost !px-3 !py-2 text-xs">Details</Link>
          <button className="btn !px-3 !py-2" disabled={out} onClick={() => addToCart(p)} aria-label={`${t('addToCart')}: ${p.name}`}>+ {t('add')}</button>
        </div>
      </div>
    </div>
  );
}

function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, seen] = useInView();
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${seen ? 'is-in' : ''} ${className}`}>{children}</div>;
}

function CountUp({ to, suffix = '', decimals = 0 }) {
  const [ref, seen] = useInView();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf, t0;
    const step = (t) => { t0 ??= t; const p = Math.min((t - t0) / 1400, 1); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}

function SectionTitle({ eyebrow, title, link = '/catalog' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div><p className="text-sm font-bold text-brand">{eyebrow}</p><h2 className="mt-1 text-3xl md:text-4xl">{title}</h2></div>
      <Link to={link} className="shrink-0 text-sm font-bold text-brand hover:text-brand-dark">View all →</Link>
    </div>
  );
}

function CatTile({ c, i, big }) {
  return (
    <Link to={`/catalog?category=${c.id}`} className={`group relative overflow-hidden rounded-3xl ${big ? 'col-span-2 row-span-2 min-h-[20rem]' : 'min-h-[10rem]'}`}>
      <img src={catImages[i % catImages.length]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102f2c]/90 via-[#102f2c]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 text-white">
        <h3 className={big ? 'text-3xl' : 'text-xl'}>{c.name}</h3>
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white group-hover:text-brand">↗</span>
      </div>
    </Link>
  );
}

function Carousel({ items }) {
  const ref = useRef(null);
  const go = (d) => ref.current?.scrollBy({ left: d * 280, behavior: 'smooth' });
  const arrow = 'grid h-10 w-10 place-items-center rounded-full border border-[#d6d9d2] bg-white text-lg transition hover:border-brand hover:text-brand dark:bg-slate-800';
  return (
    <div>
      <div ref={ref} className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-3">
        {items.map((p) => <div key={p.id} className="w-[15rem] shrink-0 snap-start"><ShopCard p={p} /></div>)}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button className={arrow} onClick={() => go(-1)} aria-label="Previous">‹</button>
        <button className={arrow} onClick={() => go(1)} aria-label="Next">›</button>
      </div>
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
    api('/products').then(setProducts).catch(() => {});
    api('/categories').then(setCats).catch(() => {});
  }, []);

  const shown = cats.slice(0, 5);
  const trending = [...products].sort((a, b) => b.id - a.id);
  const topRated = [...products].sort((a, b) => getRating(b) - getRating(a));
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  const hi = (ms) => ({ animationDelay: `${ms}ms` });
  const marquee = ['Licensed pharmacists', 'Cold-chain delivery', 'Pay on arrival', 'Prescription checked', 'Secure checkout'];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="hero-grid relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 dark:bg-slate-800 md:px-14 md:py-16">
        <span className="blob -left-10 top-10 h-64 w-64 bg-[#0e6f7e]/30" />
        <span className="blob -bottom-16 right-1/3 h-72 w-72 bg-[#7fd6c2]/40" style={{ animationDelay: '-7s' }} />
        <div className="relative z-10 max-w-xl">
          <p className="hero-in mb-4 text-sm font-bold text-brand" style={hi(0)}>Your health, thoughtfully delivered</p>
          <h1 className="hero-in text-5xl leading-[1.04] text-[#173f3b] dark:text-white md:text-7xl" style={hi(100)}>{t('welcomeTitle')}</h1>
          <p className="hero-in mt-5 max-w-lg text-base leading-7 text-[#52625b] dark:text-slate-300" style={hi(220)}>{t('welcomeSub')}</p>
          <form className="hero-in mt-8 flex max-w-xl gap-2 rounded-full bg-white p-2 shadow-xl dark:bg-slate-900" style={hi(340)} onSubmit={(e) => { e.preventDefault(); nav('/catalog?q=' + encodeURIComponent(q)); }}>
            <input className="input !rounded-full border-0 shadow-none" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('search')} />
            <button className="btn shrink-0">{t('search')}</button>
          </form>
          <div className="hero-in mt-5 flex flex-wrap gap-2" style={hi(460)}>
            {cats.slice(0, 4).map((c) => <Link key={c.id} to={`/catalog?category=${c.id}`} className="rounded-full border border-brand/20 bg-white/70 px-4 py-2 text-sm font-bold text-[#207065] transition hover:bg-white dark:bg-slate-900/60">{c.name}</Link>)}
          </div>
        </div>
        <div className="hero-in relative mt-10 md:absolute md:right-8 md:top-8 md:mt-0 md:w-[43%]" style={hi(250)}>
          <img src={heroImage} alt="Pharmacist arranging trusted medicines" className="h-72 w-full rounded-[1.75rem] object-cover shadow-2xl md:h-[27rem]" />
          <div className="float absolute -bottom-5 -left-4 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
            <Stars value={4.9} size="text-base" /><p className="mt-1 text-xs font-bold text-slate-500">Loved by customers</p>
          </div>
          <div className="float absolute -right-3 top-6 hidden rounded-2xl bg-white px-4 py-3 shadow-xl dark:bg-slate-900 md:block" style={{ animationDelay: '-3s' }}>
            <p className="text-sm font-extrabold text-brand">Fast delivery</p><p className="text-xs text-slate-500">Cold-chain safe</p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <Reveal>
        <div className="card grid divide-y divide-[#e5e4dc] dark:divide-slate-700 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[['◷', 'Always here to help', 'Message our pharmacists any time'], ['✦', 'Find care in a few taps', 'Clear categories, simple search'], ['✓', 'Secure checkout', 'Your privacy is always protected']].map(([icon, title, text]) => (
            <div key={title} className="flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-lg text-brand dark:bg-slate-700">{icon}</span>
              <div><h3 className="text-lg">{title}</h3><p className="text-sm text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Categories: one large tile leads, the rest follow */}
      {shown.length > 0 && (
        <Reveal><section>
          <SectionTitle eyebrow="Explore care" title="Shop by category" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
            {shown.map((c, i) => <CatTile key={c.id} c={c} i={i} big={i === 0} />)}
          </div>
        </section></Reveal>
      )}

      {/* Trending carousel */}
      {products.length > 0 && (
        <Reveal><section>
          <SectionTitle eyebrow="Popular today" title="Trending products" />
          <Carousel items={trending} />
        </section></Reveal>
      )}

      {/* Special offer */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[2rem] bg-[#173f3b] px-7 py-10 text-white md:px-14 md:py-12">
          <span className="blob -right-10 -top-10 h-60 w-60 bg-[#0e6f7e]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#7fd6c2]">Special offer</p>
              <h2 className="mt-2 max-w-xl text-3xl md:text-4xl">Free delivery on orders over ETB 1,000</h2>
              <p className="mt-2 text-white/70">Save more on everyday care while supplies last. Pay in cash when your medicines arrive.</p>
            </div>
            <Link to="/catalog" className="btn !bg-white !px-7 !py-3 !text-[#173f3b] hover:!bg-[#e6f6f8]">Start shopping</Link>
          </div>
        </section>
      </Reveal>

      {/* New arrivals */}
      {newest.length > 0 && (
        <section>
          <Reveal><SectionTitle eyebrow="Just arrived" title="New arrivals" /></Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newest.map((p, i) => <Reveal key={p.id} delay={i * 90}><ShopCard p={p} /></Reveal>)}
          </div>
        </section>
      )}

      {/* Top rated */}
      {topRated.length > 0 && (
        <Reveal><section>
          <SectionTitle eyebrow="Trusted by our community" title="Top rated products" />
          <Carousel items={topRated} />
        </section></Reveal>
      )}

      {/* Marquee */}
      <div className="overflow-hidden rounded-full bg-[#e6f6f8] py-4 text-[#173f3b] dark:bg-slate-800 dark:text-white" aria-hidden>
        <div className="ticker-track flex w-max gap-10 text-sm font-bold">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((m, i) => <span key={i} className="flex items-center gap-10">{m}<span className="text-amber-400">★</span></span>)}
        </div>
      </div>

      {/* How it works */}
      <Reveal>
        <section>
          <SectionTitle eyebrow="Simple by design" title="How it works" />
          <div className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-6 hidden border-t-2 border-dashed border-brand/30 md:block" />
            {[['1', 'Find what you need', 'Browse trusted products or search by name.'], ['2', 'Order with confidence', 'Upload a prescription if needed and check out.'], ['3', 'Care arrives at your door', 'Track your order and pay when it arrives.']].map(([n, title, text]) => (
              <div key={n} className="relative text-center">
                <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow-lg">{n}</span>
                <h3 className="mt-4 text-2xl">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Numbers (replace with your real figures) */}
      <Reveal>
        <section className="grid gap-px overflow-hidden rounded-[2rem] bg-[#207065] text-white md:grid-cols-4">
          {[[4.9, '/5', 1, 'Average rating'], [12, 'k+', 0, 'Happy customers'], [98, '%', 0, 'On-time delivery'], [24, '/7', 0, 'Care support']].map(([to, suffix, d, label]) => (
            <div key={label} className="px-6 py-10 text-center">
              <p className="text-5xl" style={{ fontFamily: "'DM Serif Display', serif" }}><CountUp to={to} suffix={suffix} decimals={d} /></p>
              <p className="mt-2 text-sm font-bold text-white/70">{label}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* Why choose us */}
      <Reveal>
        <section className="rounded-[2rem] bg-[#f1eee5] px-7 py-10 dark:bg-slate-800 md:px-14 md:py-12">
          <SectionTitle eyebrow="The Doka difference" title="Why choose Doka Mart?" link="/about" />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['✦', 'Pharmacist approved', 'Every product is selected with your wellbeing in mind.'],
              ['✓', 'Quality you can trust', 'Reliable medicines and essentials from verified sources.'],
              ['◷', 'Delivery that fits you', 'Fast, careful delivery with pay-on-arrival convenience.'],
              ['♡', 'Care that feels human', 'Friendly support whenever you need help choosing.'],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-2xl bg-white p-5 dark:bg-slate-900">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-lg text-brand dark:bg-slate-700">{icon}</span>
                <h3 className="mt-4 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <footer className="grid gap-8 border-t border-[#e5e4dc] py-10 dark:border-slate-700 md:grid-cols-4">
        <div><Link to="/" className="text-2xl font-bold text-[#207065]" style={{ fontFamily: "'DM Serif Display', serif" }}>Gugudo</Link><p className="mt-3 text-sm leading-6 text-slate-500">Thoughtful health essentials, delivered with care.</p></div>
        <div><h3 className="text-lg">Shop</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/catalog">All products</Link><Link to="/orders">My orders</Link></div></div>
        <div><h3 className="text-lg">Help</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/support">Contact support</Link><Link to="/addresses">Saved addresses</Link></div></div>
        <div><h3 className="text-lg">Your health, our care</h3><p className="mt-3 text-sm leading-6 text-slate-500">Secure checkout and friendly support whenever you need it.</p></div>
      </footer>
    </div>
  );
}