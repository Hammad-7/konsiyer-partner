import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Check if a user has any connected shops
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>} - True if user has connected shops
 */
export const userHasConnectedShops = async (userId) => {
  if (!userId) return false;

  try {
    const shopsRef = collection(db, 'users', userId, 'shops');
    const shopsQuery = query(shopsRef, where('verified', '==', true));
    const snapshot = await getDocs(shopsQuery);
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking connected shops:', error);
    return false;
  }
};

/**
 * Get all connected shops for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of connected shop objects
 */
export const getUserConnectedShops = async (userId) => {
  if (!userId) return [];

  try {
    const shopsRef = collection(db, 'users', userId, 'shops');
    const shopsQuery = query(shopsRef, where('verified', '==', true));
    const snapshot = await getDocs(shopsQuery);
    
    const shops = [];
    snapshot.forEach((doc) => {
      shops.push({
        id: doc.id,
        shopName: doc.id,
        ...doc.data()
      });
    });
    
    return shops;
  } catch (error) {
    console.error('Error fetching connected shops:', error);
    return [];
  }
};

/**
 * Create a new shop connection for a user
 * @param {string} userId - The user's UID
 * @param {string} shopName - The shop name/domain
 * @param {string} shopType - Type of shop ('shopify', 'other')
 * @param {Object} additionalData - Additional data to store
 * @returns {Promise<Object>} - Result of the operation
 */
export const createShopConnection = async (userId, shopName, shopType = 'shopify', additionalData = {}) => {
  if (!userId || !shopName) {
    throw new Error('User ID and shop name are required');
  }

  try {
    const shopRef = doc(db, 'users', userId, 'shops', shopName);
    const shopData = {
      verified: true,
      shopType,
      connectedAt: serverTimestamp(),
      ...additionalData
    };

    await setDoc(shopRef, shopData);
    
    return { success: true, shopData };
  } catch (error) {
    console.error('Error creating shop connection:', error);
    throw error;
  }
};

/**
 * Update shop connection status
 * @param {string} userId - The user's UID
 * @param {string} shopName - The shop name/domain
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Result of the operation
 */
export const updateShopConnection = async (userId, shopName, updates) => {
  if (!userId || !shopName) {
    throw new Error('User ID and shop name are required');
  }

  try {
    const shopRef = doc(db, 'users', userId, 'shops', shopName);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(shopRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating shop connection:', error);
    throw error;
  }
};

/**
 * Remove a shop connection
 * @param {string} userId - The user's UID
 * @param {string} shopName - The shop name/domain
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeShopConnection = async (userId, shopName) => {
  if (!userId || !shopName) {
    throw new Error('User ID and shop name are required');
  }

  try {
    const shopRef = doc(db, 'users', userId, 'shops', shopName);
    await deleteDoc(shopRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing shop connection:', error);
    throw error;
  }
};

/**
 * Get a specific shop connection
 * @param {string} userId - The user's UID
 * @param {string} shopName - The shop name/domain
 * @returns {Promise<Object|null>} - Shop data or null if not found
 */
export const getShopConnection = async (userId, shopName) => {
  if (!userId || !shopName) return null;

  try {
    const shopRef = doc(db, 'users', userId, 'shops', shopName);
    const shopDoc = await getDoc(shopRef);
    
    if (shopDoc.exists()) {
      return {
        id: shopDoc.id,
        shopName: shopDoc.id,
        ...shopDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching shop connection:', error);
    return null;
  }
};

/**
 * Check if a specific shop is already connected
 * @param {string} userId - The user's UID
 * @param {string} shopName - The shop name/domain
 * @returns {Promise<boolean>} - True if shop is connected
 */
export const isShopConnected = async (userId, shopName) => {
  if (!userId || !shopName) return false;

  try {
    const shop = await getShopConnection(userId, shopName);
    return shop && shop.verified;
  } catch (error) {
    console.error('Error checking if shop is connected:', error);
    return false;
  }
};

/**
 * Create or update user profile data
 * @param {string} userId - The user's UID
 * @param {Object} userData - User data to store
 * @returns {Promise<Object>} - Result of the operation
 */
export const createOrUpdateUserProfile = async (userId, userData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const profileData = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, profileData, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * @param {string} userId - The user's UID
 * @returns {Promise<Object|null>} - User profile data or null
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Validate Shopify domain format
 * @param {string} domain - The domain to validate
 * @returns {boolean} - True if valid Shopify domain
 */
export const isValidShopifyDomain = (domain) => {
  if (!domain) return false;
  const shopifyDomainPattern = /^[a-z0-9][a-z0-9\-]*\.myshopify\.com$/i;
  return shopifyDomainPattern.test(domain.trim());
};

/**
 * Normalize Shopify domain (ensure .myshopify.com suffix)
 * @param {string} input - The shop name or domain input
 * @returns {string} - Normalized domain
 */
export const normalizeShopifyDomain = (input) => {
  if (!input) return '';
  
  const trimmed = input.trim().toLowerCase();
  
  // If it already has .myshopify.com, return as is (after validation)
  if (trimmed.includes('.myshopify.com')) {
    return trimmed;
  }
  
  // If it's just the shop name, append .myshopify.com
  if (/^[a-z0-9][a-z0-9\-]*$/.test(trimmed)) {
    return `${trimmed}.myshopify.com`;
  }
  
  return trimmed;
};