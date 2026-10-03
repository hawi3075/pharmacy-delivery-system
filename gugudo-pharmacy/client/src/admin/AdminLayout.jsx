import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../store';

export default function AdminLayout() {
  const { t, user } = useApp();
  const item = [
    ['/admin', t('dashboard'), true, '▦'], ['/admin/orders', t('orders'), false, '▤'], ['/admin/products', t('products'), false, '✚'],
    ['/admin/reviews', 'Reviews', false, '★'], ['/admin/messages', t('messages'), false, '✉'], ['/admin/customers', t('customers'), false, '♙'], ['/admin/finance', t('finance'), false, '◈'],
  ];
  if (user.role === 'SUPER_ADMIN') item.push(['/admin/admins', t('admins'), false, '♙'], ['/admin/audit', t('audit'), false, '⌁']);
  const cls = ({ isActive }) => `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-brand-light dark:text-slate-300 dark:hover:bg-slate-700'}`;
  return (
    <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
      <nav className="card flex h-fit gap-1 overflow-x-auto p-2 md:flex-col">
        <p className="hidden px-3 py-2 text-xs text-slate-500 md:block">{user.role === 'SUPER_ADMIN' ? 'Super admin' : 'Admin'}</p>
        {item.map(([to, label, end, icon]) => <NavLink key={to} to={to} end={end} className={cls}><span className="mr-2 inline-block w-5 text-center">{icon}</span>{label}</NavLink>)}
      </nav>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}
