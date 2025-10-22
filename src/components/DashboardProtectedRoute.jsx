import { Navigate, useLocation } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component that protects dashboard routes - redirects users without connected shops to connect page
 * This ensures only users with connected shops can access the dashboard
 * EXCEPT during Shopify callbacks (when shop and state params are present)
 */
const DashboardProtectedRoute = ({ children }) => {
  const { hasConnectedShops, loading: shopLoading, connectedShops } = useShop();
  const location = useLocation();

  // Check if this is a Shopify callback (has shop and state parameters)
  const urlParams = new URLSearchParams(location.search);
  const isShopifyCallback = urlParams.get('shop') && urlParams.get('state');

  console.log('🛡️ DashboardProtectedRoute - Loading:', shopLoading, 'HasShops:', hasConnectedShops, 'Shops:', connectedShops.length, 'IsCallback:', isShopifyCallback);

  // Show loading while checking shop status
  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  // Allow access if user has connected shops OR this is a Shopify callback
  if (hasConnectedShops || isShopifyCallback) {
    if (isShopifyCallback) {
      console.log('✅ Allowing dashboard access for Shopify callback with params:', Object.fromEntries(urlParams.entries()));
    } else {
      console.log('✅ User has connected shops, allowing access to dashboard');
    }
    return children;
  }

  // If user has no verified shops and not a callback, redirect to connect page
  console.log('🚫 User has no connected shops and not a callback, redirecting from dashboard to connect page');
  return <Navigate to="/connect" replace />;
};

export default DashboardProtectedRoute;