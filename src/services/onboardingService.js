import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * SECURITY: Onboarding Service
 * 
 * This service handles secure storage and retrieval of shop onboarding data.
 * All data is stored with strict UID-based access control enforced by Firestore rules.
 * 
 * Data Structure:
 * /onboarding_applications/{userId} - One application per user
 *   - userId: string (owner's UID)
 *   - status: 'draft' | 'pending_review' | 'approved' | 'rejected'
 *   - businessInfo: { type, name, legalStructure }
 *   - addressInfo: { street, city, state, postalCode, country }
 *   - taxInfo: { taxId, taxOffice }
 *   - paymentInfo: { method, bankDetails, cardToken }
 *   - currentStep: number (for resume functionality)
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 *   - submittedAt: timestamp (when moved to pending_review)
 *   - reviewedAt: timestamp (when approved/rejected)
 *   - reviewedBy: string (admin UID)
 *   - rejectionReason: string (if rejected)
 */

/**
 * Get the current user's onboarding application
 * @returns {Promise<Object|null>} - Onboarding data or null if not found
 */
export const getOnboardingApplication = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const appRef = doc(db, 'onboarding_applications', user.uid);
    const appDoc = await getDoc(appRef);
    
    if (appDoc.exists()) {
      return {
        id: appDoc.id,
        ...appDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching onboarding application:', error);
    throw error;
  }
};

/**
 * Create or update onboarding application (auto-save)
 * @param {Object} data - Partial onboarding data to save
 * @param {number} currentStep - Current step number (for resume)
 * @returns {Promise<Object>} - Result of the operation
 */
export const saveOnboardingDraft = async (data, currentStep = 1) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const appRef = doc(db, 'onboarding_applications', user.uid);
    const appDoc = await getDoc(appRef);
    
    const updateData = {
      ...data,
      userId: user.uid,
      currentStep,
      status: 'draft',
      updatedAt: serverTimestamp()
    };
    
    if (!appDoc.exists()) {
      // Create new application
      updateData.createdAt = serverTimestamp();
      await setDoc(appRef, updateData);
    } else {
      // Update existing application
      await updateDoc(appRef, updateData);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving onboarding draft:', error);
    throw error;
  }
};

/**
 * Submit onboarding application (auto-approved for immediate use)
 * @param {Object} completeData - Complete onboarding data
 * @returns {Promise<Object>} - Result of the operation
 */
export const submitOnboardingApplication = async (completeData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate complete data
  const validationError = validateOnboardingData(completeData);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const appRef = doc(db, 'onboarding_applications', user.uid);
    
    const submissionData = {
      ...completeData,
      userId: user.uid,
      status: 'approved', // Auto-approve immediately
      currentStep: 3, // Completed all steps (3-step flow)
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      autoApproved: true, // Flag to indicate this was auto-approved
      approvedAt: serverTimestamp() // Set approval timestamp
    };
    
    // Check if this is first submission
    const appDoc = await getDoc(appRef);
    if (!appDoc.exists()) {
      submissionData.createdAt = serverTimestamp();
    }
    
    await setDoc(appRef, submissionData);
    
    return { success: true, message: 'Information saved successfully' };
  } catch (error) {
    console.error('Error submitting onboarding application:', error);
    throw error;
  }
};

/**
 * Check if user has completed onboarding
 * @returns {Promise<boolean>} - True if onboarding is complete and approved
 */
