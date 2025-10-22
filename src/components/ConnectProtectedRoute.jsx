import { Navigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component that protects connect routes - redirects users with connected shops to dashboard
 * This prevents users who already have shops from accessing the connect pages
 */
const ConnectProtectedRoute = ({ children }) => {
  const { hasConnectedShops, loading: shopLoading, connectedShops } = useShop();

  console.log('🛡️ ConnectProtectedRoute - Loading:', shopLoading, 'HasShops:', hasConnectedShops, 'Shops:', connectedShops.length);

  // Show loading while checking shop status
  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text="Checking your shop connections..." />
      </div>
    );
  }

  // If user has verified shops, redirect to dashboard (they shouldn't access connect pages)
  if (hasConnectedShops) {
    console.log('🚫 User has connected shops, redirecting from connect page to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If no verified shops, allow access to connect pages
  console.log('✅ User has no connected shops, allowing access to connect page');
  return children;
};

export default ConnectProtectedRoute;