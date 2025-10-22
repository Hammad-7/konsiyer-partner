import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  limit,
  startAfter,
  where
} from 'firebase/firestore';

/**
 * Check if a user has admin privileges
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>} - True if user is an admin
 */
export const isUserAdmin = async (userId) => {
  if (!userId) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.role === 'admin' || userData.isAdmin === true;
      return isAdmin;
    }
    
    return false;
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
