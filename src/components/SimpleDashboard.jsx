import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from './LoadingSpinner';
import GtmStatusBanner from './shared/GtmStatusBanner';

const SimpleDashboard = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { hasConnectedShops, connectedShops, loading: shopLoading, finalizeShopifyConnection } = useShop();
  const navigate = useNavigate();
  const [finalizing, setFinalizing] = useState(false);
  const [finalizationError, setFinalizationError] = useState('');

  console.log("SimpleDashboard - hasConnectedShops:", hasConnectedShops);

  // Check for URL parameters (for Shopify callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const state = urlParams.get('state');
    
    if (shop && state && user) {
      // This is a Shopify callback - finalize the connection
      const handleFinalization = async () => {
        try {
          setFinalizing(true);
          setFinalizationError('');
          
          await finalizeShopifyConnection(shop, state);
          
          // Clean the URL
          window.history.replaceState({}, document.title, '/dashboard');
          
        } catch (error) {
          console.error('Error finalizing Shopify connection:', error);
          setFinalizationError(error.message || 'Failed to finalize connection');
        } finally {
          setFinalizing(false);
        }
      };
      
      handleFinalization();
    }
  }, [user, finalizeShopifyConnection]);

  // Redirect to onboarding if no connected shops and not finalizing
  useEffect(() => {
    if (!shopLoading && !hasConnectedShops && !finalizing && !finalizationError) {
      navigate('/connect');
    }
  }, [shopLoading, hasConnectedShops, navigate, finalizing, finalizationError]);

  // Show loading while checking shop status or finalizing connection
  if (shopLoading || finalizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner 
          size="xl" 
          text={finalizing ? t('common.finalizingShopConnection') : t('common.loadingDashboard')} 
        />
      </div>
    );
  }

  // Show finalization error
  if (finalizationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('common.connectionError')}
          </h2>
          <p className="text-gray-600 mb-6">
            {finalizationError}
          </p>
          <button
            onClick={() => {
              setFinalizationError('');
              navigate('/connect');
            }}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  console.log("connectedShops && connectedShops.length > 0 && connectedShops.some(shop => shop.shopType === 'ikas')", connectedShops && connectedShops.length > 0 && connectedShops.some(shop => shop.shopType === 'ikas'))

  // Simple dashboard showing shop connection status
  if (hasConnectedShops) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          
          {/* GTM Status Banner for Ikas stores */}
          {connectedShops && connectedShops.length > 0 && connectedShops.some(shop => shop.shopType === 'ikas') && (
            <GtmStatusBanner 
              shop={connectedShops.find(shop => shop.shopType === 'ikas')} 
            />
          )}

          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto h-20 w-20 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Main Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your shop is connected.
            </h1>
            
            {/* Additional Info */}
            <p className="text-lg text-gray-600 mb-6">
              Welcome back, {user?.email || 'User'}! Your shop integration is working perfectly.
            </p>
            
            {/* Connected Shops List */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Connected Shops ({connectedShops.length})
              </h2>
              <div className="space-y-3">
                {connectedShops.map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center">
                      {shop.shopType === 'shopify' ? (
                        <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.337 2.894c-.636-0.088-1.164 0.152-1.516 0.456-0.088 0.064-0.152 0.128-0.216 0.216-0.568-0.184-1.24-0.128-1.808 0.304-1.824 1.456-2.432 4.128-2.704 6.264-1.088 0.336-1.864 0.584-1.936 0.608-0.568 0.176-0.592 0.2-0.664 0.728-0.056 0.392-1.552 11.992-1.552 11.992l12.8 2.216 5.856-1.456c0 0-2.248-15.048-2.272-15.136-0.024-0.12-0.112-0.2-0.216-0.2-0.216 0-0.552 0-1.056 0 0-0.608-0.2-1.832-0.856-3.096zm-1.584 4.896c-0.352 0.104-0.76 0.232-1.2 0.368 0.192-1.512 0.64-2.992 1.2-3.992v3.624zm-2.928 0.888c0.424-0.128 0.888-0.272 1.392-0.432v4.32l-1.392-3.888zm2.928 1.2v3.816l-1.2-3.344c0.392-0.152 0.784-0.304 1.2-0.472zm1.536-4.68c0.512 0.928 0.768 1.776 0.832 2.328-0.312 0.096-0.648 0.2-1.008 0.312v-4.128c0.064 0.048 0.12 0.104 0.176 0.16z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{shop.shopName}</p>
                        <p className="text-sm text-gray-500 capitalize">{shop.shopType} store</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Button */}
            <button 
              onClick={() => navigate('/connect')}
              className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center mx-auto"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Connect Another Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This shouldn't happen as we redirect to /connect, but fallback just in case
  return null;
};

export default SimpleDashboard;