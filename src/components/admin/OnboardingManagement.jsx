import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllOnboardingApplications,
  getOnboardingStatistics,
  approveOnboardingApplication,
  rejectOnboardingApplication,
  formatBusinessType,
  formatPaymentMethod,
  getStatusColor
} from '../../services/onboardingService';
import { getUserProfile } from '../../services/shopService';
import LoadingSpinner from '../LoadingSpinner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const OnboardingManagement = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending_review');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load applications and stats
  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appsData, statsData] = await Promise.all([
        getAllOnboardingApplications(filterStatus === 'all' ? null : filterStatus),
        getOnboardingStatistics()
      ]);
      
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load onboarding applications');
    } finally {
      setLoading(false);
    }
  };

  // View application details
  const handleViewApplication = async (app) => {
    try {
      // Fetch user profile for additional context
      const userProfile = await getUserProfile(app.userId);
      setSelectedApp({ ...app, userProfile });
      setShowModal(true);
    } catch (err) {
      console.error('Error loading application details:', err);
      setError('Failed to load application details');
    }
  };

  // Approve application
  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      setError(null);
      
      await approveOnboardingApplication(userId);
      
      setSuccess('Application approved successfully!');
      setShowModal(false);
      setSelectedApp(null);
      
      // Reload data
      await loadData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application
  const handleReject = async (userId) => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      setError('Rejection reason is required (minimum 10 characters)');
      return;
    }
    
    try {
      setActionLoading(true);
      setError(null);
      
      await rejectOnboardingApplication(userId, rejectionReason);
      
      setSuccess('Application rejected');
      setShowModal(false);
      setSelectedApp(null);
      setRejectionReason('');
      
      // Reload data
      await loadData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage shop onboarding requests</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Applications</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="text-sm text-yellow-700 mb-1">Pending Review</div>
              <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
            </Card>
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="text-sm text-green-700 mb-1">Approved</div>
              <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
            </Card>
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="text-sm text-red-700 mb-1">Rejected</div>
              <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {['all', 'pending_review', 'approved', 'rejected', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No applications found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.businessInfo?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {app.userId.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatBusinessType(app.businessInfo?.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.submittedAt || app.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        onClick={() => handleViewApplication(app)}
                        className="text-indigo-600 hover:text-indigo-900"
                        variant="link"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedApp(null);
                  setRejectionReason('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(selectedApp.status)} text-lg px-4 py-2`}>
                  {selectedApp.status.replace('_', ' ')}
                </Badge>
                <div className="text-sm text-gray-500">
                  Submitted: {formatDate(selectedApp.submittedAt || selectedApp.updatedAt)}
                </div>
              </div>

              {/* Business Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Business Type</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatBusinessType(selectedApp.businessInfo?.type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Business Name</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedApp.businessInfo?.name}
                    </dd>
                  </div>
                  {selectedApp.businessInfo?.legalStructure && (
                    <div className="col-span-2">
                      <dt className="text-sm text-gray-500">Legal Structure</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedApp.businessInfo.legalStructure}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Address Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Address</h3>
                <div className="text-sm text-gray-900">
                  <p>{selectedApp.addressInfo?.street}</p>
                  <p>{selectedApp.addressInfo?.city}, {selectedApp.addressInfo?.state} {selectedApp.addressInfo?.postalCode}</p>
                  <p>{selectedApp.addressInfo?.country}</p>
                </div>
              </Card>

              {/* Tax Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Tax ID</dt>
                    <dd className="text-sm font-medium text-gray-900 font-mono">
                      {selectedApp.taxInfo?.taxId}
                    </dd>
                  </div>
                  {selectedApp.taxInfo?.taxOffice && (
                    <div>
                      <dt className="text-sm text-gray-500">Tax Office</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedApp.taxInfo.taxOffice}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Payment Method</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatPaymentMethod(selectedApp.paymentInfo?.method)}
                    </dd>
                  </div>
                  {selectedApp.paymentInfo?.method === 'bank_transfer' && selectedApp.paymentInfo?.bankDetails && (
                    <>
                      <div>
                        <dt className="text-sm text-gray-500">Bank Name</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {selectedApp.paymentInfo.bankDetails.bankName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">IBAN</dt>
                        <dd className="text-sm font-medium text-gray-900 font-mono">
                          {selectedApp.paymentInfo.bankDetails.iban}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Account Holder</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {selectedApp.paymentInfo.bankDetails.accountHolder}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </Card>

              {/* Rejection Reason (if rejected) */}
              {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                <Card className="p-6 border-red-200 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-800">{selectedApp.rejectionReason}</p>
                </Card>
              )}

              {/* Action Buttons (only for pending applications) */}
              {selectedApp.status === 'pending_review' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Provide a detailed reason for rejection..."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleApprove(selectedApp.userId)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading ? 'Processing...' : '✓ Approve Application'}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedApp.userId)}
                      disabled={actionLoading || !rejectionReason}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {actionLoading ? 'Processing...' : '✕ Reject Application'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingManagement;
