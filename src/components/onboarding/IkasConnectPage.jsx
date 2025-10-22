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
  
  const [shopName, setShopName] = useState('');
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

  const handleShopNameChange = (e) => {
    const value = e.target.value;
    setShopName(value);
    setError('');
    validateField('shopName', value);
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
    const isShopNameValid = validateField('shopName', shopName);
    const isClientIdValid = validateField('clientId', clientId);
    const isClientSecretValid = validateField('clientSecret', clientSecret);

    if (!isShopNameValid || !isClientIdValid || !isClientSecretValid) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      
      const result = await connectIkas(
        shopName.trim(),
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

  const isFormValid = shopName.trim() && clientId.trim() && clientSecret.trim() && Object.keys(validationErrors).length === 0;

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
              Connect Ikas Store
            </h1>
            <p className="text-gray-600">
              Enter your Ikas store credentials to get started
            </p>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-6">
            
            {/* Shop Name Input */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={handleShopNameChange}
                  placeholder="example-store"
                  disabled={connecting}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                    validationErrors.shopName ? 'border-red-300' : 'border-gray-300'
                  } ${connecting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                {connecting && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              
              {/* Validation Error */}
              {validationErrors.shopName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.shopName}
                </p>
              )}
              
              {/* Help Text */}
              <p className="mt-2 text-sm text-gray-500">
                Your Ikas store name
              </p>
            </div>

            {/* Client ID Input */}
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={handleClientIdChange}
                  placeholder="Enter your Ikas Client ID"
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
                Client Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="clientSecret"
                  value={clientSecret}
                  onChange={handleClientSecretChange}
                  placeholder="Enter your Ikas Client Secret"
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
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('shop.connecting')}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Process
                </>
              )}
            </button>

          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>We'll verify your credentials with Ikas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Fetch your access token securely</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Connect your store to your dashboard</span>
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
