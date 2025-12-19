import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  RefreshCw,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from './LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';

const GET_PROCESSING_STATUS_URL = 'https://get-processing-status-kh3i5xlqba-uc.a.run.app';

/**
 * ShopifyDashboard Component
 * 
 * A simplified dashboard specifically for Shopify shops that focuses on
 * processing status and product sync information rather than invoices/payments.
 * 
 * This mirrors the app.dashboard.tsx behavior from the konsiyer-sync project.
 */
export default function ShopifyDashboard({ shopDomain }) {
  const { t } = useTranslations();
  const [processingStatus, setProcessingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      } else if (response.status === 404) {
        // No processing status found - this is okay for newly connected shops
        setProcessingStatus(null);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="xl" text={t('shopifyDashboard.loadingDashboard')} />
      </div>
    );
  }

  if (error && !processingStatus) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('shopifyDashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{shopDomain}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('shopifyDashboard.refresh')}
        </Button>
      </motion.div>

      {/* Processing Status Card */}
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
            {!processingStatus ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('shopifyDashboard.noSyncData')}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('shopifyDashboard.noSyncDataDesc')}
                </p>
              </div>
            ) : (
              <>
                {/* Processing State */}
                {processingStatus.simple_status === 'processing' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-1" />
                      <div>
                        <p className="font-medium">
                          {processingStatus.stage === 'initializing' && processingStatus.status === 'waiting'
                            ? t('shopifyDashboard.syncInitializing')
                            : processingStatus.stage === 'loading'
                            ? t('shopifyDashboard.loadingProcessingStatus')
                            : t('shopifyDashboard.catalogBeingProcessed')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('shopifyDashboard.processingTime')}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${processingStatus.progress || 0}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('shopifyDashboard.currentStage')} {processingStatus.stage || t('shopifyDashboard.initializing')}
                      </p>
                    </div>

                    {/* Processing Steps */}
                    {processingStatus.steps && (
                      <div className="space-y-2 mt-4">
                        {Object.entries(processingStatus.steps).map(([stepName, stepData]) => (
                          <div
                            key={stepName}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(stepData.status)}
                              <span className="font-medium capitalize">
                                {t(`onboarding.stage.${stepName}`) || stepName.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {stepData.progress}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info Card */}
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
      </motion.div>
    </div>
  );
}
