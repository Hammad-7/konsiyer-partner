import { useAuth } from '../contexts/AuthContext';
import ComingSoonPage from './ComingSoonPage';

/**
 * FeatureProtectedRoute Component
 * Wraps routes that should only be accessible to admins or users with processed shops
 * Regular users see a "Coming Soon" message
 */
const FeatureProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Check if user is an admin (customize this logic as needed)
  const isAdmin = user?.email?.includes('@alfreya.com') || false;

  // For now, only admins can access these features
  // Later, you can add a flag in Firestore to check if shop is fully processed
  if (!isAdmin) {
    return <ComingSoonPage />;
  }

  return children;
};

export default FeatureProtectedRoute;
