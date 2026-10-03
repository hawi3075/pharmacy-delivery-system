import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import ProductCard, { getRating } from '../components/ProductCard';

const L = {
  en: { home: 'Home', title: 'Medicines', sub: 'Find trusted medicines and everyday wellness essentials.', search: 'Search by name or ingredient', all: 'All medicines', sort: 'Sort', newest: 'Newest', top: 'Top rated', low: 'Price: low to high', high: 'Price: high to low', name: 'Name: A to Z', grid: 'Grid view', list: 'List view', count: 'medicines', forq: 'Results for', clear: 'Clear filters', none: 'No medicines match your search.', shop: 'Shop', help: 'Help', tag: 'Trusted medicines, delivered to your door.', rights: 'All rights reserved.', contact: 'Contact', about: 'About', support: 'Support', orders: 'My orders', wish: 'Wishlist' },
  om: { home: 'Mana', title: 'Qorichoota', sub: 'Qorichoota amanamoo fi meeshaalee fayyaa guyyaa guyyaa argadhu.', search: 'Maqaa ykn dhangala’aan barbaadi', all: 'Qorichoota hunda', sort: 'Tartiiba', newest: 'Haaraa', top: 'Sadarkaa olaanaa', low: 'Gatii: gadi aanaa irraa', high: 'Gatii: ol aanaa irraa', name: 'Maqaa: A hanga Z', grid: 'Ilaalcha gabatee', list: 'Ilaalcha tarree', count: 'qorichoota', forq: 'Bu’aa', clear: 'Calaqqisiisa haqi', none: 'Qorichi barbaadde hin argamne.', shop: 'Gurgurtaa', help: 'Gargaarsa', tag: 'Qorichoota amanamoo, balbala keessanitti.', rights: 'Mirgi hunduu eegameera.', contact: 'Nu qunnamaa', about: 'Waa’ee keenya', support: 'Deeggarsa', orders: 'Ajajawwan koo', wish: 'Fedhii koo' },
  am: { home: 'መነሻ', title: 'መድኃኒቶች', sub: 'የታመኑ መድኃኒቶችን እና የዕለት ተዕለት የጤና ምርቶችን ያግኙ።', search: 'በስም ወይም በንጥረ ነገር ይፈልጉ', all: 'ሁሉም መድኃኒቶች', sort: 'ደርድር', newest: 'አዲስ', top: 'ከፍተኛ ደረጃ', low: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ', high: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ', name: 'ስም፡ ከ A እስከ Z', grid: 'ፍርግርግ እይታ', list: 'ዝርዝር እይታ', count: 'መድኃኒቶች', forq: 'ውጤቶች ለ', clear: 'ማጣሪያዎችን አጽዳ', none: 'ከፍለጋዎ ጋር የሚዛመድ መድኃኒት የለም።', shop: 'ግዢ', help: 'እገዛ', tag: 'የታመኑ መድኃኒቶች፣ እስከ ደጃፍዎ።', rights: 'መብቱ በሕግ የተጠበቀ ነው።', contact: 'አግኙን', about: 'ስለ እኛ', support: 'ድጋፍ', orders: 'ትዕዛዞቼ', wish: 'ተወዳጆች' },
};

