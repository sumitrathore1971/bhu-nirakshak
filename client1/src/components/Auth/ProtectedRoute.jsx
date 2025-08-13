import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allow = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allow.length > 0 && !allow.includes(user.role)) {
    // Redirect based on user's actual role
    const redirectPath = user.role === 'Citizen' ? '/citizen/report' :
                        user.role === 'Enforcement' ? '/enforce-dashboard' :
                        user.role === 'Admin' ? '/admin-dashboard' : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
