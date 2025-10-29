import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShopDetails } from '../../services/adminService';
import { fetchIkasProducts, fetchIkasMerchant, validateAndRefreshToken } from '../../services/ikasService';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const IkasProcessingPipeline = () => {
  const { userId, shopId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(null);

  useEffect(() => {
    loadShopDetails();
  }, [userId, shopId]);

  // Calculate token age for display
  const getTokenAge = () => {
    if (!shop?.fetchedAt) return 'Unknown';
    
    try {
      const fetchedDate = shop.fetchedAt.toDate ? shop.fetchedAt.toDate() : new Date(shop.fetchedAt);
      const now = new Date();
      const hoursSinceFetch = (now - fetchedDate) / (1000 * 60 * 60);
      
      if (hoursSinceFetch < 1) {
        const minutes = Math.floor(hoursSinceFetch * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (hoursSinceFetch < 24) {
        const hours = Math.floor(hoursSinceFetch);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(hoursSinceFetch / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const isTokenExpired = () => {
    if (!shop?.fetchedAt) return true;
    
    try {
      const fetchedDate = shop.fetchedAt.toDate ? shop.fetchedAt.toDate() : new Date(shop.fetchedAt);
      const now = new Date();
      const hoursSinceFetch = (now - fetchedDate) / (1000 * 60 * 60);
      return hoursSinceFetch > 4;
    } catch (error) {
      return true;
    }
  };

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const shopData = await getShopDetails(userId, shopId);
      
      // Verify it's an Ikas shop
      if (shopData.shopType !== 'ikas') {
        setError('This processing pipeline is only for Ikas shops');
        return;
      }
      
      setShop(shopData);
    } catch (error) {
      console.error('Error loading shop details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!shop || !shop.accessToken) {
      setError('Missing access token for this shop');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      console.log('🔍 Starting Ikas processing pipeline...');
      
      // Step 1: Validate and refresh token if needed
      console.log('📋 Step 1: Validating access token...');
      const validToken = await validateAndRefreshToken(userId, shopId, shop);
      console.log('✅ Token validated successfully');
      
      // Step 2: Fetch merchant information from Ikas API
      console.log('📋 Step 2: Fetching merchant information from Ikas API...');
      const merchantData = await fetchIkasMerchant(validToken);
      console.log('✅ Merchant information fetched successfully');
      console.log('🏪 Merchant Info:', merchantData);
      
      // Step 3: Fetch products from Ikas API using validated token
      console.log('📋 Step 3: Fetching products from Ikas API...');
      const data = await fetchIkasProducts(shop.shopName, validToken);
      console.log('✅ Products fetched successfully');
      
      setProductsData(data);
      
      // Reload shop details to get updated token if it was refreshed
      await loadShopDetails();
    } catch (error) {
      console.error('💥 Error processing Ikas products:', error);
      setError(error.message || 'Failed to fetch products from Ikas');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading shop details..." />
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Shop</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin')}>Back to Admin Panel</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/shops/${userId}/${shopId}`)} 
            className="mb-4"
          >
            ← Back to Shop Details
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ikas Processing Pipeline
              </h1>
              <p className="text-gray-600">Process and analyze {shop?.shopName} data</p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2 bg-purple-600">
              Ikas
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Processing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Processing Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Shop Name</h3>
                      <p className="text-gray-600">{shop?.shopName}</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Connection Status</h3>
                      <p className="text-gray-600">
                        {shop?.accessToken ? 'Access Token Available' : 'No Access Token'}
                      </p>
                    </div>
                    <Badge variant={shop?.accessToken ? 'default' : 'outline'}>
                      {shop?.accessToken ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>

                  {/* Token Age Display */}
                  {shop?.accessToken && (
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      isTokenExpired() ? 'bg-orange-50' : 'bg-green-50'
                    }`}>
                      <div>
                        <h3 className="font-semibold text-gray-900">Token Age</h3>
                        <p className="text-gray-600">Last fetched {getTokenAge()}</p>
                      </div>
                      <Badge variant={isTokenExpired() ? 'outline' : 'default'} className={
                        isTokenExpired() ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }>
                        {isTokenExpired() ? 'Will Refresh' : 'Valid'}
                      </Badge>
                    </div>
                  )}

                  {/* Process Button */}
                  <div className="pt-4">
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                      onClick={handleProcess}
                      disabled={processing || !shop?.accessToken}
                    >
                      {processing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Process Products
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Error Display */}
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
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            {productsData && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Total Products */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Total Products</p>
                          <p className="text-4xl font-bold mt-1">{productsData.totalProducts}</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-green-800">Products fetched successfully from Ikas API</p>
                      </div>
                    </div>

                    {/* Additional Data */}
                    {productsData.hasMore !== undefined && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">More Products Available</span>
                        <Badge variant={productsData.hasMore ? 'default' : 'secondary'}>
                          {productsData.hasMore ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shop Info */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Shop Name</label>
                    <p className="font-medium">{shop?.shopName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Shop Type</label>
                    <Badge variant="secondary" className="mt-1">Ikas</Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Owner</label>
                    <p className="font-medium">{shop?.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium text-sm">{shop?.userEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Info */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Fetch Products</p>
                      <p className="text-gray-500">Retrieve all products from Ikas API</p>
                    </div>
                  </div>
                  <div className="flex items-start opacity-50">
                    <div className="bg-gray-100 rounded-full p-1 mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Process Data</p>
                      <p className="text-gray-500">Coming soon...</p>
                    </div>
                  </div>
                  <div className="flex items-start opacity-50">
                    <div className="bg-gray-100 rounded-full p-1 mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Generate Analytics</p>
                      <p className="text-gray-500">Coming soon...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing</span>
                    <Badge variant={processing ? 'default' : 'secondary'}>
                      {processing ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Token Status</span>
                    <Badge variant={shop?.accessToken && !isTokenExpired() ? 'default' : 'outline'}>
                      {shop?.accessToken ? (isTokenExpired() ? 'Expired' : 'Valid') : 'None'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Products Loaded</span>
                    <Badge variant={productsData ? 'default' : 'outline'}>
                      {productsData ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IkasProcessingPipeline;
