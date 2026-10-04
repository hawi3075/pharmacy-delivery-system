import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import ProductCard, { ProductImg, Stars, getRating } from '../components/ProductCard';
import { useWishlist } from './Wishlist';
import { money } from '../components/ui';

const FEE = 50, FREE_OVER = 1000; // same rules as checkout

const L = {
  en: {
    home: 'Home', meds: 'Medicines', pharmacy: 'Pharmacy essential', rxOnly: 'Rx only mandatory', cold: 'Cold-chain monitored', inStock: 'In stock', outStock: 'Out of stock',
    formula: 'Active formula', reviewsWord: 'verified patient reviews', qaWord: 'pharmacist Q&As answered', savings: 'savings', pack: 'Pack',
    rxTitle: 'Doctor prescription required', rxText: 'Upload your prescription (photo or PDF) at checkout. Our pharmacist verifies it before dispatch.',
    qty: 'Quantity', addCart: 'Add to cart', buyNow: 'Express checkout (Buy now)', save: 'Save to wishlist', saved: 'Saved to wishlist',
    delivery: 'Cash on delivery', deliveryText: `Delivery ETB ${FEE}, free on orders over ETB ${FREE_OVER.toLocaleString()}.`, address: 'Manage addresses',
    verify: 'Authenticity & regulatory verification', batch: 'Batch code', expiry: 'Expiry date', mfr: 'Licensed manufacturer', reg: 'Registration no.', monthsLeft: 'mos left', front: 'Front view',
    tClinical: 'Clinical description', tDosage: 'Dosage & directions', tSafety: 'Side effects & warnings', tReviews: 'Patient reviews', tInter: 'Drug interactions',
    usage: 'Indications & usage', mech: 'Mechanism of action', contra: 'Contraindications', facts: 'Fast clinical facts', generic: 'Generic name', category: 'Category', rx: 'Prescription', required: 'Required', notRequired: 'Not required', stock: 'Stock',
    related: 'Recommended complementary care', ask: 'Ask a pharmacist',
    defUsage: 'Follow the product label and ask a pharmacist if you need guidance.',
    defDosage: 'Dosage depends on your prescription or the product label. Never take more than directed, and ask our pharmacists if you are unsure.',
    defSafety: 'Read the leaflet inside the pack. Stop use and get medical help if you notice an allergic reaction or unusual symptoms.',
    defInter: 'Tell your pharmacist about every medicine you take before combining products.',
    defReviews: 'Reviews will appear here as customers share their experience.',
  },
  om: {
    home: 'Mana', meds: 'Qorichoota', rxOnly: 'Ajaja qofa', cold: 'Cold-chain', inStock: 'Ni jira', outStock: 'Dhume',
    rxTitle: 'Ajaja doktoraa barbaachisa', qty: 'Baay’ina', addCart: 'Gaarii keessa naqi', buyNow: 'Amma bitadhu', save: 'Fedhii koo keessa olkaa’i', saved: 'Olkaa’ameera',
    delivery: 'Yeroo ga’u kaffali', address: 'Teessoo bulchi', verify: 'Mirkaneessa qorichaa', batch: 'Lakkoofsa baachii', expiry: 'Guyyaa xumuraa', mfr: 'Oomishaa', monthsLeft: 'ji’a hafe',
    tClinical: 'Ibsa kilinikaa', tDosage: 'Dozii fi qajeelfama', tSafety: 'Miidhaa fi akeekkachiisa', tReviews: 'Yaada namootaa', tInter: 'Walitti dhufeenya qorichaa',
    usage: 'Fayyadama', mech: 'Haala hojii', contra: 'Akka hin fayyadamne', facts: 'Odeeffannoo gabaabaa', generic: 'Maqaa waliigalaa', category: 'Gosa', rx: 'Ajaja', required: 'Barbaachisa', notRequired: 'Hin barbaachisu', stock: 'Kuusaa',
    related: 'Kunis si barbaachisu ta’a', ask: 'Faarmaasistii gaafadhu',
  },
  am: {
    home: 'መነሻ', meds: 'መድኃኒቶች', rxOnly: 'በሐኪም ትዕዛዝ ብቻ', cold: 'ቀዝቃዛ ሰንሰለት', inStock: 'አለ', outStock: 'አልቋል',
    rxTitle: 'የሐኪም ማዘዣ ያስፈልጋል', qty: 'ብዛት', addCart: 'ወደ ጋሪ ጨምር', buyNow: 'አሁን ግዛ', save: 'ወደ ተወዳጆች አስቀምጥ', saved: 'ተቀምጧል',
    delivery: 'ሲደርስ ክፍያ', address: 'አድራሻዎችን አስተዳድር', verify: 'ትክክለኛነት ማረጋገጫ', batch: 'የባች ቁጥር', expiry: 'የማብቂያ ቀን', mfr: 'አምራች', monthsLeft: 'ወራት ቀሩ',
    tClinical: 'ክሊኒካዊ መግለጫ', tDosage: 'መጠን እና አጠቃቀም', tSafety: 'የጎንዮሽ ጉዳት እና ማስጠንቀቂያ', tReviews: 'የታካሚ ግምገማ', tInter: 'የመድኃኒት መስተጋብር',
    usage: 'አጠቃቀም', mech: 'የአሠራር ዘዴ', contra: 'መጠቀም የማይገባ', facts: 'ፈጣን ክሊኒካዊ መረጃ', generic: 'አጠቃላይ ስም', category: 'ምድብ', rx: 'ማዘዣ', required: 'ያስፈልጋል', notRequired: 'አያስፈልግም', stock: 'ክምችት',
    related: 'ሊያስፈልግዎ ይችላል', ask: 'ፋርማሲስት ይጠይቁ',
  },
};

