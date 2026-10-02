import { useApp } from '../store';

export const money = (n) => 'ETB ' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const COLORS = {
  PENDING: 'bg-brand-light text-brand-dark', CONFIRMED: 'bg-sky-100 text-sky-800', PACKED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800', DELIVERED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-700',
  PAID: 'bg-emerald-100 text-emerald-800', UNPAID: 'bg-brand-light text-brand-dark', REFUNDED: 'bg-slate-200 text-slate-700',
};
export function Badge({ v, label }) {
  const { t } = useApp();
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[v] || 'bg-slate-100 text-slate-700'}`}>{label ?? t('status_' + v) ?? v}</span>;
}

export const STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export function Timeline({ status }) {
  const { t } = useApp();
  if (status === 'CANCELLED') return <Badge v="CANCELLED" />;
  const at = STEPS.indexOf(status);
  return (
    <ol className="flex items-center gap-1 overflow-x-auto py-2">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= at ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>{i <= at ? '✓' : ''}</span>
          <span className={`whitespace-nowrap text-xs ${i === at ? 'font-bold' : 'text-slate-500'}`}>{t('status_' + s)}</span>
          {i < STEPS.length - 1 && <span className={`mx-1 h-0.5 w-6 ${i < at ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`} />}
        </li>
      ))}
    </ol>
  );
}

export const Err = ({ msg }) => (msg ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{msg}</p> : null);
export const Empty = ({ children }) => <div className="card p-10 text-center text-sm text-slate-500">{children}</div>;
export const Field = ({ label, children }) => (<label className="block"><span className="label">{label}</span>{children}</label>);
export const PageTitle = ({ children, right }) => (
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{children}</h1>{right}</div>
);
