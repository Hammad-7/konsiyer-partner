import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component that handles conditional routing based on user's shop verification status
 * Redirects to /connect if no verified shop, /dashboard if shop is verified
 */
const ConditionalRedirect = ({ children }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { hasConnectedShops, loading: shopLoading, connectedShops, checkUserHasVerifiedShop } = useShop();
  const [doubleChecking, setDoubleChecking] = useState(false);
  const [finalDecision, setFinalDecision] = useState(null);

  console.log('🔄 ConditionalRedirect - User:', !!user, 'Loading:', shopLoading, 'HasShops:', hasConnectedShops, 'Shops:', connectedShops);

  // Double check with direct database query if ShopContext says no shops
  useEffect(() => {
    const performDoubleCheck = async () => {
      if (!shopLoading && !hasConnectedShops && user && !doubleChecking) {
        console.log('🔍 ShopContext says no shops, performing direct database check...');
        setDoubleChecking(true);
        
        try {
          const hasShop = await checkUserHasVerifiedShop();
          console.log('🎯 Direct check result:', hasShop);
          
          if (hasShop) {
            console.log('✅ Direct check found shop! Redirecting to dashboard');
            setFinalDecision('dashboard');
          } else {
            console.log('❌ Direct check confirms no shop, redirecting to connect');
            setFinalDecision('connect');
          }
        } catch (error) {
          console.error('Error in double check:', error);
          setFinalDecision('connect');
        } finally {
          setDoubleChecking(false);
        }
      } else if (!shopLoading && hasConnectedShops) {
        console.log('✅ ShopContext found shops, redirecting to dashboard');
        setFinalDecision('dashboard');
      } else if (!shopLoading && !hasConnectedShops && !user) {
        console.log('❌ No user, will show login');
        setFinalDecision('login');
      }
    };

    performDoubleCheck();
  }, [shopLoading, hasConnectedShops, user, checkUserHasVerifiedShop, doubleChecking]);

  // Show loading while checking shop status or doing double check
  if (shopLoading || doubleChecking || finalDecision === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text={doubleChecking ? t('shop.verifyingShopStatus') : t('shop.checkingAccountStatus')} />
      </div>
    );
  }

  console.log('🎯 ConditionalRedirect final decision:', finalDecision);

  // Make final routing decision
  if (finalDecision === 'dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  if (finalDecision === 'connect') {
    return <Navigate to="/connect" replace />;
  }

  // Fallback (shouldn't happen)
  return <Navigate to="/connect" replace />;
};

export default ConditionalRedirect;