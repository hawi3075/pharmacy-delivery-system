import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../store';

export default function Protected({ roles, children }) {
  const { user, ready } = useApp();
  const loc = useLocation();
  if (!ready) return <p className="p-10 text-center text-sm text-slate-500">Loading…</p>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
