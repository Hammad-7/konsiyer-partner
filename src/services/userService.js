/**
 * Service functions for user status and verification
 */

/**
 * Check if user has verified shops for conditional routing
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} User status information
 */
export const checkUserStatus = async (idToken) => {
  if (!idToken) {
    throw new Error('ID token is required');
  }

  // Use the correct Cloud Function URL for check_user_status
  const backendUrl = 'https://us-central1-sharp-footing-314502.cloudfunctions.net';
  
  try {
    const response = await fetch(`${backendUrl}/check_user_status`, {
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
      throw new Error(errorText || 'Failed to check user status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking user status:', error);
    throw error;
  }
};