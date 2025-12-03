import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '../hooks/useTranslations';

/**
 * ComingSoonPage Component
 * Shown when users try to access features that are not yet available
 */
const ComingSoonPage = () => {
  const { t } = useTranslations();
  
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="border-2 border-gray-200">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
            >
              <Lock className="h-10 w-10 text-gray-400" />
            </motion.div>
            <CardTitle className="text-2xl">{t('comingSoon.title')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('comingSoon.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              {t('comingSoon.message')}
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs text-indigo-700">
                {t('comingSoon.info')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;
