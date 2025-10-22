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
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const acceptedFileTypes = '.xml,.csv';
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    
    const allowedTypes = ['text/xml', 'application/xml', 'text/csv', 'application/csv'];
    const allowedExtensions = ['.xml', '.csv'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidType && !hasValidExtension) {
      return 'Please select a valid XML or CSV file';
    }
    
    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFileSelect = (file) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!shopName.trim()) {
      setError('Please enter your shop name');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await connectOtherShop(shopName.trim(), selectedFile);
      
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

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
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
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Other Shop
            </h1>
            <p className="text-gray-600">
              Upload your product data to connect your shop
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
                placeholder={t('shop.shopNamePlaceholder')}
                disabled={connecting}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  connecting ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Data File
              </label>
              
              {/* File Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : selectedFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                {selectedFile ? (
                  /* Selected File Display */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* File Upload Prompt */
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('shop.supportedFormats')}
                    </p>
                    <label htmlFor="fileInput" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      {t('shop.chooseFile')}
                    </label>
                    <input
                      type="file"
                      id="fileInput"
                      accept={acceptedFileTypes}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                Maximum file size: 10MB
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
              disabled={connecting || !shopName.trim() || !selectedFile}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {connecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('shop.processing')}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {t('shop.connectButton')}
                </>
              )}
            </button>

          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Supported File Formats
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div>
                  <strong>XML:</strong> Product catalog with structured data
                </div>
                <div>
                  <strong>CSV:</strong> Spreadsheet with product information
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  Your data will be securely processed and stored. We support standard e-commerce data formats.
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