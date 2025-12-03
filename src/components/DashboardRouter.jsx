import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import Dashboard from './Dashboard';
import ProcessingDashboard from './ProcessingDashboard';

/**
 * DashboardRouter Component
 * Routes between ProcessingDashboard (for regular users) and full Dashboard (for admins/processed shops)
 */
const DashboardRouter = () => {
  const { user } = useAuth();
  const { hasConnectedShops } = useShop();

  // Check if user is an admin (you can customize this logic)
  const isAdmin = user?.email?.includes('@konsiyer.com') || false;

  // For now, all regular users see the processing dashboard
  // Admins see the full dashboard
  // Later, you can add a flag in Firestore to determine if a shop is "processed"
  if (hasConnectedShops && !isAdmin) {
    return <ProcessingDashboard />;
  }

  // Show full dashboard for admins or when implementing processing completion
  return <Dashboard />;
};

export default DashboardRouter;
