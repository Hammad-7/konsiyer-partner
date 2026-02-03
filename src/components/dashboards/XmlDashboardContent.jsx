import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '../../hooks/useTranslations';

/**
 * XmlDashboardContent Component
 * 
 * Pluggable dashboard content specifically for XML shops.
 * Shows connection status without GTM warning.
 */
export default function XmlDashboardContent({ shop }) {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('unifiedDashboard.connectionStatus')}</CardTitle>
              <Badge className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t('unifiedDashboard.connected')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {t('unifiedDashboard.dataCollecting')}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('unifiedDashboard.dataCollectingDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="space-y-3 pt-4">
              <h4 className="font-semibold text-gray-900">{t('unifiedDashboard.upcomingFeatures')}</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('unifiedDashboard.featureSalesAnalytics')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('unifiedDashboard.featureOrderTracking')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('unifiedDashboard.featurePerformanceMetrics')}</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* XML Feed Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('unifiedDashboard.xmlFeedInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {t('unifiedDashboard.xmlFeedInfoDesc')}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