export const hasCompletedOnboarding = async () => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  try {
    const app = await getOnboardingApplication();
    return app && app.status === 'approved';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Check if user has a pending onboarding application
 * @returns {Promise<boolean>} - Always returns false (no pending state without approval process)
 */
export const hasPendingOnboarding = async () => {
  // No pending state when auto-approving
  return false;
};

/**
 * Validate onboarding data completeness
 * @param {Object} data - Onboarding data to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateOnboardingData = (data) => {
  // Business Info validation
  // Require company legal name
  if (!data.businessInfo?.companyLegalName || data.businessInfo.companyLegalName.trim().length < 2) {
    return 'Company legal name is required (minimum 2 characters)';
  }
  
  // Require brand / business name
  if (!data.businessInfo?.name && !data.businessInfo?.brandName) {
    return 'Brand name is required';
  }
  if ((data.businessInfo?.name || data.businessInfo?.brandName) && (data.businessInfo.name || data.businessInfo.brandName).trim().length < 2) {
    return 'Brand name is required (minimum 2 characters)';
  }

  // Address validation
  if (!data.addressInfo?.street || data.addressInfo.street.trim().length < 5) {
    return 'Street address is required (minimum 5 characters)';
  }
  if (!data.addressInfo?.city || data.addressInfo.city.trim().length < 2) {
    return 'City is required';
  }
  if (!data.addressInfo?.state || data.addressInfo.state.trim().length < 2) {
    return 'State/Province is required';
  }
  // Postal code is now optional
  if (!data.addressInfo?.country || data.addressInfo.country.trim().length < 2) {
    return 'Country is required';
  }

  // Tax Info validation: Tax ID must be 10-11 digits
  const taxId = (data.taxInfo?.taxId || '').replace(/\s/g, '');
  if (!taxId) {
    return 'Tax ID is required';
  }
  if (!/^[0-9]{10,11}$/.test(taxId)) {
    return 'Tax ID must be 10–11 digits';
  }

  // Payment Info validation
  if (!data.paymentInfo?.method) {
    return 'Payment method is required';
  }
  
  // Bank transfer option removed in redesigned onboarding; no bank validation needed

  return null; // Valid
};

// ============================================================================
// ADMIN FUNCTIONS - Only accessible by users with admin custom claims
// ============================================================================

/**
 * Get all onboarding applications (Admin only)
 * @param {string} filterStatus - Optional status filter ('pending_review', 'approved', 'rejected', 'draft')
 * @returns {Promise<Array>} - Array of applications
 */
export const getAllOnboardingApplications = async (filterStatus = null) => {
  try {
    const appsRef = collection(db, 'onboarding_applications');
    let q;
    
    if (filterStatus) {
      q = query(appsRef, where('status', '==', filterStatus));
    } else {
      q = query(appsRef);
    }
    
    const snapshot = await getDocs(q);
    const applications = [];
    
    snapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by submission date (most recent first)
    applications.sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || a.updatedAt?.toDate?.() || new Date(0);
      const dateB = b.submittedAt?.toDate?.() || b.updatedAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    return applications;
  } catch (error) {
    console.error('Error fetching all applications:', error);
    throw error;
  }
};

/**
 * Get specific onboarding application by user ID (Admin only)
 * @param {string} userId - User's UID
 * @returns {Promise<Object|null>} - Application data or null
 */
export const getOnboardingApplicationByUserId = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const appRef = doc(db, 'onboarding_applications', userId);
    const appDoc = await getDoc(appRef);
    
    if (appDoc.exists()) {
      return {
        id: appDoc.id,
        ...appDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching application by user ID:', error);
    throw error;
  }
};

/**
 * Approve onboarding application (Admin only)
 * @param {string} userId - User's UID whose application to approve
 * @returns {Promise<Object>} - Result of the operation
 */
export const approveOnboardingApplication = async (userId) => {
  const admin = auth.currentUser;
  if (!admin) {
    throw new Error('Admin not authenticated');
  }

  try {
    const appRef = doc(db, 'onboarding_applications', userId);
    const appDoc = await getDoc(appRef);
    
    if (!appDoc.exists()) {
      throw new Error('Application not found');
    }

    await updateDoc(appRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: admin.uid,
      rejectionReason: null, // Clear any previous rejection
      updatedAt: serverTimestamp()
    });
    
    return { success: true, message: 'Application approved successfully' };
  } catch (error) {
    console.error('Error approving application:', error);
    throw error;
  }
};

/**
 * Reject onboarding application (Admin only)
 * @param {string} userId - User's UID whose application to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise<Object>} - Result of the operation
 */
export const rejectOnboardingApplication = async (userId, reason) => {
  const admin = auth.currentUser;
  if (!admin) {
    throw new Error('Admin not authenticated');
  }

  if (!reason || reason.trim().length < 10) {
    throw new Error('Rejection reason is required (minimum 10 characters)');
  }

  try {
    const appRef = doc(db, 'onboarding_applications', userId);
    const appDoc = await getDoc(appRef);
    
    if (!appDoc.exists()) {
      throw new Error('Application not found');
    }

    await updateDoc(appRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: admin.uid,
      rejectionReason: reason,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, message: 'Application rejected' };
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
};

/**
 * Get onboarding statistics (Admin only)
 * @returns {Promise<Object>} - Statistics object
 */
export const getOnboardingStatistics = async () => {
  try {
    const applications = await getAllOnboardingApplications();
    
    const stats = {
      total: applications.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      recentSubmissions: []
    };
    
    applications.forEach((app) => {
      switch (app.status) {
        case 'draft':
          stats.draft++;
          break;
        case 'pending_review':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
    });
    
    // Get 5 most recent submissions
    stats.recentSubmissions = applications
      .filter(app => app.status === 'pending_review')
      .slice(0, 5)
      .map(app => ({
        userId: app.userId,
        businessName: app.businessInfo?.name || 'N/A',
        submittedAt: app.submittedAt
      }));
    
    return stats;
  } catch (error) {
    console.error('Error fetching onboarding statistics:', error);
    throw error;
  }
};

/**
 * Helper: Format payment method for display
 * @param {string} method - Payment method code
 * @returns {string} - Formatted name
 */
export const formatPaymentMethod = (method) => {
  const methods = {
    'bank_transfer': 'Bank Transfer',
    'credit_card': 'Credit Card'
  };
  return methods[method] || method;
};

/**
 * Helper: Format business type for display
 * @param {string} type - Business type code
 * @returns {string} - Formatted name
 */
export const formatBusinessType = (type) => {
  const types = {
    'individual': 'Individual',
    'company': 'Company/Business Entity',
    'sole_proprietor': 'Sole Proprietor',
    'partnership': 'Partnership',
    'corporation': 'Corporation',
    'llc': 'Limited Liability Company (LLC)'
  };
  return types[type] || type;
};

/**
 * Helper: Get status badge color
 * @param {string} status - Application status
 * @returns {string} - Tailwind color class
 */
export const getStatusColor = (status) => {
  const colors = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending_review': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
