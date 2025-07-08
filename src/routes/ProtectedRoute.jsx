import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner'; // Create this component

const ProtectedRoute = ({ requiredPermissions = [], children }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If no specific permissions required, just check authentication
  if (requiredPermissions.length === 0) {
    return children ? children : <Outlet />;
  }

  // Check if user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.some(perm => 
    hasPermission(perm)
  );

  if (!hasRequiredPermission) {
    return <Navigate to="/signin" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;