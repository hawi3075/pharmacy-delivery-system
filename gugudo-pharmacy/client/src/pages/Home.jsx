import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import { DetailLink, ProductImg, Stars, getRating } from '../components/ProductCard';
import { money } from '../components/ui';
import { WishButton } from './Wishlist';

const heroImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85';
const catImages = [
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
];
const MAIN_CATEGORIES = [
  { name: 'Pharmaceuticals', description: 'Essential medicines, specialty therapeutics, and over-the-counter products.' },
  { name: 'Medical Equipment & Devices', description: 'Diagnostic tools, hospital furniture, surgical instruments, and patient monitors.' },
  { name: 'Medical Consumables', description: 'PPE, syringes, gloves, bandages, and lab supplies.' },
  { name: 'Wholesale & Institutional Supply Services', description: 'Tailored solutions for bulk orders, tender participation, and scheduled institutional replenishment.' },
];

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
        <DetailLink id={p.id} className="absolute right-12 top-2 z-10" />
      </Link>
      <div className="mt-3 flex-1">
        <p className="text-xs font-semibold text-brand">{p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-0.5 block font-bold leading-snug hover:text-brand">{p.name}</Link>
        <div className="mt-1.5"><Stars value={getRating(p)} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <b className="text-lg">{money(p.price)}</b>
        <div className="flex gap-2">
          <DetailLink id={p.id} />
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

function SectionTitle({ eyebrow, title, link = '/catalog' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div><p className="text-sm font-bold text-brand">{eyebrow}</p><h2 className="mt-1 text-3xl md:text-4xl">{title}</h2></div>
      <Link to={link} className="shrink-0 text-sm font-bold text-brand hover:text-brand-dark">View all →</Link>
    </div>
  );
}

function CatTile({ c, i, big }) {
  const category = c.id ? String(c.id) : c.name;
  return (
    <Link to={`/catalog?category=${encodeURIComponent(category)}`} className={`group relative overflow-hidden rounded-3xl ${big ? 'col-span-2 row-span-2 min-h-[20rem]' : 'min-h-[10rem]'}`}>
      <img src={catImages[i % catImages.length]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102f2c]/90 via-[#102f2c]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 text-white">
        <div><h3 className={big ? 'text-3xl' : 'text-xl'}>{c.name}</h3><p className="mt-1 max-w-xs text-xs text-white/70">{c.description}</p></div>
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

  const shown = MAIN_CATEGORIES.map((mainCategory) => ({
    ...mainCategory,
    id: cats.find((category) => category.name === mainCategory.name)?.id,
  }));
  const trending = [...products].sort((a, b) => b.id - a.id);
  const topRated = [...products].sort((a, b) => getRating(b) - getRating(a));
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  const hi = (ms) => ({ animationDelay: `${ms}ms` });
  return (
    <div className="space-y-20">
      
      <section className="hero-grid relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 dark:bg-slate-800 md:px-14 md:py-16">
        <span className="blob -left-10 top-10 h-64 w-64 bg-[#0e6f7e]/30" />
        <span className="blob -bottom-16 right-1/3 h-72 w-72 bg-[#7fd6c2]/40" style={{ animationDelay: '-7s' }} />
        <div className="relative z-10 max-w-xl">
          <p className="hero-in mb-4 text-sm font-bold uppercase tracking-[0.18em] text-brand" style={hi(0)}>Gugudo Pharma · Hawassa, Ethiopia</p>
          <h1 className="hero-in text-5xl leading-[1.04] text-[#173f3b] dark:text-white md:text-7xl" style={hi(100)}>{t('welcomeTitle')}</h1>
          <p className="hero-in mt-5 max-w-lg text-base leading-7 text-[#52625b] dark:text-slate-300" style={hi(220)}>{t('welcomeSub')}</p>
          <form className="hero-in mt-8 flex max-w-xl gap-2 rounded-full bg-white p-2 shadow-xl dark:bg-slate-900" style={hi(340)} onSubmit={(e) => { e.preventDefault(); nav('/catalog?q=' + encodeURIComponent(q)); }}>
            <input className="input !rounded-full border-0 shadow-none" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('search')} />
            <button className="btn shrink-0">{t('search')}</button>
          </form>
          <div className="hero-in mt-4 flex flex-wrap gap-3" style={hi(400)}>
            <Link to="/catalog" className="btn">Explore our products →</Link>
            <Link to="/contact" className="btn-ghost">Partner with us</Link>
          </div>
          <div className="hero-in mt-5 flex flex-wrap gap-2" style={hi(460)}>
            {shown.map((c) => <Link key={c.name} to={`/catalog?category=${encodeURIComponent(c.id || c.name)}`} className="rounded-full border border-brand/20 bg-white/70 px-4 py-2 text-sm font-bold text-[#207065] transition hover:bg-white dark:bg-slate-900/60">{c.name}</Link>)}
          </div>
        </div>
        <div className="hero-in relative mt-10 md:absolute md:right-8 md:top-8 md:mt-0 md:w-[43%]" style={hi(250)}>
          <img src={heroImage} alt="Pharmacist arranging trusted medicines" className="h-72 w-full rounded-[1.75rem] object-cover shadow-2xl md:h-[27rem]" />
          <div className="float absolute -bottom-5 -left-4 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
            <p className="text-sm font-extrabold text-brand">Quality supply</p><p className="mt-1 text-xs font-bold text-slate-500">For healthcare providers</p>
          </div>
          <div className="float absolute -right-3 top-6 hidden rounded-2xl bg-white px-4 py-3 shadow-xl dark:bg-slate-900 md:block" style={{ animationDelay: '-3s' }}>
            <p className="text-sm font-extrabold text-brand">Cold-chain ready</p><p className="text-xs text-slate-500">Careful storage and delivery</p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <Reveal>
        <div className="card grid divide-y divide-[#e5e4dc] dark:divide-slate-700 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[['✓', 'Quality assurance', 'Carefully sourced products and responsible handling'], ['◷', 'Fast regional delivery', 'Dependable supply across Hawassa and Southern Ethiopia'], ['✦', 'Institutional pricing', 'Practical wholesale support for healthcare providers']].map(([icon, title, text]) => (
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
          <SectionTitle eyebrow="Our product range" title="Pharmaceuticals and medical supplies" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
            {shown.map((c, i) => <CatTile key={c.name} c={c} i={i} big={i === 0} />)}
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
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#7fd6c2]">Wholesale and institutional supply</p>
              <h2 className="mt-2 max-w-xl text-3xl md:text-4xl">The right products for your facility.</h2>
              <p className="mt-2 text-white/70">We support bulk orders, tender participation, and scheduled replenishment for hospitals, clinics, pharmacies, and NGOs.</p>
            </div>
            <Link to="/contact" className="btn !bg-white !px-7 !py-3 !text-[#173f3b] hover:!bg-[#e6f6f8]">Request a quotation</Link>
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
          <SectionTitle eyebrow="Quality products" title="Products selected for reliable care" />
          <Carousel items={topRated} />
        </section></Reveal>
      )}

      {/* Marquee */}
      <div className="overflow-hidden rounded-full bg-[#e6f6f8] py-4 text-[#173f3b] dark:bg-slate-800 dark:text-white" aria-hidden>
        <div className="ticker-track flex w-max gap-10 text-sm font-bold">
          {['Quality pharmaceuticals', 'Medical equipment', 'Medical consumables', 'Institutional supply', 'Southern Ethiopia delivery', 'EFDA-aware handling'].concat(['Quality pharmaceuticals', 'Medical equipment', 'Medical consumables', 'Institutional supply', 'Southern Ethiopia delivery', 'EFDA-aware handling']).map((m, i) => <span key={i} className="flex items-center gap-10">{m}<span className="text-amber-400">★</span></span>)}
        </div>
      </div>

      {/* How it works */}
      <Reveal>
        <section>
          <SectionTitle eyebrow="Work with Gugudo" title="A clear supply process" />
          <div className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-6 hidden border-t-2 border-dashed border-brand/30 md:block" />
            {[['1', 'Tell us your needs', 'Share the products, quantities, and delivery schedule your facility requires.'], ['2', 'Receive a clear quotation', 'Our team will help confirm availability, pricing, and product details.'], ['3', 'Build a dependable supply', 'We coordinate delivery and ongoing replenishment for your organization.']].map(([n, title, text]) => (
              <div key={n} className="relative text-center">
                <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow-lg">{n}</span>
                <h3 className="mt-4 text-2xl">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="rounded-[2rem] bg-[#207065] px-7 py-10 text-white md:px-14 md:py-12">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#b9f0dc]">Who we serve</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Supporting the people who deliver care.</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {['Hospitals', 'Clinics', 'Pharmacies', 'NGOs and health programs'].map((audience) => <div key={audience} className="rounded-2xl bg-white/10 p-4 text-lg font-bold">{audience}</div>)}
          </div>
        </section>
      </Reveal>

      {/* Why choose us */}
      <Reveal>
        <section className="rounded-[2rem] bg-[#f1eee5] px-7 py-10 dark:bg-slate-800 md:px-14 md:py-12">
          <SectionTitle eyebrow="Why Gugudo?" title="A reliable partner for better healthcare supply" link="/about" />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['✦', 'Broad product range', 'Pharmaceuticals, equipment, diagnostic devices, and consumables.'],
              ['✓', 'Quality and safety', 'Responsible sourcing, storage, and handling for every product.'],
              ['◷', 'Reliable logistics', 'Regional delivery and replenishment support you can plan around.'],
              ['♡', 'Long-term partnership', 'Responsive service built around your organization’s needs.'],
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
        <div><Link to="/" className="text-2xl font-bold text-[#207065]" style={{ fontFamily: "'DM Serif Display', serif" }}>Gugudo</Link><p className="mt-3 text-sm leading-6 text-slate-500">Safe, reliable pharmaceutical and medical equipment supply for a healthier Southern Ethiopia.</p></div>
        <div><h3 className="text-lg">Products</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/catalog">Browse products</Link><Link to="/about">Our services</Link></div></div>
        <div><h3 className="text-lg">Partner with us</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link to="/contact">Request a quotation</Link><Link to="/contact">Institutional supply</Link></div></div>
        <div><h3 className="text-lg">Contact Gugudo</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><a href="mailto:gugudopharma27@gmail.com">gugudopharma27@gmail.com</a><a href="tel:+251916853543">WhatsApp: 0916 853 543</a><a href="https://t.me/0950477994" target="_blank" rel="noreferrer">Telegram: 0950 477 994</a></div></div>
      </footer>
    </div>
  );
}