const monthsLeft = (d) => (d ? Math.floor((new Date(d) - new Date()) / (30.44 * 864e5)) : null);

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t, lang, user, addToCart } = useApp();
  const x = (k) => L[lang]?.[k] ?? L.en[k];
  const { has, toggle } = useWishlist();

  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('clinical');
  const [active, setActive] = useState(0);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setP(null); setErr(''); setQty(1); setTab('clinical'); setActive(0);
    api('/products/' + id).then(setP).catch((e) => setErr(e.message));
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    if (!p) return;
    api('/products' + (p.categoryId ? `?category=${p.categoryId}` : ''))
      .then((list) => setRelated(list.filter((i) => i.id !== p.id).slice(0, 4)))
      .catch(() => {});
  }, [p?.id]);

  if (err) return <p className="p-10 text-center">{err}</p>;
  if (!p) return <div className="grid gap-6 md:grid-cols-2"><div className="card h-96 animate-pulse" /><div className="card h-96 animate-pulse" /></div>;

  // Extra clinical content lives in p.details (JSON). Plain product fields still work as fallback.
  const d = p.details || {};
  const out = p.stock === 0;
  const low = !out && p.stock <= (p.lowStockAt ?? 10);
  const saved = has(p.id);
  const gallery = d.gallery?.length
    ? d.gallery
    : [p.imageUrl, p.frontImageUrl, p.backImageUrl].filter(Boolean).map((url, i) => ({ url, label: i === 0 ? x('front') : '' }));
  const thumbs = gallery.length ? gallery : [{ url: null, label: x('front') }];
  const mainImg = { ...p, imageUrl: thumbs[active]?.url ?? p.imageUrl };
  const left = monthsLeft(p.expiry);
  const save = d.mrp && d.mrp > p.price ? Math.round((1 - p.price / d.mrp) * 100) : 0;
  const hasVerify = p.batchNo || p.expiry || p.manufacturer || d.regNo || d.storage;
  const buyNow = () => { addToCart(p, qty); nav(user ? '/checkout' : '/login?next=/checkout'); };
  const tabs = [['clinical', x('tClinical'), '📄'], ['dosage', x('tDosage'), '💊'], ['safety', x('tSafety'), '⚠️'], ['reviews', x('tReviews'), '★'], ['inter', x('tInter'), '🔁']];

  const Row = ({ k, v }) => <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{k}</p><p className="mt-0.5 text-sm font-semibold">{v}</p></div>;
  const H = ({ children }) => <h3 className="text-2xl text-[#173f3b] dark:text-white">{children}</h3>;
  const para = 'mt-2 leading-7 text-slate-600 dark:text-slate-300';
  const facts = d.facts || [];

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 text-xs font-bold text-slate-500">
        <Link to="/" className="hover:text-brand">{x('home')}</Link> / <Link to="/catalog" className="hover:text-brand">{x('meds')}</Link>
        {p.category && <> / <Link to={`/catalog?category=${p.categoryId}`} className="hover:text-brand">{p.category.name}</Link></>} / <span className="text-brand">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* Left: gallery + verification */}
        <div className="space-y-4">
          <div className="card relative overflow-hidden p-4 md:p-6">
            <div className="absolute left-6 top-6 z-10 flex flex-col items-start gap-2">
              {p.requiresRx && <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">{x('rxOnly')}</span>}
              {d.coldChain && <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 shadow">❄ {x('cold')}</span>}
              <span className={`rounded-full px-3 py-1 text-xs font-bold shadow ${out ? 'bg-slate-700 text-white' : low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{out ? x('outStock') : low ? `${p.stock} left` : x('inStock')}</span>
            </div>
            <ProductImg p={mainImg} className="h-[22rem] md:h-[28rem]" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {thumbs.map((g, i) => (
              <button type="button" key={(g.url || 'none') + i} onClick={() => setActive(i)} aria-pressed={i === active}
                className={`card overflow-hidden p-1.5 text-center transition ${i === active ? '!border-brand ring-2 ring-brand/30' : 'hover:border-brand'}`}>
                <ProductImg p={{ ...p, imageUrl: g.url }} className="h-16" />
                {g.label && <span className="mt-1 block text-[11px] font-semibold text-slate-500">{g.label}</span>}
              </button>
            ))}
          </div>

          {hasVerify && (
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#0e6f7e]"><span aria-hidden>🛡</span>{x('verify')}</h2>
                {d.compliance && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{d.compliance}</span>}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {p.batchNo && <Row k={x('batch')} v={p.batchNo} />}
                {p.expiry && <Row k={x('expiry')} v={<>{new Date(p.expiry).toLocaleDateString(undefined, { month: '2-digit', year: 'numeric' })}{left !== null && left >= 0 && <span className="ml-1 text-xs font-medium text-slate-500">({left} {x('monthsLeft')})</span>}</>} />}
                {d.regNo && <Row k={x('reg')} v={d.regNo} />}
                {p.manufacturer && <Row k={x('mfr')} v={p.manufacturer} />}
              </div>
              {d.storage && <p className="mt-4 rounded-xl bg-brand-light p-3 text-xs leading-5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">🌡 {d.storage}</p>}
            </div>
          )}
        </div>

        {/* Right: purchase card */}
        <div className="card h-fit p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{p.category?.name || x('pharmacy')}</p>
          <h1 className="mt-2 text-4xl leading-tight text-[#173f3b] dark:text-white md:text-5xl">{p.name}</h1>
          {p.generic && <p className="mt-2 text-sm text-slate-500">{x('formula')}: <span className="font-semibold italic">{p.generic}</span></p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#e5e4dc] pb-4 text-sm dark:border-slate-700">
            <Stars value={getRating(p)} size="text-base" />
            {d.reviewCount > 0 && <span className="text-brand">({d.reviewCount} {x('reviewsWord')})</span>}
            {d.qaCount > 0 && <span className="text-slate-500">{d.qaCount} {x('qaWord')}</span>}
          </div>

          <div className="mt-5 rounded-2xl bg-brand-light p-5 dark:bg-slate-700">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-4xl font-extrabold text-brand">{money(p.price)}</p>
              {save > 0 && <><s className="text-sm text-slate-400">{money(d.mrp)}</s><span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">{save}% {x('savings')}</span></>}
            </div>
            {d.packSize && <p className="mt-1 text-xs font-semibold text-slate-500">{x('pack')}: {d.packSize}</p>}
          </div>

          {p.requiresRx && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-brand/20 bg-brand-light/60 p-4 dark:border-slate-600 dark:bg-slate-700">
              <span aria-hidden className="text-xl">📄</span>
              <div><p className="font-bold text-[#173f3b] dark:text-white">{x('rxTitle')}</p><p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{x('rxText')}</p></div>
            </div>
          )}

          <div className="mt-6 flex items-stretch gap-3">
            <div className="flex items-center rounded-xl border border-[#d6d9d2] bg-white dark:border-slate-600 dark:bg-slate-900" role="group" aria-label={x('qty')}>
              <button type="button" className="h-12 w-11 text-xl font-bold hover:text-brand disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="−">−</button>
              <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
              <button type="button" className="h-12 w-11 text-xl font-bold hover:text-brand disabled:opacity-40" disabled={qty >= p.stock} onClick={() => setQty(qty + 1)} aria-label="+">+</button>
            </div>
            <button className="btn flex-1 !rounded-xl !text-base" disabled={out} onClick={() => addToCart(p, qty)}>🛒 {out ? t('outOfStock') : x('addCart')}</button>
            <button type="button" onClick={() => toggle(p.id)} aria-pressed={saved} aria-label={saved ? x('saved') : x('save')} title={saved ? x('saved') : x('save')}
              className={`grid w-12 place-items-center rounded-xl border text-xl transition hover:scale-105 ${saved ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-[#d6d9d2] bg-white text-slate-400 hover:text-rose-500 dark:border-slate-600 dark:bg-slate-900'}`}>{saved ? '♥' : '♡'}</button>
          </div>
          <button type="button" disabled={out} onClick={buyNow} className="btn-ghost mt-3 w-full !rounded-xl !border-2 !border-brand !py-3 !text-base !text-brand hover:!bg-brand-light disabled:opacity-50">⚡ {x('buyNow')}</button>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#e5e4dc] p-3 text-sm dark:border-slate-700">
            <div className="flex items-center gap-3"><span aria-hidden className="text-xl">🚚</span><div><p className="font-bold">{x('delivery')}</p><p className="text-xs text-slate-500">{x('deliveryText')}</p></div></div>
            {user && <Link to="/addresses" className="shrink-0 text-xs font-bold text-brand hover:underline">{x('address')}</Link>}
          </div>
        </div>
      </div>

      {/* Tabs + Fast clinical facts */}
      <section className="card mt-8 overflow-hidden">
        <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-[#e5e4dc] px-4 dark:border-slate-700">
          {tabs.map(([k, label, icon]) => (
            <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold transition ${tab === k ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-brand'}`}><span aria-hidden className="mr-1.5">{icon}</span>{label}</button>
          ))}
        </div>
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_22rem]">
          <div role="tabpanel">
            {tab === 'clinical' && (<>
              <H>{x('usage')}</H>
              <p className={para}>{d.indication || p.indication || p.usage || p.description || x('defUsage')}</p>
              {(d.mechanism || p.mechanismOfAction) && <><h3 className="mt-6 text-xl text-[#173f3b] dark:text-white">{x('mech')}</h3><p className={para}>{d.mechanism || p.mechanismOfAction}</p></>}
              {d.contraindications && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950"><p className="font-bold text-rose-700 dark:text-rose-300">⚠ {x('contra')}</p><p className="mt-1 text-sm leading-6 text-rose-700/90 dark:text-rose-300/90">{d.contraindications}</p></div>}
            </>)}
            {tab === 'dosage' && (<><H>{x('tDosage')}</H><p className={para}>{d.dosage || p.dosage || x('defDosage')}</p></>)}
            {tab === 'safety' && (<>
              <H>{x('tSafety')}</H>
              {(d.sideEffects || p.sideEffects) ? <p className={para}>{d.sideEffects || p.sideEffects}</p> : null}
              {(d.warnings || p.warnings) && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">{d.warnings || p.warnings}</p>}
              {!(d.sideEffects || p.sideEffects || d.warnings || p.warnings) && <p className={para}>{x('defSafety')}</p>}
            </>)}
            {tab === 'reviews' && (<><H>{x('tReviews')}</H><div className="mt-3"><Stars value={getRating(p)} /></div><p className={para}>{x('defReviews')}</p></>)}
            {tab === 'inter' && (<><H>{x('tInter')}</H><p className={para}>{d.interactions || p.interactions || x('defInter')}</p></>)}
            <Link to="/support" className="btn-ghost mt-6">{x('ask')}</Link>
          </div>

          <aside className="h-fit rounded-2xl border border-brand/20 bg-brand-light p-5 dark:border-slate-600 dark:bg-slate-700">
            <h3 className="mb-4 text-xl text-[#0e6f7e] dark:text-white">❄ {x('facts')}</h3>
            <ul className="grid gap-3 text-sm">
              {facts.map(([k, v]) => <li key={k} className="flex gap-2"><span aria-hidden className="mt-1 text-emerald-600">●</span><span><b>{k}:</b> {v}</span></li>)}
              <li className="flex gap-2"><span aria-hidden className="mt-1 text-emerald-600">●</span><span><b>{x('rx')}:</b> {p.requiresRx ? x('required') : x('notRequired')}</span></li>
              {p.generic && <li className="flex gap-2"><span aria-hidden className="mt-1 text-emerald-600">●</span><span><b>{x('generic')}:</b> {p.generic}</span></li>}
              <li className="flex gap-2"><span aria-hidden className="mt-1 text-emerald-600">●</span><span><b>{x('stock')}:</b> {out ? x('outStock') : p.stock}</span></li>
            </ul>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-3xl text-[#173f3b] dark:text-white">{x('related')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}