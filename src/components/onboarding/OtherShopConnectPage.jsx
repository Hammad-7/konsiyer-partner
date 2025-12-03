import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import { useShop } from '../../contexts/ShopContext';
import LoadingSpinner from '../LoadingSpinner';

const OtherShopConnectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { connectOtherShop, connecting } = useShop();
  
  const [shopName, setShopName] = useState('');
  const [xmlUrl, setXmlUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateXmlUrl = (url) => {
    if (!url) return 'Please enter an XML URL';
    
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.match(/^https?:$/)) {
        return 'URL must use HTTP or HTTPS protocol';
      }
      
      // Check if URL pathname contains .xml (supports query parameters)
      const pathname = urlObj.pathname.toLowerCase();
      if (!pathname.includes('.xml')) {
        return 'URL must point to an XML file';
      }
      
      return null;
    } catch (e) {
      return 'Please enter a valid URL';
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!shopName.trim()) {
      setError('Please enter your shop name');
      return;
    }
    
    const urlValidationError = validateXmlUrl(xmlUrl);
    if (urlValidationError) {
      setError(urlValidationError);
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await connectOtherShop(shopName.trim(), null, xmlUrl.trim());
      
      setSuccess(t('shop.connectionSuccess'));
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error connecting other shop:', err);
      setError(err.message || t('shop.connectionError'));
    }
  };

  const handleBackToOptions = () => {
    navigate('/connect');
  };

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
            <div className="mx-auto h-16 w-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect XML Feed
            </h1>
            <p className="text-gray-600">
              Enter your XML feed URL to connect your shop
            </p>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-6">
            
            {/* Shop Name Input */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                disabled={connecting}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                  connecting ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* XML URL Input */}
            <div>
              <label htmlFor="xmlUrl" className="block text-sm font-medium text-gray-700 mb-2">
                XML Feed URL
              </label>
              <input
                type="url"
                id="xmlUrl"
                value={xmlUrl}
                onChange={(e) => setXmlUrl(e.target.value)}
                placeholder="https://example.com/products.xml"
                disabled={connecting}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                  connecting ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the URL to your XML product feed
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            )}

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
              disabled={connecting || !shopName.trim() || !xmlUrl.trim()}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {connecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('shop.processing')}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                Important Information
              </h3>
              <div className="text-sm text-purple-700 space-y-2">
                <p>
                  • Your XML feed URL must be publicly accessible
                </p>
                <p>
                  • The URL must point to a valid XML file
                </p>
                <p>
                  • Each XML URL can only be used once
                </p>
                <p className="text-xs text-purple-600 mt-3">
                  Your data will be securely processed and stored.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OtherShopConnectPage;