import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';

const ConnectShopPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleShopifyClick = () => {
    navigate('/connect/shopify');
  };

  const handleOtherShopsClick = () => {
    navigate('/connect/other');
  };

  const handleIkasClick = () => {
    navigate('/connect/ikas');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('shop.connectTitle')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('shop.chooseConnectionMethod')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          {/* Shopify Store Option */}
          <div 
            onClick={handleShopifyClick}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-200"
          >
            <div className="text-center">
              {/* Shopify Logo */}
              <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6">
                <img src={'/icons/shopify_glyph.svg'} alt="Shopify" className="h-20 w-20" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('shop.shopifyStore')}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('shop.shopifyDescription')}
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-green-800">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">{t('shop.automaticIntegration')}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                onClick={handleShopifyClick}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {t('shop.connectButton')} Shopify
              </button>
            </div>
          </div>

          {/* Ikas Store Option */}
          <div 
            onClick={handleIkasClick}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-center">
              {/* Ikas Logo */}
              <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6">
                <img src={'/icons/ikas_icon.png'} alt="Ikas" className="h-20 w-20" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('shop.ikasStore')}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('shop.ikasDescription')}
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-purple-800">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-sm font-medium">{t('shop.apiBasedConnection')}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                onClick={handleIkasClick}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {t('shop.connectButton')} Ikas
              </button>
            </div>
          </div>

          {/* Other Shops Option */}
          <div 
            onClick={handleOtherShopsClick}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              {/* Generic Shop Icon */}
              <div className="mx-auto h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('shop.otherShops')}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('shop.otherShopsDescription')}
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-blue-800">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-sm font-medium">{t('shop.supportedFormats')}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                onClick={handleOtherShopsClick}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {t('shop.uploadFiles')}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('common.needHelp')}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('shop.platformSupportInfo')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectShopPage;