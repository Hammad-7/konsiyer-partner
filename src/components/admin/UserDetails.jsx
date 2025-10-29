import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../services/adminService';
import { getOnboardingApplicationByUserId, formatBusinessType, formatPaymentMethod } from '../../services/onboardingService';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user data and onboarding application in parallel
      const [userData, onboardingApp] = await Promise.all([
        getUserDetails(userId),
        getOnboardingApplicationByUserId(userId)
      ]);
      
      setUser(userData);
      setOnboardingData(onboardingApp);
    } catch (error) {
      console.error('Error loading user details:', error);
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
        <LoadingSpinner size="xl" text="Loading user details..." />
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
            <h3 className="text-lg font-semibold mb-2">Error Loading User</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin')}>Back to Admin Panel</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
            <p className="text-gray-600 mb-4">The requested user could not be found.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
              <p className="text-gray-600">Detailed information about this user</p>
            </div>
            <Badge variant={user.role === 'admin' || user.isAdmin ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {user.role === 'admin' || user.isAdmin ? 'Admin' : 'User'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">User ID</dt>
                    <dd className="text-gray-900 font-mono text-sm">{user.id}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Email</dt>
                    <dd className="text-gray-900">{user.email || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Display Name</dt>
                    <dd className="text-gray-900">{user.displayName || onboardingData?.businessInfo?.name || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Role</dt>
                    <dd>
                      <Badge variant={user.role === 'admin' || user.isAdmin ? 'default' : 'secondary'}>
                        {user.role === 'admin' || user.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Phone Number</dt>
                    <dd className="text-gray-900">{user.phoneNumber || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Email Verified</dt>
                    <dd>
                      <Badge variant={user.emailVerified ? 'default' : 'outline'}>
                        {user.emailVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <dt className="text-gray-600 font-medium">Created At</dt>
                    <dd className="text-gray-900">{formatDate(user.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="text-gray-600 font-medium">Last Updated</dt>
                    <dd className="text-gray-900">{formatDate(user.updatedAt)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Business Information from Onboarding */}
            {onboardingData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Business Information
                      <Badge variant={
                        onboardingData.status === 'approved' ? 'default' :
                        onboardingData.status === 'pending_review' ? 'secondary' :
                        onboardingData.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {onboardingData.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex justify-between py-3 border-b">
                        <dt className="text-gray-600 font-medium">Business Type</dt>
                        <dd className="text-gray-900">{formatBusinessType(onboardingData.businessInfo?.type) || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <dt className="text-gray-600 font-medium">Business Name</dt>
                        <dd className="text-gray-900 font-semibold">{onboardingData.businessInfo?.name || 'N/A'}</dd>
                      </div>
                      {onboardingData.businessInfo?.legalStructure && (
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">Legal Structure</dt>
                          <dd className="text-gray-900">{onboardingData.businessInfo.legalStructure}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Address Information */}
                {onboardingData.addressInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Address Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">Street Address</dt>
                          <dd className="text-gray-900">{onboardingData.addressInfo.street || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">City</dt>
                          <dd className="text-gray-900">{onboardingData.addressInfo.city || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">State / Province</dt>
                          <dd className="text-gray-900">{onboardingData.addressInfo.state || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">Postal Code</dt>
                          <dd className="text-gray-900">{onboardingData.addressInfo.postalCode || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between py-3">
                          <dt className="text-gray-600 font-medium">Country</dt>
                          <dd className="text-gray-900">{onboardingData.addressInfo.country || 'N/A'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                )}

                {/* Tax Information */}
                {onboardingData.taxInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">Tax ID</dt>
                          <dd className="text-gray-900 font-mono">{onboardingData.taxInfo.taxId || 'N/A'}</dd>
                        </div>
                        {onboardingData.taxInfo.taxOffice && (
                          <div className="flex justify-between py-3">
                            <dt className="text-gray-600 font-medium">Tax Office</dt>
                            <dd className="text-gray-900">{onboardingData.taxInfo.taxOffice}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Information */}
                {onboardingData.paymentInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between py-3 border-b">
                          <dt className="text-gray-600 font-medium">Payment Method</dt>
                          <dd className="text-gray-900">{formatPaymentMethod(onboardingData.paymentInfo.method) || 'N/A'}</dd>
                        </div>
                        {onboardingData.paymentInfo.bankDetails && (
                          <>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600 font-medium">Bank Name</dt>
                              <dd className="text-gray-900">{onboardingData.paymentInfo.bankDetails.bankName || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600 font-medium">IBAN</dt>
                              <dd className="text-gray-900 font-mono">{onboardingData.paymentInfo.bankDetails.iban || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between py-3">
                              <dt className="text-gray-600 font-medium">Account Holder</dt>
                              <dd className="text-gray-900">{onboardingData.paymentInfo.bankDetails.accountHolder || 'N/A'}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Show message if no onboarding data */}
            {!onboardingData && (
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No onboarding application found</p>
                    <p className="text-sm mt-2">User has not completed the onboarding process yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Shops Sidebar */}
          <div className="lg:col-span-1">
            {/* Onboarding Status Card */}
            {onboardingData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Onboarding Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={
                        onboardingData.status === 'approved' ? 'default' :
                        onboardingData.status === 'pending_review' ? 'secondary' :
                        onboardingData.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {onboardingData.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted</span>
                      <span className="text-sm">{formatDate(onboardingData.submittedAt) || 'N/A'}</span>
                    </div>
                    {onboardingData.autoApproved && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-Approved</span>
                        <Badge variant="outline" className="text-xs">Yes</Badge>
                      </div>
                    )}
                    {onboardingData.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reviewed</span>
                        <span className="text-sm">{formatDate(onboardingData.reviewedAt)}</span>
                      </div>
                    )}
                    {onboardingData.rejectionReason && (
                      <div className="pt-3 border-t">
                        <span className="text-gray-600 text-sm font-medium">Rejection Reason:</span>
                        <p className="text-sm text-red-600 mt-1">{onboardingData.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Connected Shops ({user.shops?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.shops || user.shops.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>No shops connected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.shops.map((shop) => (
                      <div 
                        key={shop.id} 
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/admin/shops/${user.id}/${shop.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate flex-1">{shop.shopName}</h4>
                          <Badge variant={shop.verified ? 'default' : 'outline'} className="ml-2">
                            {shop.verified ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {shop.shopType || 'unknown'}
                            </Badge>
                          </div>
                          <div>
                            Connected: {formatDate(shop.connectedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shops</span>
                    <span className="font-bold">{user.shops?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified Shops</span>
                    <span className="font-bold">
                      {user.shops?.filter(s => s.verified).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shopify Shops</span>
                    <span className="font-bold">
                      {user.shops?.filter(s => s.shopType === 'shopify').length || 0}
                    </span>
                  </div>
                  {onboardingData && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Onboarding</span>
                          <Badge variant={onboardingData.status === 'approved' ? 'default' : 'outline'} className="text-xs">
                            {onboardingData.status === 'approved' ? 'Complete' : 'Incomplete'}
                          </Badge>
                        </div>
                      </div>
                    </>
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

export default UserDetails;
