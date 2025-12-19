import { motion } from 'framer-motion';
import { useShop } from '../contexts/ShopContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '../hooks/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, Loader2, Mail } from 'lucide-react';
import GtmStatusBanner from './shared/GtmStatusBanner';

/**
 * ProcessingDashboard Component
 * Shown to users when their shop is connected but data is still being processed
 * Hides demo data and shows a clean welcome interface
 */
const ProcessingDashboard = () => {
  const { connectedShops } = useShop();
  const { t } = useTranslations();

  const getShopIcon = (shopType) => {
    switch (shopType?.toLowerCase()) {
      case 'shopify':
        return (
          <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.337 2.894c-.636-0.088-1.164 0.152-1.516 0.456-0.088 0.064-0.152 0.128-0.216 0.216-0.568-0.184-1.24-0.128-1.808 0.304-1.824 1.456-2.432 4.128-2.704 6.264-1.088 0.336-1.864 0.584-1.936 0.608-0.568 0.176-0.592 0.2-0.664 0.728-0.056 0.392-1.552 11.992-1.552 11.992l12.8 2.216 5.856-1.456c0 0-2.248-15.048-2.272-15.136-0.024-0.12-0.112-0.2-0.216-0.2-0.216 0-0.552 0-1.056 0 0-0.608-0.2-1.832-0.856-3.096zm-1.584 4.896c-0.352 0.104-0.76 0.232-1.2 0.368 0.192-1.512 0.64-2.992 1.2-3.992v3.624zm-2.928 0.888c0.424-0.128 0.888-0.272 1.392-0.432v4.32l-1.392-3.888zm2.928 1.2v3.816l-1.2-3.344c0.392-0.152 0.784-0.304 1.2-0.472zm1.536-4.68c0.512 0.928 0.768 1.776 0.832 2.328-0.312 0.096-0.648 0.2-1.008 0.312v-4.128c0.064 0.048 0.12 0.104 0.176 0.16z"/>
            </svg>
          </div>
        );
      case 'ikas':
        return (
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
        );
      case 'other':
      case 'xml':
        return (
          <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Store className="h-6 w-6 text-gray-600" />
          </div>
        );
    }
  };

  const getShopTypeName = (shopType) => {
    switch (shopType?.toLowerCase()) {
      case 'shopify':
        return 'Shopify';
      case 'ikas':
        return 'Ikas';
      case 'other':
      case 'xml':
        return 'XML Feed';
      default:
        return 'E-commerce';
    }
  };

  const isXmlShop = (shopType) => {
    return shopType?.toLowerCase() === 'other' || shopType?.toLowerCase() === 'xml';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Store className="h-10 w-10 text-white" />
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-900 mb-3"
        >
          {t('processing.welcome')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600"
        >
          {t('processing.dataProcessing')}
        </motion.p>
      </motion.div>

      {/* GTM Status Banner for Ikas stores */}
      {connectedShops && connectedShops.length > 0 && connectedShops.some(s => s.shopType === 'ikas') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GtmStatusBanner shop={connectedShops.find(s => s.shopType === 'ikas')} />
        </motion.div>
      )}

      {/* Connected Shops */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t('processing.connectedShops')}</CardTitle>
                <CardDescription className="mt-2">
                  {connectedShops.length > 1 
                    ? t('processing.shopsConnected')
                    : t('processing.shopConnected')}
                </CardDescription>
              </div>
              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                {t('shop.active')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedShops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {getShopIcon(shop.shopType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {shop.shopName || shop.id}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {getShopTypeName(shop.shopType)}
                        </Badge>
                      </div>
                      
                      {/* XML-specific information */}
                      {isXmlShop(shop.shopType) && shop.xmlFileUrl && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                              {t('processing.xmlFileLink')}:
                            </p>
                            <a
                              href={shop.xmlFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {shop.xmlFileUrl}
                            </a>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Mail className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-amber-900">
                                  {t('processing.xmlContactMessage')}{' '}
                                  <a
                                    href="mailto:info@alfreya.com"
                                    className="font-medium text-amber-700 hover:text-amber-800 underline"
                                  >
                                    info@alfreya.com
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Standard shop information (Shopify/Ikas) */}
                      {!isXmlShop(shop.shopType) && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="w-32 font-medium">{t('shop.shopName')}:</span>
                            <span>{shop.shopName || shop.id}</span>
                          </div>
                          {shop.connectedAt && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-32 font-medium">{t('shop.connected')}:</span>
                              <span>
                                {new Date(
                                  shop.connectedAt.seconds 
                                    ? shop.connectedAt.seconds * 1000 
                                    : shop.connectedAt
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Processing Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('processing.workingOnIt')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('processing.processingMessage')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4"
      >
        <p className="text-sm text-gray-500">
          {t('processing.needAssistance')}{' '}
          <a
            href="mailto:info@alfreya.com"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            info@alfreya.com
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default ProcessingDashboard;
