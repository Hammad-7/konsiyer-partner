import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  limit,
  startAfter,
  where,
  updateDoc,
  setDoc
} from 'firebase/firestore';

// Backend API endpoint
const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-sharp-footing-314502.cloudfunctions.net';

/**
 * Get ID token for authenticated requests
 * @private
 */
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken(true); // Force refresh to get latest custom claims
}

/**
 * Check admin status of current user via custom claims (SECURE)
 * 
 * This calls the backend to verify custom claims from JWT token.
 * 
 * @returns {Promise<{userId: string, isAdmin: boolean, isSuperAdmin: boolean, role: string}>}
 */
export const checkAdminStatus = async () => {
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_URL}/check_admin_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check admin status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw error;
  }
};

/**
 * Check if current user is super admin (SECURE)
 * @returns {Promise<boolean>} - True if user is the super admin
 */
export const isSuperAdmin = async () => {
  try {
    const status = await checkAdminStatus();
    return status.isSuperAdmin === true;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

/**
 * Check if a user has admin privileges (SECURE)
 * Note: For best security, components should use AuthContext instead
 * @param {string} userId - The user's UID (optional, uses current user if not provided)
 * @returns {Promise<boolean>} - True if user is an admin or super admin
 */
export const isUserAdmin = async (userId = null) => {
  try {
    const status = await checkAdminStatus();
    return status.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get all users in the system (admin only)
 * @param {number} pageSize - Number of users to fetch per page
 * @param {Object} lastDoc - Last document from previous page for pagination
 * @returns {Promise<Object>} - Object containing users array and lastDoc for pagination
 */
export const getAllUsers = async (pageSize = 50, lastDoc = null) => {
  try {
    const usersRef = collection(db, 'users');
    let usersQuery;
    
    if (lastDoc) {
      usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(usersQuery);
    const users = [];
    let newLastDoc = null;
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
      newLastDoc = doc;
    });
    
    return { users, lastDoc: newLastDoc, hasMore: users.length === pageSize };
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get detailed user information including all shops
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} - User data with shops
 */
export const getUserDetails = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    // Get user profile
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };
    
    // Get user's shops
    const shopsRef = collection(db, 'users', userId, 'shops');
    const shopsSnapshot = await getDocs(shopsRef);
    
    const shops = [];
    shopsSnapshot.forEach((doc) => {
      shops.push({
        id: doc.id,
        shopName: doc.id,
        ...doc.data()
      });
    });
    
    return {
      ...userData,
      shops
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

/**
 * Get all shops across all users (admin only)
 * @returns {Promise<Array>} - Array of all shops with owner info
 */
export const getAllShops = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const allShops = [];
    
    // For each user, get their shops
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      const shopsRef = collection(db, 'users', userId, 'shops');
      const shopsSnapshot = await getDocs(shopsRef);
      
      shopsSnapshot.forEach((shopDoc) => {
        allShops.push({
          id: shopDoc.id,
          shopName: shopDoc.id,
          userId,
          userEmail: userData.email || 'N/A',
          userName: userData.displayName || userData.email || 'Unknown',
          ...shopDoc.data()
        });
      });
    }
    
    // Sort by connection date (most recent first)
    allShops.sort((a, b) => {
      const dateA = a.connectedAt?.toDate?.() || new Date(0);
      const dateB = b.connectedAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    return allShops;
  } catch (error) {
    console.error('Error fetching all shops:', error);
    throw error;
  }
};

/**
 * Get shop details for a specific shop
 * @param {string} userId - The user's UID
 * @param {string} shopId - The shop ID
 * @returns {Promise<Object>} - Shop details with owner info
 */
export const getShopDetails = async (userId, shopId) => {
  if (!userId || !shopId) {
    throw new Error('User ID and Shop ID are required');
  }

  try {
    // Get shop data
    const shopRef = doc(db, 'users', userId, 'shops', shopId);
    const shopDoc = await getDoc(shopRef);
    
    if (!shopDoc.exists()) {
      throw new Error('Shop not found');
    }
    
    // Get user data
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return {
      id: shopDoc.id,
      shopName: shopDoc.id,
      userId,
      userEmail: userData.email || 'N/A',
      userName: userData.displayName || userData.email || 'Unknown',
      ...shopDoc.data()
    };
  } catch (error) {
    console.error('Error fetching shop details:', error);
    throw error;
  }
};

/**
 * Get system statistics (admin only)
 * @returns {Promise<Object>} - System statistics
 */
export const getSystemStats = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let totalUsers = 0;
    let totalShops = 0;
    let verifiedShops = 0;
    let adminUsers = 0;
    const shopTypeCount = {};
    
    for (const userDoc of usersSnapshot.docs) {
      totalUsers++;
      const userData = userDoc.data();
      
      if (userData.role === 'admin' || userData.isAdmin === true) {
        adminUsers++;
      }
      
      const shopsRef = collection(db, 'users', userDoc.id, 'shops');
      const shopsSnapshot = await getDocs(shopsRef);
      
      shopsSnapshot.forEach((shopDoc) => {
        totalShops++;
        const shopData = shopDoc.data();
        
        if (shopData.verified) {
          verifiedShops++;
        }
        
        const shopType = shopData.shopType || 'unknown';
        shopTypeCount[shopType] = (shopTypeCount[shopType] || 0) + 1;
      });
    }
    
    return {
      totalUsers,
      totalShops,
      verifiedShops,
      adminUsers,
      shopTypeCount,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

/**
 * Search users by email or name
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} - Array of matching users
 */
export const searchUsers = async (searchTerm) => {
  if (!searchTerm) return [];

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const email = (userData.email || '').toLowerCase();
      const displayName = (userData.displayName || '').toLowerCase();
      
      if (email.includes(lowerSearchTerm) || displayName.includes(lowerSearchTerm)) {
        users.push({
          id: doc.id,
          ...userData
        });
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Search shops by shop name or domain
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} - Array of matching shops
 */
export const searchShops = async (searchTerm) => {
  if (!searchTerm) return [];

  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const matchingShops = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      const shopsRef = collection(db, 'users', userId, 'shops');
      const shopsSnapshot = await getDocs(shopsRef);
      
      shopsSnapshot.forEach((shopDoc) => {
        const shopName = shopDoc.id.toLowerCase();
        
        if (shopName.includes(lowerSearchTerm)) {
          matchingShops.push({
            id: shopDoc.id,
            shopName: shopDoc.id,
            userId,
            userEmail: userData.email || 'N/A',
            userName: userData.displayName || userData.email || 'Unknown',
            ...shopDoc.data()
          });
        }
      });
    }
    
    return matchingShops;
  } catch (error) {
    console.error('Error searching shops:', error);
    throw error;
  }
};

/**
 * Get all admin users (super admin only) - Uses backend API
 * @returns {Promise<Array>} - Array of admin users
 */
export const getAllAdmins = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const idToken = await currentUser.getIdToken();
    
    const response = await fetch(`${FUNCTIONS_URL}/get_all_admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch admins');
    }

    const data = await response.json();
    return data.admins || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Promote a user to admin (Super Admin Only) - SECURE
 * @param {string} targetUserId - The user ID to make admin
 * @param {string} _currentUserId - Deprecated parameter, kept for backward compatibility
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const addAdmin = async (targetUserId, _currentUserId = null) => {
  // Support old signature: addAdmin(currentUserId, targetUserId)
  // and new signature: addAdmin(targetUserId)
  const actualTargetId = _currentUserId || targetUserId;
  
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_URL}/add_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        targetUserId: actualTargetId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add admin');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

/**
 * Alias for addAdmin - Promote a user to admin
 * @param {string} targetUserId - UID of user to promote
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const promoteToAdmin = async (targetUserId) => {
  return await addAdmin(targetUserId);
};

/**
 * Remove admin privileges from a user (Super Admin Only) - SECURE
 * @param {string} targetUserId - The admin user ID to demote
 * @param {string} _currentUserId - Deprecated parameter, kept for backward compatibility
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const removeAdmin = async (targetUserId, _currentUserId = null) => {
  // Support old signature: removeAdmin(currentUserId, targetUserId)
  // and new signature: removeAdmin(targetUserId)
  const actualTargetId = _currentUserId || targetUserId;
  
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_URL}/remove_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        targetUserId: actualTargetId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove admin');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing admin:', error);
    throw error;
  }
};

/**
 * Alias for removeAdmin - Demote an admin to regular user
 * @param {string} targetUserId - UID of admin to demote
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const demoteAdmin = async (targetUserId) => {
  return await removeAdmin(targetUserId);
};

/**
 * Initialize super admin (ONE TIME ONLY)
 * @param {string} secret - Secret key for initialization
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const initializeSuperAdmin = async (secret) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/init_super_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize super admin');
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing super admin:', error);
    throw error;
  }
};

/**
 * Search for users to add as admin (by email or user ID)
 * @param {string} searchTerm - Email or user ID to search for
 * @returns {Promise<Array>} - Array of matching non-admin users
 */
export const searchUsersForAdmin = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const matchingUsers = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const email = (userData.email || '').toLowerCase();
      const userId = doc.id.toLowerCase();
      const displayName = (userData.displayName || '').toLowerCase();
      
      // Check if user matches search and is not already an admin
      const isAdminUser = userData.role === 'admin' || 
                         userData.role === 'super_admin' ||
                         userData.isAdmin === true ||
                         userData.isSuperAdmin === true;
      
      if (!isAdminUser && 
          (email.includes(lowerSearchTerm) || 
           userId.includes(lowerSearchTerm) ||
           displayName.includes(lowerSearchTerm))) {
        matchingUsers.push({
          id: doc.id,
          email: userData.email || 'N/A',
          displayName: userData.displayName || 'N/A',
          createdAt: userData.createdAt
        });
      }
    });
    
    return matchingUsers.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching users for admin:', error);
    throw error;
  }
};
