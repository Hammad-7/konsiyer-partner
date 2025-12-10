import { useState } from 'react';
import { AlertCircle, Copy, Check, RefreshCw, BookOpen } from 'lucide-react';
import { useTranslations } from '../../hooks/useTranslations';
import { auth } from '../../firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../ui/dialog';

const GtmStatusBanner = ({ shop, onStatusChange }) => {
  const { t } = useTranslations();
  const [gtmVerified, setGtmVerified] = useState(shop?.gtmVerified ?? null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!shop || shop.shopType !== 'ikas') return null;
  if (gtmVerified === true) return null;

  const copyGtm = async () => {
    try {
      await navigator.clipboard.writeText('GTM-PK98KRR2');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  const verify = async () => {
    if (!shop?.shopName) return;
    setVerifying(true);

    try {
      let storeUrl = shop.shopName;
      if (!storeUrl.includes('.')) storeUrl = `${storeUrl}.myikas.com`;
      if (!storeUrl.startsWith('http')) storeUrl = `https://${storeUrl}`;

      const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-sharp-footing-314502.cloudfunctions.net';
      const res = await fetch(`${functionsUrl}/verify_gtm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl })
      });
      const data = await res.json();

      if (data.success && data.gtmInstalled !== undefined) {
        setGtmVerified(data.gtmInstalled);
        if (onStatusChange) onStatusChange(data.gtmInstalled);

        if (data.gtmInstalled && shop.id) {
          try {
            const user = auth.currentUser;
            if (user) {
              const idToken = await user.getIdToken();
              await fetch(`${functionsUrl}/update_gtm_status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, shopId: shop.id, gtmVerified: true })
              });
            }
          } catch (err) {
            console.error('persist gtm status failed', err);
          }
        }
      } else {
        setGtmVerified(false);
      }
    } catch (err) {
      console.error('verify error', err);
      setGtmVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Alert Icon + Message */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-amber-900 truncate">
            {t('shop.gtmNotInstalledDesc')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* GTM ID */}
          <div className="font-mono text-xs bg-white border border-amber-200 rounded px-2 py-1">
            GTM-PK98KRR2
          </div>

          {/* Copy Button */}
          <button
            onClick={copyGtm}
            className="p-1.5 sm:p-2 border rounded bg-white hover:bg-gray-50 transition-colors"
            aria-label={t('shop.copyGtmId') || 'Copy GTM ID'}
            title={t('shop.copyGtmId') || 'Copy GTM ID'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Verify Button */}
          <button
            onClick={verify}
            disabled={verifying}
            className="p-1.5 sm:p-2 border rounded bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label={t('shop.verifyGtm') || 'Verify GTM'}
            title={t('shop.verifyGtm') || 'Verify GTM'}
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${verifying ? 'animate-spin' : ''}`} />
          </button>

          {/* Tutorial Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="p-1.5 sm:p-2 border rounded bg-white hover:bg-gray-50 transition-colors"
                aria-label={t('shop.openTutorial') || 'Open tutorial'}
                title={t('shop.openTutorial') || 'Open tutorial'}
              >
                <BookOpen className="h-4 w-4 text-amber-700" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {t('shop.gtmTutorialTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {t('shop.gtmSetupSubtitle')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    <div className="font-medium">{t('shop.gtmStep1')}</div>
                  </li>
                  <li>
                    <div className="font-medium">{t('shop.gtmStep2')}</div>
                  </li>
                  <li>
                    <div className="font-medium">{t('shop.gtmStep3')}</div>
                  </li>
                </ol>

                <div className="space-y-3">
                  <img
                    src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-10-26-png.png?width=670&height=268&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-10-26-png.png"
                    alt="GTM Step 1"
                    className="w-full rounded border"
                  />
                  <img
                    src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-11-23-png-1.png?width=2880&height=952&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-11-23-png-1.png"
                    alt="GTM Step 2"
                    className="w-full rounded border"
                  />
                  <img
                    src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-13-55-png.png?width=2880&height=608&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-13-55-png.png"
                    alt="GTM Step 3"
                    className="w-full rounded border"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-sm font-medium text-blue-900">
                    {t('shop.gtmImportantNote')}
                  </div>
                  <div className="text-sm text-blue-800">
                    {t('shop.gtmNoteText')}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default GtmStatusBanner;