const categoryVisuals = [
  { match: 'pain', icon: '✚', description: 'Comfort and everyday pain relief', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80' },
  { match: 'vitamin', icon: '✦', description: 'Daily support for your wellbeing', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca8?auto=format&fit=crop&w=700&q=80' },
  { match: 'supplement', icon: '✦', description: 'Nourishment for a healthier routine', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80' },
  { match: 'first aid', icon: '＋', description: 'Be ready for life’s little surprises', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=700&q=80' },
  { match: 'allerg', icon: '◌', description: 'Gentle relief when you need it', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80' },
  { match: 'diabet', icon: '♡', description: 'Thoughtful support for daily care', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80' },
];
const defaultCategoryVisual = { icon: '✚', description: 'Trusted care, thoughtfully selected', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80' };
const getCategoryVisual = (name = '') => categoryVisuals.find((v) => name.toLowerCase().includes(v.match)) || defaultCategoryVisual;

const Svg = ({ children }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;

function SortMenu({ value, onChange, x }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const opts = [['newest', x('newest')], ['top-rated', x('top')], ['price-low', x('low')], ['price-high', x('high')], ['name', x('name')]];
  const cur = opts.find((o) => o[0] === value) || opts[0];
  return (
    <div className="relative" ref={ref} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-full border border-[#d6d9d2] bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
        <span className="hidden text-slate-400 sm:inline">{x('sort')}:</span>{cur[1]}
        <span aria-hidden className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <ul role="listbox" className="card absolute right-0 top-full z-30 mt-2 w-56 p-1.5 shadow-xl">
          {opts.map(([v, label]) => {
            const on = v === value;
            return (
              <li key={v}>
                <button type="button" role="option" aria-selected={on} onClick={() => { onChange(v); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-brand-light dark:hover:bg-slate-700 ${on ? 'bg-brand-light text-brand dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200'}`}>
                  {label}{on && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoryMenu({ value, onChange, cats, x }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const current = cats.find((c) => String(c.id) === value);
  return (
    <div className="relative" ref={ref} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-full border border-[#d6d9d2] bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
        <span className="hidden text-slate-400 sm:inline">Category:</span>{current?.name || x('all')}
        <span aria-hidden className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <ul role="listbox" className="card absolute right-0 top-full z-30 mt-2 max-h-72 w-60 overflow-y-auto p-1.5 shadow-xl">
          {[{ id: '', name: x('all') }, ...cats].map((c) => {
            const on = String(c.id) === value;
            return (
              <li key={c.id || 'all'}>
                <button type="button" role="option" aria-selected={on} onClick={() => { onChange(String(c.id)); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-brand-light dark:hover:bg-slate-700 ${on ? 'bg-brand-light text-brand dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200'}`}>
                  <span className="truncate">{c.name}</span>{on && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ViewToggle({ value, onChange, x }) {
  const btn = (v, label, icon) => (
    <button type="button" onClick={() => onChange(v)} aria-label={label} title={label} aria-pressed={value === v}
      className={`grid h-8 w-9 place-items-center rounded-full transition ${value === v ? 'bg-brand text-white shadow' : 'text-slate-500 hover:text-brand'}`}>{icon}</button>
  );
  return (
    <div className="flex rounded-full border border-[#d6d9d2] bg-white p-1 dark:border-slate-600 dark:bg-slate-800">
      {btn('grid', x('grid'), <Svg><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Svg>)}
      {btn('list', x('list'), <Svg><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>)}
    </div>
  );
}

function Footer({ cats, x }) {
  const col = 'grid content-start gap-2.5 text-sm text-slate-500 dark:text-slate-400';
  const a = 'transition hover:text-brand';
  return (
    <footer className="mt-20 border-t border-[#e5e4dc] pt-12 dark:border-slate-700">
      <div className="grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#0e6f7e]" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6f7e] text-lg text-white">✚</span>Gugudo
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">{x('tag')}</p>
        </div>
        <div><h3 className="mb-3 text-lg">{x('shop')}</h3>
          <div className={col}>
            <Link className={a} to="/catalog">{x('all')}</Link>
            {cats.slice(0, 4).map((c) => <Link key={c.id} className={a} to={`/catalog?category=${c.id}`}>{c.name}</Link>)}
          </div>
        </div>
        <div><h3 className="mb-3 text-lg">{x('help')}</h3>
          <div className={col}>
            <Link className={a} to="/contact">{x('contact')}</Link>
            <Link className={a} to="/about">{x('about')}</Link>
            <Link className={a} to="/support">{x('support')}</Link>
          </div>
        </div>
        <div><h3 className="mb-3 text-lg">Gugudo</h3>
          <div className={col}>
            <Link className={a} to="/orders">{x('orders')}</Link>
            <Link className={a} to="/wishlist">{x('wish')}</Link>
            <Link className={a} to="/cart">Cart</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-[#e5e4dc] py-6 text-center text-xs text-slate-500 dark:border-slate-700">© {new Date().getFullYear()} Gugudo. {x('rights')}</div>
    </footer>
  );
}

export default function Catalog() {
  const { lang } = useApp();
  const x = (k) => L[lang]?.[k] ?? L.en[k];
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

  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };
  const sorted = [...(products || [])].sort((a, b) => {
    if (sort === 'price-low') return Number(a.price) - Number(b.price);
    if (sort === 'price-high') return Number(b.price) - Number(a.price);
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'top-rated') return getRating(b) - getRating(a);
    return Number(b.id) - Number(a.id);
  });
  const filtered = q || category;
  const chip = (on) => `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${on ? 'border-brand bg-brand text-white shadow-md' : 'border-[#d6d9d2] bg-white text-slate-700 hover:border-brand hover:text-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`;

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-6 py-10 dark:bg-slate-800 md:px-12 md:py-14">
        <span className="blob -right-10 -top-12 h-56 w-56 bg-[#0e6f7e]/30" />
        <span className="blob -bottom-16 left-1/3 h-48 w-48 bg-[#7fd6c2]/40" style={{ animationDelay: '-6s' }} />
        <div className="medicine-art absolute right-8 top-8 hidden h-44 w-64 md:block" aria-hidden>
          <span className="medicine-pill medicine-pill--coral left-5 top-20 rotate-[-24deg]" />
          <span className="medicine-pill medicine-pill--gold left-28 top-8 rotate-[32deg]" />
          <span className="medicine-bottle right-2 top-16 rotate-[12deg]"><i /></span>
          <span className="medicine-cross right-28 top-4">+</span>
        </div>
        <div className="relative">
          <nav aria-label="Breadcrumb" className="text-xs font-bold text-brand"><Link to="/" className="hover:underline">{x('home')}</Link> <span aria-hidden>/</span> {x('title')}</nav>
          <h1 className="mt-3 text-4xl text-[#173f3b] dark:text-white md:text-6xl">{x('title')}</h1>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">{x('sub')}</p>
          <div className="relative mt-6 max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Svg><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg></span>
            <input className="input !rounded-full !py-3.5 !pl-11 !pr-11 shadow-lg" placeholder={x('search')} value={q} onChange={(e) => set('q', e.target.value)} aria-label={x('search')} />
            {q && <button type="button" onClick={() => set('q', '')} aria-label={x('clear')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">✕</button>}
          </div>
        </div>
      </section>

      {/* Visual category guide */}
      {cats.length > 0 && (
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-brand">Find your care</p>
              <h2 className="mt-1 text-3xl text-[#173f3b] dark:text-white md:text-4xl">Explore by category</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-slate-500 md:block">From daily vitamins to first aid, discover trusted essentials in one place.</p>
          </div>
          <div className="no-scrollbar grid auto-cols-[15rem] grid-flow-col gap-4 overflow-x-auto pb-3 md:grid-flow-row md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
            {cats.map((c) => {
              const visual = getCategoryVisual(c.name);
              const count = !q && !category && products ? products.filter((p) => String(p.categoryId ?? p.category?.id) === String(c.id)).length : null;
              const active = String(c.id) === category;
              return (
                <Link key={c.id} to={`/catalog?category=${c.id}`} className={`category-feature group relative h-52 overflow-hidden rounded-2xl ${active ? 'ring-2 ring-brand ring-offset-2' : ''}`}>
                  <img src={visual.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102f2c]/95 via-[#102f2c]/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-lg backdrop-blur">{visual.icon}</span>
                    <h3 className="text-2xl">{c.name}</h3>
                    <p className="mt-1 text-xs text-white/75">{visual.description}</p>
                    <p className="mt-3 text-xs font-bold text-[#b9f0dc]">{count === null ? 'Browse collection' : `${count} ${count === 1 ? 'medicine' : 'medicines'}`} <span className="ml-1 transition group-hover:ml-2">→</span></p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sticky bar: categories, sort and view stay visible while you scroll to the end */}
      <div className="sticky top-[4.25rem] z-20 my-6 rounded-2xl border border-[#e5e4dc] bg-white/90 p-3 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center gap-3">
          <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5" role="group" aria-label="Categories">
            <button type="button" aria-pressed={!category} onClick={() => set('category', '')} className={chip(!category)}>{x('all')}</button>
            {cats.map((c) => <button type="button" key={c.id} aria-pressed={String(c.id) === category} onClick={() => set('category', String(c.id))} className={chip(String(c.id) === category)}>{c.name}</button>)}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CategoryMenu value={category} onChange={(v) => set('category', v)} cats={cats} x={x} />
            <SortMenu value={sort} onChange={(v) => set('sort', v === 'newest' ? '' : v)} x={x} />
            <ViewToggle value={view} onChange={(v) => set('view', v === 'grid' ? '' : v)} x={x} />
          </div>
        </div>
      </div>

      {/* Result line */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p aria-live="polite">{products ? <><b className="text-slate-800 dark:text-slate-100">{sorted.length}</b> {x('count')}{q && <> · {x('forq')} “{q}”</>}</> : '…'}</p>
        {filtered && <button type="button" onClick={() => setSp({}, { replace: true })} className="font-bold text-brand hover:underline">{x('clear')}</button>}
      </div>

      {/* Products */}
      {products === null ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-slate-500">{x('none')}</p><button type="button" onClick={() => setSp({}, { replace: true })} className="btn mt-4">{x('clear')}</button></div>
      ) : (
        <div className={view === 'list' ? 'grid gap-4' : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'}>
          {sorted.map((p) => <ProductCard key={p.id} p={p} view={view} />)}
        </div>
      )}

      <Footer cats={cats} x={x} />
    </div>
  );
}