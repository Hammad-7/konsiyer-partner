/**
 * Ikas API Service
 * Handles all interactions with the Ikas e-commerce platform API
 */

import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Refresh Ikas access token using client credentials
 * @param {string} shopName - The Ikas shop name
 * @param {string} clientId - The OAuth client ID
 * @param {string} clientSecret - The OAuth client secret
 * @returns {Promise<string>} - New access token
 */
export const refreshIkasToken = async (shopName, clientId, clientSecret) => {
  if (!shopName || !clientId || !clientSecret) {
    throw new Error('Shop name, client ID, and client secret are required');
  }

  try {
    console.log(`🔄 Refreshing access token for Ikas shop: ${shopName}`);
    
    // Construct the Ikas OAuth2 token endpoint
    const tokenUrl = `https://${shopName}.myikas.com/api/admin/oauth/token`;
    
    const tokenData = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    };
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(tokenData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Token refresh error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }
    
    const tokenJson = await response.json();
    const accessToken = tokenJson.access_token;
    
    if (!accessToken) {
      throw new Error('No access token in refresh response');
    }
    
    console.log('✅ Successfully refreshed access token');
    return accessToken;
  } catch (error) {
    console.error('💥 Error refreshing Ikas token:', error);
    throw error;
  }
};

/**
 * Update shop's access token and timestamp in Firestore
 * @param {string} userId - User ID
 * @param {string} shopId - Shop ID
 * @param {string} accessToken - New access token
 * @returns {Promise<void>}
 */
