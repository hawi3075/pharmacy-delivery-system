import { Link } from 'react-router-dom';
import { PageTitle } from '../components/ui';

export default function AdminReviews() {
  return (
    <div>
      <PageTitle>Reviews</PageTitle>
      <div className="card p-8">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#fff4d6] text-4xl text-amber-500">★</div>
          <div>
            <h2 className="text-2xl">Customer reviews are coming next</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">The current database does not yet store customer review records. Product ratings shown across the storefront are prepared for this future review system, so no customer feedback is lost or incorrectly displayed here.</p>
            <Link to="/admin/products" className="mt-5 inline-flex btn">Manage medicines →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
