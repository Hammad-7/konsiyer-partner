import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

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
