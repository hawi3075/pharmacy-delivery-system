import { Link } from 'react-router-dom';

const storyImage = '/image4.jpeg';
const careImage = '/image2.png';

export default function About() {
  return (
    <div className="space-y-14 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#e6f6f8] px-7 py-12 md:px-14 md:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand">About Gugudo Pharma</p>
          <h1 className="mt-4 text-5xl leading-[1.05] text-[#173f3b] md:text-7xl">Empowering healthcare across Southern Ethiopia.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#52625b]">Founded in Hawassa, Gugudo Pharma is building a trusted, reliable, and innovative pharmaceutical and medical equipment supply partner for hospitals, clinics, pharmacies, and NGOs.</p>
          <Link to="/contact" className="btn mt-8">Partner with us →</Link>
        </div>
        <img src={storyImage} alt="Gugudo Pharma warehouse stocked with medical supplies" className="mt-10 h-72 w-full rounded-2xl object-cover shadow-xl md:absolute md:right-10 md:top-10 md:mt-0 md:h-[28rem] md:w-[40%]" />
      </section>

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">Our story</p><h2 className="mt-2 text-4xl">Bridging the healthcare supply gap.</h2><p className="mt-5 leading-8 text-slate-600">Gugudo was established in Hawassa with a clear purpose: make safe, high-quality, and affordable pharmaceuticals and medical devices more accessible to healthcare providers across the region.</p><p className="mt-4 leading-8 text-slate-600">We combine dependable sourcing, responsible storage, responsive service, and digital convenience to help institutions plan, procure, and replenish with confidence.</p></div>
        <div className="relative"><img src={careImage} alt="Medical monitoring equipment ready for patient care" loading="lazy" className="h-80 w-full rounded-[1.5rem] object-cover shadow-lg" /><div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800"><p className="text-3xl font-black text-brand">12k+</p><p className="text-xs font-bold text-slate-500">customers cared for</p></div></div>
      </section>

      <section><div className="mb-7 max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">Our direction</p><h2 className="mt-2 text-4xl">Vision, mission, and values</h2></div><div className="grid gap-5 md:grid-cols-3">{[['01', 'Our vision', 'To be the most trusted, reliable, and innovative partner in pharmaceutical and medical equipment supply across Southern Ethiopia.'], ['02', 'Our mission', 'To bridge the healthcare supply gap with safe, high-quality, and affordable products delivered with integrity and operational excellence.'], ['03', 'Our values', 'Quality and safety, reliability, integrity, and partnership guide every relationship and every delivery.']].map(([number, title, text]) => <div className="card p-6" key={number}><p className="text-4xl text-brand/60">{number}</p><h3 className="mt-4 text-2xl">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{text}</p></div>)}</div></section>

      <section className="rounded-[2rem] bg-[#173f3b] px-7 py-10 text-white md:px-14 md:py-14"><div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b9f0dc]">Why choose us</p><h2 className="mt-3 text-4xl">A dependable partner for better care.</h2></div><div className="grid gap-4 sm:grid-cols-2">{[['✓', 'Quality & safety', 'Products handled with uncompromising care and attention to standards.'], ['◷', 'Reliable supply', 'Responsive delivery and replenishment support for institutions.'], ['✚', 'Compliance minded', 'Storage and distribution practices aligned with EFDA expectations.'], ['♡', 'Built on partnership', 'Long-term relationships with hospitals, clinics, pharmacies, and NGOs.']].map(([icon, title, text]) => <div className="rounded-2xl bg-white/10 p-4" key={title}><span className="text-xl text-[#b9f0dc]">{icon}</span><h3 className="mt-3 text-xl">{title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{text}</p></div>)}</div></div></section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#d6d9d2] p-7"><div><h2 className="text-3xl">Ready to strengthen your supply?</h2><p className="mt-2 text-sm text-slate-500">Talk to Gugudo about wholesale orders, tenders, and scheduled replenishment.</p></div><Link to="/contact" className="btn">Start a conversation →</Link></section>
    </div>
  );
}
