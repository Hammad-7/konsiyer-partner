import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import Dashboard from './Dashboard';

/**
 * DashboardRouter Component
 * Now routes directly to Dashboard which handles Shopify/Ikas routing internally
 * - Shopify shops: ShopifyOnboardingFlow → ShopifyDashboard
 * - Ikas/Other shops: Full merchant dashboard
 */
const DashboardRouter = () => {
  // Dashboard component now handles all routing internally based on shop type  
  return <Dashboard />;
};

export default DashboardRouter;
