import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';
import { Badge, fmtDate, money } from '../components/ui';

const icons = {
  orders: 'M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6l2-4zM4 6h16M9 10a3 3 0 0 0 6 0',
  clock: 'M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  cash: 'M3 7h18v10H3zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.5l8.7-5M12 22V12.5',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
};

const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={icons[name]} />
  </svg>
);

const tones = {
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

const Stat = ({ label, value, hint, icon, tone = 'teal', warn }) => (
  <div className="card p-4">
    <div className="flex items-start justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[warn ? 'red' : tone]}`}>
        <Icon name={icon} />
      </span>
    </div>
    <p className={`mt-2 text-3xl font-extrabold tracking-tight ${warn ? 'text-red-600' : ''}`}>{value}</p>
    {hint && <p className="mt-2 border-t pt-2 text-xs text-slate-500 dark:border-slate-700">{hint}</p>}
  </div>
);

export default function Dashboard() {
  const { t } = useApp();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    return api('/admin/stats').then(setS).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!s) return null;

  const days = Object.entries(s.byDay).sort();
  const max = Math.max(1, ...days.map((d) => d[1]));
  const total = days.reduce((sum, d) => sum + d[1], 0);
  const mean = days.length ? total / days.length : 0;
  const peak = days.reduce((p, d) => (d[1] > (p?.[1] ?? -1) ? d : p), null);
  const stockIssues = s.lowStock + s.outOfStock;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-extrabold">{t('dashboard')}</h1>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Orders, sales and stock levels for your pharmacy at a glance.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total orders" value={s.orders} icon="orders" />
        <Stat label="Pending orders" value={s.pending} icon="clock" tone="amber" warn={s.pending > 0}
          hint={s.pending > 0 ? 'Needs your review' : 'All caught up'} />
        <Stat label="Revenue collected" value={money(s.revenue)} icon="cash" />
        <Stat label={t('customers')} value={s.customers} icon="users" tone="blue" />
        <Stat label="Low stock items" value={s.lowStock} icon="alert" warn={s.lowStock > 0}
          hint={s.lowStock > 0 ? 'Restock soon' : 'Stock levels healthy'} />
        <Stat label="Out of stock" value={s.outOfStock} icon="box" warn={s.outOfStock > 0}
          hint={s.outOfStock > 0 ? 'Unavailable to customers' : 'Nothing missing'} />
      </div>

      {/* Chart + stock panel */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-bold">Sales, last 7 days</h2>
              <p className="text-xs text-slate-500">Daily revenue from completed orders</p>
            </div>
            {days.length > 0 && (
              <p className="text-xs text-slate-500">
                Daily average: <b className="text-slate-800 dark:text-slate-100">{money(mean)}</b>
              </p>
            )}
          </div>

          {days.length === 0 ? (
            <div className="mt-6 grid h-48 place-items-center rounded-lg border border-dashed text-center text-sm text-slate-500 dark:border-slate-700">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">No sales yet</p>
                <p>Revenue will appear here once your first order is paid.</p>
              </div>
            </div>
          ) : (
            <div className="relative mt-6 h-52">
              {[0, 25, 50, 75, 100].map((g) => (
                <div key={g} className="absolute inset-x-0 border-t border-dashed border-slate-200 dark:border-slate-700"
                  style={{ bottom: `calc(${g}% * 0.85 + 1.25rem)` }} />
              ))}
              <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-3">
                {days.map(([d, v]) => {
                  const isPeak = peak && d === peak[0];
                  return (
                    <div key={d} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d}: ${money(v)}`}>
                      <span className={`text-[10px] ${isPeak ? 'font-bold text-brand' : 'text-slate-500'}`}>{Math.round(v)}</span>
                      <div
                        className={`w-full rounded-t transition-opacity ${isPeak ? 'bg-brand' : 'bg-brand/50 group-hover:bg-brand/80'}`}
                        style={{ height: `${(v / max) * 85}%`, minHeight: 4 }}
                      />
                      <span className="text-[10px] text-slate-500">{d.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {peak && (
            <p className="mt-3 text-xs text-slate-500">
              Best day: <b className="text-slate-800 dark:text-slate-100">{peak[0].slice(5)}</b> with {money(peak[1])}
            </p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Stock health</h2>
          <p className="text-xs text-slate-500">Items that need attention</p>
          <ul className="mt-4 space-y-4">
            {[
              { label: 'Low stock', n: s.lowStock, bar: 'bg-amber-500' },
              { label: 'Out of stock', n: s.outOfStock, bar: 'bg-red-500' },
            ].map((r) => (
              <li key={r.label}>
                <div className="flex justify-between text-sm">
                  <span>{r.label}</span><b>{r.n}</b>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className={`h-2 rounded-full ${r.bar}`} style={{ width: `${stockIssues ? (r.n / stockIssues) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className={`mt-5 rounded-lg p-3 text-sm ${stockIssues ? tones.red : tones.teal}`}>
            {stockIssues
              ? `${stockIssues} product${stockIssues > 1 ? 's' : ''} need restocking.`
              : 'All products are well stocked.'}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card mt-6 overflow-x-auto">
        <h2 className="p-5 pb-3 font-bold">Recent orders</h2>
        {s.recent.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-slate-500">No orders yet. New orders will show up here.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="td font-medium">Order</th>
                <th className="td font-medium">Customer</th>
                <th className="td font-medium">Total</th>
                <th className="td font-medium">Status</th>
                <th className="td font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {s.recent.map((o) => (
                <tr key={o.id} className="border-t dark:border-slate-700">
                  <td className="td font-semibold">{o.code}</td>
                  <td className="td">{o.customer.name}</td>
                  <td className="td">{money(o.total)}</td>
                  <td className="td"><Badge v={o.status} /></td>
                  <td className="td text-xs text-slate-500">{fmtDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}