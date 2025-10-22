/**
 * Service for affiliate statistics API calls
 */

// Use the same backend URL pattern as other services
const BACKEND_URL = 'https://us-central1-sharp-footing-314502.cloudfunctions.net';

/**
 * Fetch affiliate statistics from the backend for the authenticated user's shop
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} - Affiliate stats data for the user's shop
 */
export const fetchAffiliateStats = async (idToken) => {
  try {
    if (!idToken) {
      throw new Error('Authentication required: ID token is missing');
    }

    console.log('🔄 Fetching affiliate stats from backend...');
    
    const response = await fetch(`${BACKEND_URL}/fetch_affiliate_stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        idToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Affiliate stats fetched successfully:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching affiliate stats:', error);
    throw error;
  }
};

/**
 * Fetch affiliate stats with retry logic
 * @param {string} idToken - Firebase ID token
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - Affiliate stats data
 */
export const fetchAffiliateStatsWithRetry = async (idToken, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Fetching affiliate stats (attempt ${attempt}/${maxRetries})...`);
      return await fetchAffiliateStats(idToken);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Fetch affiliate stats for an authenticated Firebase user
 * Convenience function that handles ID token retrieval
 * @param {Object} firebaseUser - Firebase user object
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - Affiliate stats data
 */
export const fetchAffiliateStatsForUser = async (firebaseUser, maxRetries = 3) => {
  if (!firebaseUser) {
    throw new Error('Authentication required: Firebase user is required');
  }
  
  const idToken = await firebaseUser.getIdToken();
  return fetchAffiliateStatsWithRetry(idToken, maxRetries);
};