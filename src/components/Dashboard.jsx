import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useTranslations } from '../hooks/useTranslations';

// Components
import LoadingSpinner from './LoadingSpinner';
// import ShopifyOnboardingFlow from './onboarding/ShopifyOnboardingFlow';
import UnifiedDashboard from './dashboards/UnifiedDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

// const CHECK_SYNC_STATUS_URL = 'https://check-shop-sync-status-kh3i5xlqba-uc.a.run.app';

const Dashboard = () => {
  const { user } = useAuth();
  const { hasConnectedShops, connectedShops, loading: shopLoading, finalizeShopifyConnection } = useShop();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [finalizing, setFinalizing] = useState(false);
  const [finalizationError, setFinalizationError] = useState('');
  // const [shopifyOnboardingStatus, setShopifyOnboardingStatus] = useState(null);
  // const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  
  // Ref to prevent duplicate finalization calls (React Strict Mode double-invocation)
  const finalizationInProgress = useRef(false);

  console.log("Dashboard - hasConnectedShops:", hasConnectedShops);

  // Check for URL parameters (for Shopify callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const state = urlParams.get('state');
    
    if (shop && state && user && !finalizationInProgress.current) {
      finalizationInProgress.current = true;
      
      const handleFinalization = async () => {
        try {
          setFinalizing(true);
          setFinalizationError('');
          await finalizeShopifyConnection(shop, state);
          
          // Clean up URL immediately after successful finalization
          window.history.replaceState({}, document.title, '/dashboard');
          // toast.success('Shop connected successfully!');
          
          // Commented out: After finalizing Shopify connection, check onboarding status
          // await checkShopifyOnboardingStatus(shop);
        } catch (error) {
          console.error('❌ Error finalizing Shopify connection:', error);
          
          // Don't show error if it's "Invalid or expired state" - this means it already succeeded
          if (error.message?.includes('Invalid or expired state')) {
            // State already consumed - connection likely succeeded, check status
            console.log('ℹ️ State already consumed, checking connection status...');
            window.history.replaceState({}, document.title, '/dashboard');
            // Commented out: await checkShopifyOnboardingStatus(shop);
          } else {
            setFinalizationError(error.message || 'Failed to finalize connection');
            // Commented out: toast.error('Failed to connect shop');
          }
        } finally {
          setFinalizing(false);
        }
      };
      
      handleFinalization();
    }
  }, [user, finalizeShopifyConnection]);

  // Commented out: Check Shopify onboarding status for Shopify shops
  // const checkShopifyOnboardingStatus = async (shopDomain) => {
  //   try {
  //     setCheckingOnboarding(true);
  //     const response = await fetch(
  //       `${CHECK_SYNC_STATUS_URL}?shop_domain=${encodeURIComponent(shopDomain)}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  //
  //     if (response.ok) {
  //       const data = await response.json();
  //       setShopifyOnboardingStatus(data);
  //       console.log('Shopify onboarding status:', data);
  //     }
  //   } catch (error) {
  //     console.error('Error checking Shopify onboarding status:', error);
  //   } finally {
  //     setCheckingOnboarding(false);
  //   }
  // };

  // Commented out: Check onboarding status for Shopify shops on mount
  // useEffect(() => {
  //   if (hasConnectedShops && connectedShops) {
  //     const shopifyShop = connectedShops.find(shop => shop.shopType === 'shopify');
  //     if (shopifyShop) {
  //       const shopDomain = shopifyShop.shopName || shopifyShop.shop;
  //       if (shopDomain) {
  //         checkShopifyOnboardingStatus(shopDomain);
  //       }
  //     }
  //   }
  // }, [hasConnectedShops, connectedShops]);

  // Show loading while checking shop status or finalizing connection
  if (shopLoading || finalizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner 
          size="xl" 
          text={finalizing ? t('dashboard.finalizingConnection') : t('common.loading')} 
        />
      </div>
    );
  }

  // Show finalization error
  if (finalizationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>{t('dashboard.connectionFailed')}</CardTitle>
            <CardDescription>{finalizationError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => {
                setFinalizationError('');
                navigate('/connect');
              }}
            >
              {t('common.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has connected shops, show the unified dashboard
  if (hasConnectedShops) {
    console.log("=== Dashboard Render Debug ===");
    console.log("connectedShops:", connectedShops);
    console.log("📊 Rendering UnifiedDashboard for all connected shops");
    
    // Commented out: Shopify onboarding flow check
    // const shopifyShop = connectedShops?.find(shop => shop.shopType === 'shopify');
    // if (shopifyShop) {
    //   const shopDomain = shopifyShop.shopName || shopifyShop.shop;
    //   
    //   // Still loading onboarding status
    //   if (checkingOnboarding || shopifyOnboardingStatus === null) {
    //     console.log("⏳ Showing loading spinner - checking onboarding status");
    //     return (
    //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
    //         <LoadingSpinner 
    //           size="xl" 
    //           text="Loading dashboard..." 
    //         />
    //       </div>
    //     );
    //   }
    //
    //   // Shop hasn't been synced yet - show onboarding flow
    //   if (!shopifyOnboardingStatus.has_synced) {
    //     console.log("🔄 Showing ShopifyOnboardingFlow - shop not synced yet");
    //     return (
    //       <div className="max-w-7xl mx-auto">
    //         <ShopifyOnboardingFlow
    //           shopDomain={shopDomain}
    //           onComplete={() => {
    //             // Refresh the onboarding status after completion
    //             checkShopifyOnboardingStatus(shopDomain);
    //           }}
    //         />
    //       </div>
    //     );
    //   }
    //   console.log("✅ Shopify shop has been synced - showing UnifiedDashboard");
    // }
    
    // All connected shops use the unified dashboard
    // The dashboard will render appropriate content based on shop type
    return <UnifiedDashboard />;
  }

  // This shouldn't happen as we redirect to /connect, but fallback just in case
  return null;
};

export default Dashboard;
