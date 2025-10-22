import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [connectedShops, setConnectedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Check if user has any connected shops
  const hasConnectedShops = connectedShops.length > 0;

  // Fetch user's connected shops from Firestore
  const fetchConnectedShops = async () => {
    if (!user) {
      console.log('❌ No user, clearing shops');
      setConnectedShops([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching connected shops for user:', user.uid);
      
      const shops = [];
      
      // First, check the main user document for quick verification
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📄 Main user document exists:', userData);
        
        if (userData.verified && userData.shop) {
          console.log('✅ Found verified shop in main document:', userData.shop);
          shops.push({
            id: userData.shop,
            shopName: userData.shop,
            shopType: 'shopify',
            verified: true,
            connectedAt: userData.lastUpdated,
            source: 'main-document'
          });
        } else {
          console.log('❌ Main document exists but no verified shop:', { verified: userData.verified, shop: userData.shop });
        }
      } else {
        console.log('❌ Main user document does not exist');
      }
      
      // Also check shops subcollection for any additional shops
      try {
        const shopsRef = collection(db, 'users', user.uid, 'shops');
        const snapshot = await getDocs(shopsRef);
        
        console.log('📦 Shops subcollection query result:', snapshot.size, 'documents');
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🏪 Shop document:', doc.id, data);
          
          if (data.verified) {
            // Avoid duplicates from main document
            const existingShop = shops.find(shop => shop.id === doc.id);
            if (!existingShop) {
              shops.push({
                id: doc.id,
                shopName: doc.id,
                shopType: data.shopType || 'shopify',
                verified: true,
                connectedAt: data.verified_at || data.connectedAt,
                source: 'subcollection'
              });
            } else {
              console.log('🔄 Shop already exists from main document, skipping duplicate');
            }
          } else {
            console.log('❌ Shop not verified:', doc.id, data);
          }
        });
      } catch (subError) {
        console.error('Error fetching shops subcollection:', subError);
      }
      
      console.log('🎯 Final connected shops result:', shops.length, shops);
      setConnectedShops(shops);
    } catch (error) {
      console.error('Error fetching connected shops:', error);
      setConnectedShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new shop connection record
  const createShopConnection = async (shopName, shopType = 'shopify', additionalData = {}) => {
    if (!user) {
      throw new Error('User must be authenticated to connect a shop');
    }

    try {
      const shopRef = doc(db, 'users', user.uid, 'shops', shopName);
      const shopData = {
        verified: true,
        shopType,
        connectedAt: serverTimestamp(),
        userEmail: user.email,
        ...additionalData
      };

      await setDoc(shopRef, shopData);
      
      // Refresh the connected shops list
      await fetchConnectedShops();
      
      return { success: true, shopData };
    } catch (error) {
      console.error('Error creating shop connection:', error);
      throw error;
    }
  };

  // Connect to Shopify using the backend function
  const connectShopify = async (shopDomain) => {
    if (!shopDomain) {
      throw new Error('Shop domain is required');
    }

    // Validate shop domain format
    const shopifyDomainPattern = /^[a-z0-9][a-z0-9\-]*\.myshopify\.com$/i;
    if (!shopifyDomainPattern.test(shopDomain)) {
      throw new Error('Invalid Shopify domain format');
    }

    try {
      setConnecting(true);

      // Get the user's ID token for authentication
      const idToken = await user.getIdToken();

      // Call the backend Shopify auth function
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://shopify-auth-kh3i5xlqba-uc.a.run.app';
      console.log('🔗 Calling backend URL:', `${backendUrl}/shopify_auth`);
      
      const response = await fetch(`${backendUrl}/shopify_auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          shop: shopDomain.toLowerCase()
        })
      });

      console.log('📊 Response status:', response.status);

      if (response.status === 200) {
        // Parse the JSON response
        const data = await response.json();
        console.log('📄 Response data:', data);
        
        if (data.redirect_url) {
          console.log('✅ Got redirect URL, navigating to Shopify OAuth:', data.redirect_url);
          // Navigate to Shopify OAuth URL
          window.location.href = data.redirect_url;
          return { success: true, redirecting: true };
        } else if (data.already_verified || (data.message && data.message.includes('already verified'))) {
          console.log('✅ Shop already verified, refreshing connected shops');
          // Shop is already verified
          await fetchConnectedShops();
          return { success: true, alreadyConnected: true };
        } else {
          throw new Error(data.message || 'Unexpected response from backend');
        }
      } else {
        // Error response
        const errorText = await response.text();
        console.error('❌ Backend error response:', response.status, errorText);
        throw new Error(errorText || 'Failed to connect to Shopify');
      }

      return { success: true, redirecting: true };

    } catch (error) {
      console.error('Error connecting to Shopify:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  // Connect other shop types (with file upload)
  const connectOtherShop = async (shopName, file) => {
    if (!shopName || !file) {
      throw new Error('Shop name and file are required');
    }

    try {
      setConnecting(true);

      // For now, we'll create a basic connection record
      // In a real implementation, you'd upload the file to Firebase Storage
      // and process the XML/CSV data
      await createShopConnection(shopName, 'other', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      return { success: true };

    } catch (error) {
      console.error('Error connecting other shop:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  // Connect to Ikas using the backend function
  const connectIkas = async (shopName, clientId, clientSecret) => {
    if (!shopName || !clientId || !clientSecret) {
      throw new Error('Shop name, client ID, and client secret are required');
    }

    try {
      setConnecting(true);

      // Get the user's ID token for authentication
      const idToken = await user.getIdToken();

      // Call the backend Ikas connect function
      const backendUrl ='https://us-central1-sharp-footing-314502.cloudfunctions.net/ikas_connect';
      console.log('🔗 Calling backend URL:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          shop_name: shopName,
          client_id: clientId,
          client_secret: clientSecret,
          idToken
        })
      });

      console.log('📊 Response status:', response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log('📄 Response data:', data);
        
        if (data.success) {
          console.log('✅ Ikas shop connected successfully');
          // Refresh the connected shops list
          await fetchConnectedShops();
          return { success: true };
        } else {
          throw new Error(data.error || data.message || 'Failed to connect Ikas shop');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Backend error response:', response.status, errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.message || 'Failed to connect to Ikas');
        } catch (parseError) {
          throw new Error(errorText || 'Failed to connect to Ikas');
        }
      }

    } catch (error) {
      console.error('Error connecting to Ikas:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  // Finalize Shopify connection after OAuth redirect
  const finalizeShopifyConnection = async (shopDomain, state) => {
    console.log('🔧 finalizeShopifyConnection called with:', { shopDomain, state, hasUser: !!user });
    
    if (!user || !shopDomain || !state) {
      throw new Error('Missing required parameters for finalization');
    }

    try {
      console.log('🎫 Getting user ID token...');
      const idToken = await user.getIdToken();

      const finalizeUrl = 'https://shopify-finalize-kh3i5xlqba-uc.a.run.app';
      console.log('📡 Calling finalize endpoint:', finalizeUrl);
      
      const response = await fetch(finalizeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          idToken,
          state
        })
      });

      console.log('📊 Finalize response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Finalize error response:', errorText);
        throw new Error(errorText || 'Failed to finalize Shopify connection');
      }

      console.log('✅ Backend finalization successful, creating local connection...');
      // Create local connection record
      await createShopConnection(shopDomain, 'shopify');

      console.log('🎉 Shopify connection finalized successfully!');
      return { success: true };

    } catch (error) {
      console.error('💥 Error finalizing Shopify connection:', error);
      throw error;
    }
  };

  // Direct check for user verification status (for immediate use)
  const checkUserHasVerifiedShop = async () => {
    if (!user) return false;
    
    try {
      console.log('🔍 Direct check for verified shop for user:', user.uid);
      
      // Quick check of main user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📄 Direct check - user data:', userData);
        
        if (userData.verified && userData.shop) {
          console.log('✅ Direct check - found verified shop:', userData.shop);
          return true;
        }
      }
      
      // Also check subcollection quickly
      const shopsRef = collection(db, 'users', user.uid, 'shops');
      const snapshot = await getDocs(shopsRef);
      
      let hasVerifiedShop = false;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.verified) {
          console.log('✅ Direct check - found verified shop in subcollection:', doc.id);
          hasVerifiedShop = true;
        }
      });
      
      return hasVerifiedShop;
    } catch (error) {
      console.error('Error in direct shop check:', error);
      return false;
    }
  };

  // Reset shop connection state
  const resetShopState = () => {
    setConnectedShops([]);
    setLoading(false);
    setConnecting(false);
  };

  // Effect to fetch shops when user changes
  useEffect(() => {
    if (user) {
      fetchConnectedShops();
    } else {
      resetShopState();
    }
  }, [user]);

  const value = {
    connectedShops,
    hasConnectedShops,
    loading,
    connecting,
    fetchConnectedShops,
    checkUserHasVerifiedShop,
    connectShopify,
    connectOtherShop,
    connectIkas,
    finalizeShopifyConnection,
    createShopConnection,
    resetShopState
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};