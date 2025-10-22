import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShopDetails } from '../../services/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const ShopDetails = () => {
  const { userId, shopId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShopDetails();
  }, [userId, shopId]);

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const shopData = await getShopDetails(userId, shopId);
      setShop(shopData);
    } catch (error) {
      console.error('Error loading shop details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading shop details..." />
      </div>
    );
  }

  if (error) {
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

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Shop Not Found</h3>
            <p className="text-gray-600 mb-4">The requested shop could not be found.</p>
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
          <Button variant="outline" onClick={() => navigate('/admin')} className="mb-4">
            ← Back to Admin Panel
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.shopName}</h1>
              <p className="text-gray-600">Detailed shop information</p>
            </div>
            <Badge variant={shop.verified ? 'default' : 'outline'} className="text-lg px-4 py-2">
              {shop.verified ? 'Verified ✓' : 'Unverified ✗'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shop Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Shop ID</dt>
                    <dd className="text-gray-900 font-mono text-sm">{shop.id}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Shop Name</dt>
                    <dd className="text-gray-900 font-semibold">{shop.shopName}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Platform Type</dt>
                    <dd>
                      <Badge variant="secondary">
                        {shop.shopType || 'unknown'}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Verification Status</dt>
                    <dd>
                      <Badge variant={shop.verified ? 'default' : 'outline'}>
                        {shop.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Connected At</dt>
                    <dd className="text-gray-900">{formatDate(shop.connectedAt)}</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-gray-600 font-medium">Last Updated</dt>
                    <dd className="text-gray-900">{formatDate(shop.updatedAt)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Shopify Specific Data */}
            {shop.shopType === 'shopify' && (shop.accessToken || shop.scope) && (
              <Card>
                <CardHeader>
                  <CardTitle>Shopify Integration Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {shop.accessToken && (
                      <div className="flex justify-between py-3 border-b">
                        <dt className="text-gray-600 font-medium">Access Token</dt>
                        <dd className="text-gray-900 font-mono text-xs">
                          {shop.accessToken.substring(0, 20)}...
                        </dd>
                      </div>
                    )}
                    {shop.scope && (
                      <div className="py-3">
                        <dt className="text-gray-600 font-medium mb-2">API Scopes</dt>
                        <dd className="flex flex-wrap gap-2">
                          {shop.scope.split(',').map((scope, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {scope.trim()}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Additional Shop Data */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(shop, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Owner Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{shop.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{shop.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">User ID</label>
                    <p className="font-mono text-xs break-all">{shop.userId}</p>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => navigate(`/admin/users/${shop.userId}`)}
                  >
                    View Owner Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {shop.shopType === 'shopify' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`https://${shop.shopName}`, '_blank')}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Shop
                  </Button>
                )}
                {shop.shopType === 'ikas' && (
                  <Button 
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => navigate(`/admin/shops/${userId}/${shopId}/process-ikas`)}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Process
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(shop.id);
                    alert('Shop ID copied to clipboard!');
                  }}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Shop ID
                </Button>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Platform</span>
                    <Badge variant="secondary">{shop.shopType || 'unknown'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verified</span>
                    <Badge variant={shop.verified ? 'default' : 'outline'}>
                      {shop.verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {shop.shopType === 'shopify' && shop.accessToken && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Access</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
