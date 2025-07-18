// client/src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    // You can add a spinner or a loading component here
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
