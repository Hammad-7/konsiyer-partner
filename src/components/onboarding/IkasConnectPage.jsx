import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const IkasConnectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { connectIkas, connecting } = useShop();
  
  const [shopUrl, setShopUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [gtmVerified, setGtmVerified] = useState(null);
  const [gtmVerifying, setGtmVerifying] = useState(false);
  const [gtmDialogOpen, setGtmDialogOpen] = useState(false);
  const [gtmCopied, setGtmCopied] = useState(false);

  const validateField = (field, value) => { 
    const errors = { ...validationErrors };
    
    if (!value.trim()) {
      errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
    } else {
      delete errors[field];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShopUrlChange = (e) => {
    const value = e.target.value;
    setShopUrl(value);
    setError('');
    validateField('shopUrl', value);
  };

  const handleClientIdChange = (e) => {
    const value = e.target.value;
    setClientId(value);
    setError('');
    validateField('clientId', value);
  };

  const handleClientSecretChange = (e) => {
    const value = e.target.value;
    setClientSecret(value);
    setError('');
    validateField('clientSecret', value);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isShopUrlValid = validateField('shopUrl', shopUrl);
    const isClientIdValid = validateField('clientId', clientId);
    const isClientSecretValid = validateField('clientSecret', clientSecret);

    if (!isShopUrlValid || !isClientIdValid || !isClientSecretValid) {
      setError(t('shop.pleaseEnterAllFields'));
      return;
    }

    try {
      setError('');
      
      const result = await connectIkas(
        shopUrl.trim(),
        clientId.trim(),
        clientSecret.trim()
      );
      
      if (result.success) {
        // Save GTM status if verified
        if (gtmVerified === true && result.shopId) {
          try {
            const idToken = await user.getIdToken();
            const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
              'https://us-central1-sharp-footing-314502.cloudfunctions.net';
            
            await fetch(`${functionsUrl}/update_gtm_status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                idToken: idToken,
                shopId: result.shopId,
                gtmVerified: true
              })
            });
          } catch (saveError) {
            console.error('Error saving GTM status:', saveError);
            // Don't fail the connection if saving fails
          }
        }
        
        // Navigate to dashboard on successful connection
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error('Error connecting Ikas:', err);
      setError(err.message || t('shop.connectionError'));
    }
  };

  const handleBackToOptions = () => {
    navigate('/connect');
  };

  const handleCopyGtmId = async () => {
    try {
      await navigator.clipboard.writeText('GTM-PK98KRR2');
      setGtmCopied(true);
      setTimeout(() => setGtmCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy GTM ID:', err);
    }
  };

  const verifyGtmInstallation = async () => {
    if (!shopUrl.trim()) {
      setError(t('shop.pleaseEnterAllFields'));
      return;
    }

    setGtmVerifying(true);
    setError(''); // Clear any previous errors
    
    try {
      // Construct the store URL
      let storeUrl = shopUrl.trim();
      if (!storeUrl.startsWith('http')) {
        storeUrl = 'https://' + storeUrl;
      }

      // Call backend endpoint to verify GTM installation
      const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
        'https://us-central1-sharp-footing-314502.cloudfunctions.net';
      
      const response = await fetch(`${functionsUrl}/verify_gtm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeUrl: storeUrl
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.gtmInstalled !== undefined) {
        setGtmVerified(data.gtmInstalled);
        
        if (!data.gtmInstalled) {
          console.log('GTM tag not found on store. Please ensure GTM-PK98KRR2 is installed.');
        }
      } else if (data.error) {
        // Verification failed but don't block the user
        console.warn('GTM verification failed:', data.error);
        setGtmVerified(null);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Error verifying GTM:', err);
      // Don't block the user - just show that verification failed
      setGtmVerified(null);
      console.warn('Could not verify GTM automatically. Please ensure GTM-PK98KRR2 is installed on your store.');
    } finally {
      setGtmVerifying(false);
    }
  };

  const isFormValid = shopUrl.trim() && clientId.trim() && clientSecret.trim() && Object.keys(validationErrors).length === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={handleBackToOptions}
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('shop.backToOptions')}
        </button>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4">
              <img src="/icons/ikas_icon.png" alt="Ikas" className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('shop.connectIkasStore')}
            </h1>
            <p className="text-gray-600">
              {t('shop.ikasStoreCredentials')}
            </p>
          </div>

          {/* Video Tutorial */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('shop.videoTutorial')}
                </h2>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {t('shop.helpfulGuide')}
                </span>
              </div>
              
              <div className="relative w-full rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/-oYhQ_eNSY8?rel=0&modestbranding=1&showinfo=0"
                  title="Ikas Connection Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                {t('shop.watchTutorial')}
              </p>
            </div>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-6">
            
            {/* Shop URL Input */}
            <div>
              <label htmlFor="shopUrl" className="block text-sm font-medium text-gray-700 mb-2">
                {t('shop.shopUrlLabel') || 'Shop URL'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="shopUrl"
                  value={shopUrl}
                  onChange={handleShopUrlChange}
                  placeholder={t('shop.shopUrlPlaceholder') || 'e.g., yourstorename.myikas.com'}
                  disabled={connecting}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                    validationErrors.shopUrl ? 'border-red-300' : 'border-gray-300'
                  } ${connecting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {/* Validation Error */}
              {validationErrors.shopUrl && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.shopUrl}
                </p>
              )}
              
              {/* Help Text */}
              <p className="mt-2 text-sm text-gray-500">
                {t('shop.shopUrlHelp') || 'Enter your full Ikas shop URL (e.g., yourstorename.myikas.com or yourstorename.ikas.shop)'}
              </p>
            </div>

            {/* Client ID Input */}
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                {t('shop.clientId')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={handleClientIdChange}
                  placeholder={t('shop.clientIdPlaceholder')}
                  disabled={connecting}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                    validationErrors.clientId ? 'border-red-300' : 'border-gray-300'
                  } ${connecting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {/* Validation Error */}
              {validationErrors.clientId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.clientId}
                </p>
              )}
            </div>

            {/* Client Secret Input */}
            <div>
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-2">
                {t('shop.clientSecret')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="clientSecret"
                  value={clientSecret}
                  onChange={handleClientSecretChange}
                  placeholder={t('shop.clientSecretPlaceholder')}
                  disabled={connecting}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                    validationErrors.clientSecret ? 'border-red-300' : 'border-gray-300'
                  } ${connecting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {/* Validation Error */}
              {validationErrors.clientSecret && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.clientSecret}
                </p>
              )}
            </div>

            {/* GTM Setup - Mandatory */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t('shop.gtmContainerId')} <span className="text-red-500">*</span>
                </label>
                <Dialog open={gtmDialogOpen} onOpenChange={setGtmDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-purple-600 hover:text-purple-800 underline"
                    >
                      {t('shop.viewTutorial')}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        {t('shop.gtmTutorialTitle')}
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        {t('shop.gtmSetupSubtitle')}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-6 space-y-6">
                      <ol className="space-y-6">
                        <li className="flex">
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold mr-4">
                            1
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{t('shop.gtmStep1')}</p>
                          </div>
                        </li>
                        
                        <li className="flex">
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold mr-4">
                            2
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{t('shop.gtmStep2')}</p>
                          </div>
                        </li>
                        
                        <li className="flex">
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold mr-4">
                            3
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium mb-4">{t('shop.gtmStep3')}</p>
                            
                            <div className="space-y-4">
                              <img 
                                src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-10-26-png.png?width=670&height=268&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-10-26-png.png" 
                                alt="GTM Step 1"
                                className="w-full rounded-lg border border-gray-200"
                              />
                              <img 
                                src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-11-23-png-1.png?width=2880&height=952&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-11-23-png-1.png" 
                                alt="GTM Step 2"
                                className="w-full rounded-lg border border-gray-200"
                              />
                              <img 
                                src="https://support.ikas.com/hs-fs/hubfs/Bildschirm%C2%ADfoto%202025-08-01%20um%2015-13-55-png.png?width=2880&height=608&name=Bildschirm%C2%ADfoto%202025-08-01%20um%2015-13-55-png.png" 
                                alt="GTM Step 3"
                                className="w-full rounded-lg border border-gray-200"
                              />
                            </div>
                          </div>
                        </li>
                      </ol>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">{t('shop.gtmImportantNote')}</h4>
                            <p className="text-sm text-blue-800">{t('shop.gtmNoteText')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-700">
                  GTM-PK98KRR2
                </div>
                <button
                  type="button"
                  onClick={handleCopyGtmId}
                  className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-1.5"
                >
                  {gtmCopied ? (
                    <>
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </>
                  )}
                </button>
                {shopUrl.trim() && (
                  <button
                    type="button"
                    onClick={verifyGtmInstallation}
                    disabled={gtmVerifying}
                    className="px-3 py-2.5 text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400 transition-colors duration-200"
                  >
                    {gtmVerifying ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {gtmVerified !== null && (
                <p className={`mt-2 text-xs flex items-center ${
                  gtmVerified === true ? 'text-green-600' : gtmVerified === false ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {gtmVerified === true ? (
                    <>
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('shop.gtmVerified')}
                    </>
                  ) : gtmVerified === false ? (
                    <>
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {t('shop.gtmNotVerified')}
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {t('shop.gtmVerificationFailed')}
                    </>
                  )}
                </p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                {t('shop.gtmNoteText')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Connect Button */}
            <button
              type="submit"
              disabled={connecting || !isFormValid}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {connecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" text={t('shop.connecting')}/>
                  {/* {t('shop.connecting')} */}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {t('shop.connectButton')}
                </>
              )}
            </button>

          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2">
                {t('shop.whatHappensNext')}
              </h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>{t('shop.ikasStep1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>{t('shop.ikasStep2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>{t('shop.ikasStep3')}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IkasConnectPage;
