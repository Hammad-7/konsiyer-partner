import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { hasCompletedOnboarding, hasPendingOnboarding } from '../services/onboardingService';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from './LoadingSpinner';

/**
 * SECURITY: Component that protects connect routes
 * 
 * Flow:
 * 1. Check if user has completed onboarding -> If NO, redirect to /onboarding
 * 2. Check if user has pending onboarding -> Show pending message
 * 3. Check if user has connected shops -> If YES, redirect to /dashboard
 * 4. Otherwise, allow access to connect pages
 */
const ConnectProtectedRoute = ({ children }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { hasConnectedShops, loading: shopLoading, connectedShops } = useShop();
  const [onboardingStatus, setOnboardingStatus] = useState({
    loading: true,
    completed: false,
    pending: false
  });

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setOnboardingStatus({ loading: false, completed: false, pending: false });
        return;
      }

      try {
        const [completed, pending] = await Promise.all([
          hasCompletedOnboarding(),
          hasPendingOnboarding()
        ]);

        setOnboardingStatus({
          loading: false,
          completed,
          pending
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus({ loading: false, completed: false, pending: false });
      }
    };

    checkOnboarding();
  }, [user]);

  console.log('🛡️ ConnectProtectedRoute - ShopLoading:', shopLoading, 'HasShops:', hasConnectedShops, 'OnboardingCompleted:', onboardingStatus.completed, 'OnboardingPending:', onboardingStatus.pending);

  // Show loading while checking statuses
  if (shopLoading || onboardingStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text={t('shop.checkingAccountStatus')} />
      </div>
    );
  }

  // No pending state - skip this check entirely
  
  // If onboarding not completed, redirect to onboarding
  if (!onboardingStatus.completed) {
    console.log('🔄 User has not completed onboarding, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If user has verified shops, redirect to dashboard (they shouldn't access connect pages)
  if (hasConnectedShops) {
    console.log('🚫 User has connected shops, redirecting from connect page to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If onboarding completed and no shops, allow access to connect pages
  console.log('✅ User completed onboarding, no shops yet, allowing access to connect page');
  return children;
};

export default ConnectProtectedRoute;