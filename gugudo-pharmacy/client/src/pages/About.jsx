import { Link } from 'react-router-dom';

const storyImage = 'https://images.unsplash.com/photo-1580281658628-09d7b5c4e0d7?auto=format&fit=crop&w=1200&q=85';
const careImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=85';

export default function About() {
  return (
    <div className="space-y-14 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 md:px-14 md:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand">A better way to care</p>
          <h1 className="mt-4 text-5xl leading-[1.05] text-[#173f3b] md:text-7xl">Good medicine should feel personal.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#52625b]">Gugudo brings the care of a neighborhood pharmacy to a simple online experience, with trusted products, thoughtful guidance, and delivery you can follow.</p>
          <Link to="/catalog" className="btn mt-8">Explore medicines →</Link>
        </div>
        <img src={storyImage} alt="Pharmacist preparing medicines" className="mt-10 h-72 w-full rounded-2xl object-cover shadow-xl md:absolute md:right-10 md:top-10 md:mt-0 md:h-[28rem] md:w-[40%]" />
      </section>

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">Why we started</p><h2 className="mt-2 text-4xl">Health shopping can be simpler.</h2><p className="mt-5 leading-8 text-slate-600">Finding everyday care should not mean sorting through confusing choices or wondering what happens after you place an order. We created Gugudo to make trusted pharmacy care feel clear, calm, and close to home.</p><p className="mt-4 leading-8 text-slate-600">Every part of the experience—from product discovery to delivery updates—is designed to help you feel more confident about your next step.</p></div>
        <div className="relative"><img src={careImage} alt="Healthcare professional speaking with a patient" className="h-80 w-full rounded-[1.5rem] object-cover shadow-lg" /><div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800"><p className="text-3xl font-black text-brand">12k+</p><p className="text-xs font-bold text-slate-500">customers cared for</p></div></div>
      </section>

      <section><div className="mb-7 max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">Our promise</p><h2 className="mt-2 text-4xl">The Gugudo difference</h2></div><div className="grid gap-5 md:grid-cols-3">{[['01', 'Trust first', 'Every order is handled with care, and prescription products are treated responsibly.'], ['02', 'Human always', 'Our pharmacists and support team are close when you need a second opinion.'], ['03', 'Simple by design', 'Clear choices, transparent updates, and a calmer way to manage everyday health.']].map(([number, title, text]) => <div className="card p-6" key={number}><p className="text-4xl text-brand/60">{number}</p><h3 className="mt-4 text-2xl">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{text}</p></div>)}</div></section>

      <section className="rounded-[2rem] bg-[#173f3b] px-7 py-10 text-white md:px-14 md:py-14"><div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b9f0dc]">How we show up</p><h2 className="mt-3 text-4xl">Care that continues after checkout.</h2></div><div className="grid gap-4 sm:grid-cols-2">{[['✓', 'Quality checked', 'Reliable products from trusted sources.'], ['◷', 'Delivered thoughtfully', 'Careful delivery with clear updates.'], ['✚', 'Pharmacist minded', 'Guidance that puts safety first.'], ['♡', 'Built for you', 'A warm, easy experience every day.']].map(([icon, title, text]) => <div className="rounded-2xl bg-white/10 p-4" key={title}><span className="text-xl text-[#b9f0dc]">{icon}</span><h3 className="mt-3 text-xl">{title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{text}</p></div>)}</div></div></section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#d6d9d2] p-7"><div><h2 className="text-3xl">Ready to find your essentials?</h2><p className="mt-2 text-sm text-slate-500">Browse trusted care with a little more peace of mind.</p></div><Link to="/catalog" className="btn">Start shopping →</Link></section>
    </div>
  );
}
