import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeShopifyDomain, isValidShopifyDomain } from '../../services/shopService';
import LoadingSpinner from '../LoadingSpinner';

const ShopifyConnectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { connectShopify, connecting } = useShop();
  
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setShopDomain(value);
    setError('');
    setValidationError('');
    
    // Real-time validation
    if (value.trim()) {
      const normalized = normalizeShopifyDomain(value);
      if (!isValidShopifyDomain(normalized)) {
        setValidationError(t('shop.invalidShopDomain'));
      }
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!shopDomain.trim()) {
      setError('Please enter your shop domain');
      return;
    }

    const normalized = normalizeShopifyDomain(shopDomain.trim());
    
    if (!isValidShopifyDomain(normalized)) {
      setError(t('shop.invalidShopDomain'));
      return;
    }

    try {
      setError('');
      
      // This will redirect to Shopify OAuth
      const result = await connectShopify(normalized);
      
      if (result.redirecting) {
        // The user will be redirected to Shopify OAuth
        // After successful OAuth, they'll be redirected back to /dashboard
        return;
      }
      
    } catch (err) {
      console.error('Error connecting Shopify:', err);
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
            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6">
                <img src={'/icons/shopify_glyph.svg'} alt="Shopify" className="h-20 w-20" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Shopify Store
            </h1>
            <p className="text-gray-600">
              Enter your Shopify store information to get started
            </p>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-6">
            
            {/* Shop Domain Input */}
            <div>
              <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="shopDomain"
                  value={shopDomain}
                  onChange={handleInputChange}
                  placeholder={t('shop.shopifyInputPlaceholder')}
                  disabled={connecting}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                    validationError ? 'border-red-300' : 'border-gray-300'
                  } ${connecting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                {connecting && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              
              {/* Validation Error */}
              {validationError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationError}
                </p>
              )}
              
              {/* Help Text */}
              <p className="mt-2 text-sm text-gray-500">
                Example: mystore.myshopify.com or just "mystore"
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
              disabled={connecting || !shopDomain.trim() || validationError}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {connecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('shop.connecting')}
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
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>You'll be redirected to Shopify to authorize the connection</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Grant permissions to access your store data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Return to your dashboard with your store connected</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopifyConnectPage;