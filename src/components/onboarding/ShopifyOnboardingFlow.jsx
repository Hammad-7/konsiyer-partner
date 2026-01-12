import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Link2, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

// Firebase Cloud Functions URLs
const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
  'https://us-central1-sharp-footing-314502.cloudfunctions.net';

const CHECK_SYNC_STATUS_URL = `${FUNCTIONS_URL}/check_shop_sync_status`;
const GET_PROCESSING_STATUS_URL = `${FUNCTIONS_URL}/get_processing_status`;
const START_PROCESSING_URL = `${FUNCTIONS_URL}/start_shopify_processing`;

/**
 * ShopifyOnboardingFlow Component
 * 
 * Handles the complete Shopify onboarding workflow:
 * 1. Welcome screen - Introduce the platform and prompt user to start processing
 * 2. Processing state - Show real-time progress of product sync
 * 3. Completion - Display success message with sync summary
 * 
 * This component replicates the exact workflow from the konsiyer-sync project.
 * The access token is automatically retrieved from the backend.
 */
export default function ShopifyOnboardingFlow({ shopDomain, onComplete }) {
  const { getIdToken } = useAuth();
  const { t } = useTranslations();
  const [currentStage, setCurrentStage] = useState('welcome'); // welcome, processing, completed, error
  const [processingStatus, setProcessingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isStartingProcessing, setIsStartingProcessing] = useState(false);

  // Check initial processing status on mount
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
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
          if (data.simple_status === 'processing') {
            setCurrentStage('processing');
            setProcessingStatus(data);
          } else if (data.simple_status === 'completed') {
            setCurrentStage('completed');
            setProcessingStatus(data);
          }
        }
      } catch (err) {
        console.error('Error checking initial status:', err);
      }
    };

    checkInitialStatus();
  }, [shopDomain]);

  // Poll for processing status when in processing stage
  useEffect(() => {
    if (currentStage !== 'processing') return;

    const pollInterval = setInterval(async () => {
      try {
        const idToken = await getIdToken();
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

          // Check if processing is complete
          if (data.simple_status === 'completed') {
            setCurrentStage('completed');
            clearInterval(pollInterval);
            
            // Notify parent component after a short delay
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 3000);
          } else if (data.simple_status === 'error') {
            setCurrentStage('error');
            setError(data.error || 'Processing failed. Please try again.');
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Error polling processing status:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [currentStage, shopDomain, onComplete]);

  const handleStartProcessing = async () => {
    try {
      setIsStartingProcessing(true);
      setError(null);

      const idToken = await getIdToken();

      // Fire and forget - don't wait for the response
      // The actual processing takes 40-50 minutes, so we just trigger it
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
        // Log but don't block - we'll check status via polling
        console.warn('Processing trigger error (non-blocking):', err);
      });

      // Immediately switch to processing stage and start polling
      setCurrentStage('processing');
      
      // Give the backend a moment to initialize, then start polling
      setTimeout(checkProcessingStatus, 2000);
      
    } catch (err) {
      console.error('Error starting processing:', err);
      setError('Failed to start processing. Please try again.');
    } finally {
      setIsStartingProcessing(false);
    }
  };

  const checkProcessingStatus = async () => {
    try {
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
      }
    } catch (err) {
      console.error('Error checking processing status:', err);
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

  // Welcome Screen
  if (currentStage === 'welcome') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
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
                onClick={handleStartProcessing}
                disabled={isStartingProcessing}
                size="lg"
                className="min-w-[200px]"
              >
                {isStartingProcessing ? (
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
      </div>
    );
  }

  // Processing State
  if (currentStage === 'processing') {
    const progress = processingStatus?.progress || 0;
    const stage = processingStatus?.stage || 'initializing';
    const status = processingStatus?.status || 'unknown';
    
    // Calculate estimated time remaining (rough estimate based on progress)
    const estimatedMinutes = progress > 0 ? Math.ceil((100 - progress) * 0.4) : 40;

    // Calculate current step (4 steps total)
    const totalSteps = 4;
    let currentStep = 1;
    if (stage === 'fetching_products') currentStep = 1;
    else if (stage === 'classifying_products') currentStep = 2;
    else if (stage === 'saving_to_storage') currentStep = 3;
    else if (stage === 'generating_embeddings') currentStep = 4;
    else if (stage === 'finalizing') currentStep = 4;
    else if (progress > 75) currentStep = 4;
    else if (progress > 50) currentStep = 3;
    else if (progress > 25) currentStep = 2;

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold">{t('onboarding.processingTitle')}</h2>
              <p className="text-gray-600">
                {t('onboarding.processingSubtitle')}
              </p>
              {/* {progress > 0 && (
                <p className="text-sm text-gray-500">
                  {t('onboarding.estimatedTime')} ~{estimatedMinutes} {t('onboarding.minutes')}
                </p>
              )} */}
            </div>

            {/* Stepper */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((stepNumber) => {
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                return (
                  <div key={stepNumber} className={`flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-blue-50 border border-blue-200' : isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                      {t(`onboarding.stepperStep${stepNumber}`)}
                    </span>
                  </div>
                );
              })}
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

            <div className="text-center">
              <LoadingSpinner />
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  // Completion State
  if (currentStage === 'completed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">{t('onboarding.syncCompleted')}</h2>
              <p className="text-gray-600">
                {t('onboarding.syncCompletedDesc')}
              </p>
            </div>

            {/* Summary */}
            {processingStatus?.summary && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('onboarding.processingSummary')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('onboarding.productsFetched')}</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {processingStatus.summary.total_products_fetched}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('onboarding.publishableProducts')}</p>
                    <p className="text-2xl font-bold text-green-700">
                      {processingStatus.summary.publishable_products || 
                       processingStatus.summary.embeddings_generated || 
                       processingStatus.summary.apparel_count}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('onboarding.productsProcessed')}</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {processingStatus.summary.total_products_processed}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('onboarding.nonApparelItems')}</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {processingStatus.summary.non_apparel_count}
                    </p>
                  </div>
                </div>
                {processingStatus.summary.completed_at && (
                  <p className="text-sm text-gray-600 text-center">
                    {t('onboarding.completed')}: {new Date(processingStatus.summary.completed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('onboarding.redirecting')}
              </p>
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  // Error State
  if (currentStage === 'error') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-700">{t('onboarding.syncFailed')}</h2>
              <p className="text-gray-600">
                {error || t('onboarding.syncFailedDesc')}
              </p>
            </div>

            <div className="text-center">
              <Button onClick={() => setCurrentStage('welcome')} size="lg">
                {t('onboarding.tryAgain')}
              </Button>
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  return null;
}
