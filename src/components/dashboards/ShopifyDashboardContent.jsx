import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  RefreshCw,
  TrendingUp,
  Loader2,
  Play,
  Search,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../LoadingSpinner';
import { useTranslations } from '../../hooks/useTranslations';
import { useAuth } from '../../contexts/AuthContext';

// Firebase Cloud Functions URLs
const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
  'https://us-central1-sharp-footing-314502.cloudfunctions.net';

const GET_PROCESSING_STATUS_URL = `${FUNCTIONS_URL}/get_processing_status`;
const START_PROCESSING_URL = `${FUNCTIONS_URL}/start_shopify_processing`;
const CHECK_ACCESS_TOKEN_URL = `${FUNCTIONS_URL}/check_shopify_access_token`;

/**
 * ShopifyDashboardContent Component
 * 
 * Pluggable dashboard content specifically for Shopify shops.
 * Shows processing status and product sync information.
 */
export default function ShopifyDashboardContent({ shop }) {
  const { t } = useTranslations();
  const { getIdToken } = useAuth();
  const shopDomain = shop.shopName || shop.shop;
  const [processingStatus, setProcessingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isStartingSync, setIsStartingSync] = useState(false);

  // Fetch processing status on mount
  useEffect(() => {
    fetchProcessingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopDomain]);

  // Auto-refresh if still processing
  useEffect(() => {
    if (processingStatus?.simple_status === 'processing') {
      const interval = setInterval(() => {
        fetchProcessingStatus(true); // Silent refresh
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [processingStatus?.simple_status]);

  const fetchProcessingStatus = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch(
        `${GET_PROCESSING_STATUS_URL}?shop_domain=${encodeURIComponent(shopDomain)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProcessingStatus(data);
        // Clear starting sync state once we have status
        if (isStartingSync) {
          setIsStartingSync(false);
        }
      } else if (response.status === 404) {
        // No processing status found - this is okay for newly connected shops
        setProcessingStatus(null);
        // Only clear starting state if we weren't just trying to start sync
        if (isStartingSync && !silent) {
          setIsStartingSync(false);
        }
      } else {
        throw new Error('Failed to fetch processing status');
      }
    } catch (err) {
      console.error('Error fetching processing status:', err);
      if (!silent) {
        setError(t('shopifyDashboard.errorLoadingDashboard'));
      }
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProcessingStatus();
  };

  const handleStartSync = async () => {
    try {
      setIsStartingSync(true);
      setError(null);

      // Extract shop name from domain (remove .myshopify.com)
      const shopName = shopDomain.replace('.myshopify.com', '');
      
      // Open Shopify admin app page to activate access token
      const shopifyAppUrl = `https://admin.shopify.com/store/${shopName}/apps/konsiyer-sync/app/accounts`;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const popupWidth = 500;
      const popupHeight = 400;
      const left = screenWidth - popupWidth - 20;
      const top = screenHeight - popupHeight - 100;
      
      const popup = window.open(
        shopifyAppUrl, 
        '_blank', 
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
      
      // Poll backend to check if access token is created
      const startTime = Date.now();
      const maxWaitTime = 30000; // 30 seconds timeout
      const pollInterval = 1000;
      
      const checkToken = async () => {
        try {
          const response = await fetch(
            `${CHECK_ACCESS_TOKEN_URL}?shop_domain=${encodeURIComponent(shopDomain)}&start_time=${startTime}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data.token_exists) {
              console.log('Access token detected!');
              
              // Close the popup
              if (popup && !popup.closed) {
                popup.close();
              }
              
              // Start processing
              setTimeout(() => {
                startProcessing();
              }, 1000);
              
              return true;
            }
          }
          
          // Check timeout
          if (Date.now() - startTime >= maxWaitTime) {
            console.warn('Timeout waiting for access token, proceeding anyway...');
            if (popup && !popup.closed) {
              popup.close();
            }
            startProcessing();
            return true;
          }
          
          // Continue polling
          setTimeout(checkToken, pollInterval);
          return false;
          
        } catch (err) {
          console.error('Error checking access token:', err);
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(checkToken, pollInterval);
          } else {
            if (popup && !popup.closed) {
              popup.close();
            }
            startProcessing();
          }
        }
      };
      
      // Start checking for the token
      checkToken();
      
    } catch (err) {
      console.error('Error starting sync:', err);
      setError('Failed to start sync. Please try again.');
      setIsStartingSync(false);
    }
  };

  const startProcessing = async () => {
    try {
      const idToken = await getIdToken();

      // Trigger processing (fire and forget)
      fetch(START_PROCESSING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_domain: shopDomain,
          idToken: idToken,
        }),
      }).catch(err => {
        console.warn('Processing trigger error (non-blocking):', err);
      });

      // Start polling for status (keep isStartingSync true until we get status)
      setTimeout(() => {
        fetchProcessingStatus();
      }, 2000);
      
    } catch (err) {
      console.error('Error starting processing:', err);
      setError('Failed to start processing. Please try again.');
      setIsStartingSync(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{t('shopifyDashboard.completed')}</Badge>;
      case 'error':
        return <Badge className="bg-red-500">{t('shopifyDashboard.error')}</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">{t('shopifyDashboard.processing')}</Badge>;
      default:
        return <Badge className="bg-gray-500">{t('shopifyDashboard.unknown')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('shopifyDashboard.loadingDashboard')} />
      </div>
    );
  }

  if (error && !processingStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold">{t('shopifyDashboard.errorLoadingDashboard')}</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('shopifyDashboard.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button - Only show when there's processing status */}
      {processingStatus && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('shopifyDashboard.refresh')}
          </Button>
        </div>
      )}

      {/* Welcome Card - No Processing Status */}
      {!processingStatus && !isStartingSync ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('onboarding.welcomeTitle')}
                </h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                  {t('onboarding.welcomeSubtitle')}
                </p>
              </div>

              {/* Action Section */}
              <div className="space-y-4 text-center">
                <Button
                  onClick={handleStartSync}
                  disabled={isStartingSync}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isStartingSync ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t('onboarding.startingSync')}
                    </>
                  ) : (
                    t('onboarding.syncProductCatalog')
                  )}
                </Button>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Contact Section */}
              <div className="pt-6 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>
                    {t('onboarding.questionsContact')}{' '}
                    <a href="mailto:info@alfreya.com" className="text-blue-500 hover:underline">
                      info@alfreya.com
                    </a>
                  </span>
                </div>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      ) : isStartingSync ? (
        /* Loading State - Waiting for Processing to Start */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold">{t('onboarding.processingTitle')}</h2>
                <p className="text-gray-600">
                  {t('onboarding.initializing')}
                </p>
              </div>
              <div className="text-center py-4">
                <LoadingSpinner />
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* Processing Status Card */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('shopifyDashboard.productCatalogSyncStatus')}</CardTitle>
                {processingStatus?.simple_status && getStatusBadge(processingStatus.simple_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Processing State */}
                {processingStatus.simple_status === 'processing' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                      <p className="font-medium text-lg">
                        {t('onboarding.processingTitle')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('onboarding.processingSubtitle')}
                      </p>
                    </div>

                    {/* Stepper - 4 Steps */}
                    <div className="space-y-3">
                      {(() => {
                        const stage = processingStatus.stage || 'initializing';
                        const progress = processingStatus.progress || 0;
                        
                        // Calculate current step (4 steps total)
                        let currentStep = 1;
                        if (stage === 'fetching_products' || stage === 'product_fetch') currentStep = 1;
                        else if (stage === 'classifying_products' || stage === 'classification') currentStep = 2;
                        else if (stage === 'saving_to_storage' || stage === 'storage') currentStep = 3;
                        else if (stage === 'generating_embeddings' || stage === 'embeddings') currentStep = 4;
                        else if (stage === 'finalizing') currentStep = 4;
                        else if (progress > 75) currentStep = 4;
                        else if (progress > 50) currentStep = 3;
                        else if (progress > 25) currentStep = 2;

                        return [1, 2, 3, 4].map((stepNumber) => {
                          const isActive = stepNumber === currentStep;
                          const isCompleted = stepNumber < currentStep;
                          return (
                            <div 
                              key={stepNumber} 
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                isActive 
                                  ? 'bg-blue-50 border border-blue-200' 
                                  : isCompleted 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isActive 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
                              </div>
                              <span className={`font-medium ${
                                isActive 
                                  ? 'text-blue-700' 
                                  : isCompleted 
                                  ? 'text-green-700' 
                                  : 'text-gray-600'
                              }`}>
                                {t(`onboarding.stepperStep${stepNumber}`)}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm text-blue-900">
                          <p className="font-medium mb-1">{t('onboarding.processTimeInfo')}</p>
                          <p className="text-blue-700">
                            {t('onboarding.processTimeDesc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Loading Spinner */}
                    <div className="text-center py-4">
                      <LoadingSpinner />
                    </div>
                  </div>
                )}

                {/* Completed State */}
                {processingStatus.simple_status === 'completed' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">
                            {t('shopifyDashboard.syncCompletedSuccessfully')}
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            {t('shopifyDashboard.syncCompletedDesc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    {processingStatus.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('shopifyDashboard.productsFetched')}</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {processingStatus.summary.total_products_fetched}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('shopifyDashboard.publishable')}</p>
                          <p className="text-2xl font-bold text-green-700">
                            {processingStatus.summary.publishable_products ||
                             processingStatus.summary.embeddings_generated ||
                             processingStatus.summary.apparel_count}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('shopifyDashboard.processed')}</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {processingStatus.summary.total_products_processed}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('shopifyDashboard.nonApparel')}</p>
                          <p className="text-2xl font-bold text-gray-700">
                            {processingStatus.summary.non_apparel_count}
                          </p>
                        </div>
                      </div>
                    )}

                    {processingStatus.summary?.completed_at && (
                      <p className="text-sm text-gray-600 text-center">
                        {t('shopifyDashboard.completedAt')} {new Date(processingStatus.summary.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Error State */}
                {processingStatus.simple_status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">
                          {t('shopifyDashboard.syncFailed')}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {processingStatus.error || t('shopifyDashboard.syncFailedDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Info Card
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('shopifyDashboard.aboutIntegration')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-500 mt-1" />
              <div>
                <p className="font-medium">{t('shopifyDashboard.aiPoweredDiscovery')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('shopifyDashboard.aiPoweredDiscoveryDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-indigo-500 mt-1" />
              <div>
                <p className="font-medium">{t('shopifyDashboard.automaticSync')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('shopifyDashboard.automaticSyncDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}
    </div>
  );
}
