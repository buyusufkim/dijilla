import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isVerifiedUser } from '@/lib/auth-policy';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status" className="p-8 text-center">Oturum kontrol ediliyor…</p>;
  if (!isVerifiedUser(user)) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet key={user!.id} />;
}
