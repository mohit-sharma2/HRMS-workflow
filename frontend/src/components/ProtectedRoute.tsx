import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser } from '../context/UserContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const token = Cookies.get('auth_token');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
