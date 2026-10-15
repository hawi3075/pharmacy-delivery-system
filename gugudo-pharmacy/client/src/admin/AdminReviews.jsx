import { useEffect, useState } from 'react';
import { api } from '../api';
import { PageTitle } from '../components/ui';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const load = () => api('/admin/reviews').then(setReviews).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  async function remove(review) {
    if (!confirm(`Delete this review from ${review.customer.name}?`)) return;
    try { await api(`/admin/reviews/${review.id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); }
  }
  return (
    <div>
      <PageTitle>Reviews</PageTitle>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!reviews.length ? <div className="card p-8 text-sm text-slate-500">No customer reviews yet.</div> : <div className="grid gap-3">{reviews.map((r) => <article className="card p-5" key={r.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg">{r.product.name}</h2><p className="text-xs text-slate-500">{r.customer.name} · {r.customer.email}</p></div><button className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => remove(r)}>Delete</button></div><p className="mt-3 text-amber-500">{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></p><p className="mt-2 text-sm leading-6">{r.body}</p></article>)}</div>}
    </div>
  );
}