export const updateShopToken = async (userId, shopId, accessToken) => {
  try {
    const shopRef = doc(db, 'users', userId, 'shops', shopId);
    await updateDoc(shopRef, {
      accessToken,
      fetchedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Updated access token in Firestore');
  } catch (error) {
    console.error('💥 Error updating token in Firestore:', error);
    throw error;
  }
};

/**
 * Check if token needs refresh (older than 4 hours)
 * @param {Object} fetchedAt - Firestore timestamp of last token fetch
 * @returns {boolean} - True if token needs refresh
 */
export const shouldRefreshToken = (fetchedAt) => {
  if (!fetchedAt) {
    console.log('⚠️ No fetchedAt timestamp, token needs refresh');
    return true;
  }
  
  try {
    const fetchedDate = fetchedAt.toDate ? fetchedAt.toDate() : new Date(fetchedAt);
    const now = new Date();
    const hoursSinceFetch = (now - fetchedDate) / (1000 * 60 * 60);
    
    console.log(`⏰ Token age: ${hoursSinceFetch.toFixed(2)} hours`);
    
    if (hoursSinceFetch > 4) {
      console.log('⚠️ Token is older than 4 hours, needs refresh');
      return true;
    }
    
    console.log('✅ Token is still valid');
    return false;
  } catch (error) {
    console.error('Error checking token age:', error);
    return true; // Refresh on error to be safe
  }
};

/**
 * Validate and refresh token if needed
 * @param {string} userId - User ID
 * @param {string} shopId - Shop ID
 * @param {Object} shopData - Shop data from Firestore
 * @returns {Promise<string>} - Valid access token
 */
export const validateAndRefreshToken = async (userId, shopId, shopData) => {
  const { accessToken, fetchedAt, clientId, clientSecret, shopName } = shopData;
  
  // Check if token needs refresh
  if (!shouldRefreshToken(fetchedAt)) {
    console.log('✅ Using existing access token');
    return accessToken;
  }
  
  // Verify we have credentials to refresh
  if (!clientId || !clientSecret || !shopName) {
    throw new Error('Missing client credentials for token refresh');
  }
  
  // Refresh the token
  console.log('🔄 Refreshing expired token...');
  const newAccessToken = await refreshIkasToken(shopName, clientId, clientSecret);
  
  // Update in Firestore
  await updateShopToken(userId, shopId, newAccessToken);
  
  return newAccessToken;
};

/**
 * Fetch products from Ikas API using GraphQL
 * @param {string} shopName - The Ikas shop name (not used for GraphQL endpoint)
 * @param {string} accessToken - The OAuth access token
 * @param {number} limit - Number of products to fetch (default: 100)
 * @returns {Promise<Object>} - Object containing total products count and products array
 */
export const fetchIkasProducts = async (shopName, accessToken, limit = 100) => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    // Ikas uses a centralized GraphQL endpoint
    const apiUrl = 'https://api.myikas.com/api/v1/admin/graphql';

    console.log("shopName:", shopName);
    
    console.log(`🔍 Fetching products from Ikas GraphQL API: ${apiUrl}`);
    console.log("Using access token:", accessToken);
    
    // GraphQL query to list products
    const graphqlQuery = {
      query: `{
        listProduct {
          data {
            id
            attributes{
            imageIds
            value
            }
            baseUnit{
            baseAmount
            type
            unitId
            }
            brand{
            id
            name
            }
            categories{
            id
            name
            parentId
            }
            description
            dynamicPriceListIds
            googleTaxonomyId
            metaData {
            id
            canonicals
            description
            disableIndex
            pageTitle
            redirectTo
            slug
            targetId
            targetType
            }
            name
            shortDescription
            tagIds
            tags{
            id
            name
            }
            type
            weight
          }
        }
      }`
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ikas API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch products from Ikas: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully fetched products from Ikas GraphQL API');
    console.log('📊 Response data:', result);
    
    // Extract data from GraphQL response
    const listProductData = result.data?.listProduct;
    const products = listProductData?.data || [];
    const pagination = listProductData?.pagination;
    const totalProducts = pagination?.totalCount || products.length;
    const hasMore = pagination?.hasNextPage || false;
    
    return {
      totalProducts,
      products,
      hasMore,
      pagination,
      raw: result // Include raw data for debugging
    };
  } catch (error) {
    console.error('💥 Error fetching Ikas products:', error);
    throw error;
  }
};

/**
 * Fetch a single product from Ikas API using GraphQL
 * @param {string} shopName - The Ikas shop name (not used for GraphQL endpoint)
 * @param {string} accessToken - The OAuth access token
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} - Product data
 */
export const fetchIkasProduct = async (shopName, accessToken, productId) => {
  if (!accessToken || !productId) {
    throw new Error('Access token and product ID are required');
  }

  try {
    const apiUrl = 'https://api.myikas.com/api/v1/admin/graphql';
    
    console.log(`🔍 Fetching product ${productId} from Ikas GraphQL API`);
    
    const graphqlQuery = {
      query: `{
        listProduct(id: { eq: "${productId}" }) {
          data {
            id
            attributes{
            imageIds
            value
            }
            baseUnit{
            baseAmount
            type
            unitId
            }
            brand{
            id
            name
            }
            categories{
            id
            name
            parentId
            }
            description
            dynamicPriceListIds
            googleTaxonomyId
            metaData {
            id
            canonicals
            description
            disableIndex
            pageTitle
            redirectTo
            slug
            targetId
            targetType
            }
            name
            shortDescription
            tagIds
            tags{
            id
            name
            }
            type
            weight
          }
        }
      }`
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ikas API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch product from Ikas: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully fetched product from Ikas');
    
    const products = result.data?.listProduct?.data || [];
    return products.length > 0 ? products[0] : null;
  } catch (error) {
    console.error('💥 Error fetching Ikas product:', error);
    throw error;
  }
};

/**
 * Fetch orders from Ikas API using GraphQL
 * @param {string} shopName - The Ikas shop name (not used for GraphQL endpoint)
 * @param {string} accessToken - The OAuth access token
 * @param {number} limit - Number of orders to fetch
 * @returns {Promise<Object>} - Object containing orders data
 */
export const fetchIkasOrders = async (shopName, accessToken, limit = 100) => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    const apiUrl = 'https://api.myikas.com/api/v1/admin/graphql';
    
    console.log(`🔍 Fetching orders from Ikas GraphQL API`);
    
    const graphqlQuery = {
      query: `{
        listOrder {
          data {
            id
            orderNumber
            createdAt
            status
            total
          }
          pagination {
            totalCount
            page
            pageSize
            hasNextPage
          }
        }
      }`
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ikas API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch orders from Ikas: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully fetched orders from Ikas');
    
    const listOrderData = result.data?.listOrder;
    const orders = listOrderData?.data || [];
    const pagination = listOrderData?.pagination;
    const totalOrders = pagination?.totalCount || orders.length;
    
    return {
      totalOrders,
      orders,
      pagination,
      raw: result
    };
  } catch (error) {
    console.error('💥 Error fetching Ikas orders:', error);
    throw error;
  }
};

/**
 * Test Ikas API connection
 * @param {string} shopName - The Ikas shop name
 * @param {string} accessToken - The OAuth access token
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testIkasConnection = async (shopName, accessToken) => {
  try {
    // Try to fetch a small number of products to test the connection
    await fetchIkasProducts(shopName, accessToken, 1);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};
