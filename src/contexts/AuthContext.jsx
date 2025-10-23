import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { googleProvider } from '../firebase';

const AuthContext = createContext();

// Backend API endpoint
const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
  'https://us-central1-sharp-footing-314502.cloudfunctions.net';

// Token refresh interval (55 minutes - tokens expire in 1 hour)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customClaims, setCustomClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  const refreshTimerRef = useRef(null);
  
  /**
   * IMPORTANT: Sync user data from Firebase Auth to Firestore
   * This ensures email and displayName are always up-to-date in Firestore
   */
  const syncUserToFirestore = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      // Prepare user data from Firebase Auth
      const userData = {
        email: firebaseUser.email,
        userId: firebaseUser.uid,
        lastUpdated: serverTimestamp(),
      };
      
      // Add displayName if available
      if (firebaseUser.displayName) {
        userData.displayName = firebaseUser.displayName;
      }
      
      // Add photoURL if available
      if (firebaseUser.photoURL) {
        userData.photoURL = firebaseUser.photoURL;
      }
      
      if (userDoc.exists()) {
        // Update existing user document, but preserve important fields
        const existingData = userDoc.data();
        
        // Preserve role and admin fields (never overwrite these)
        if (existingData.role) userData.role = existingData.role;
        if (existingData.isAdmin !== undefined) userData.isAdmin = existingData.isAdmin;
        if (existingData.isSuperAdmin !== undefined) userData.isSuperAdmin = existingData.isSuperAdmin;
        if (existingData.customClaimsSet !== undefined) userData.customClaimsSet = existingData.customClaimsSet;
        if (existingData.promotedBy) userData.promotedBy = existingData.promotedBy;
        if (existingData.promotedAt) userData.promotedAt = existingData.promotedAt;
        if (existingData.createdAt) userData.createdAt = existingData.createdAt;
        
        await setDoc(userRef, userData, { merge: true });
      } else {
        // Create new user document
        userData.createdAt = serverTimestamp();
        userData.role = 'user'; // Default role
        await setDoc(userRef, userData);
      }
    } catch (error) {
      console.error('Error syncing user to Firestore:', error);
      // Don't throw error - we don't want to break auth flow
    }
  }, []);
  
  /**
   * SECURITY: Extract custom claims from ID token
   * Custom claims are set on the backend and cannot be manipulated by the client
   * They are cryptographically signed as part of the JWT token
   */
  const extractCustomClaims = useCallback(async (user) => {
    if (!user) {
      return null;
    }

    try {
      // Force refresh to get latest custom claims
      const idTokenResult = await user.getIdTokenResult(true);
      
      // Extract custom claims (these are SERVER-SET, not client-controlled)
      const claims = {
        admin: idTokenResult.claims.admin === true,
        superAdmin: idTokenResult.claims.superAdmin === true,
        role: idTokenResult.claims.role || 'user'
      };
      
      return claims;
    } catch (error) {
      console.error('Failed to extract custom claims:', error);
      // SECURITY: On error, assume no privileges
      return { admin: false, superAdmin: false, role: 'user' };
    }
  }, []);

  /**
   * SECURITY: Refresh ID token periodically to get updated custom claims
   * This ensures that if a user's role changes, it will be reflected
   */
  const setupTokenRefresh = useCallback((user) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    if (!user) return;

    // Set up periodic refresh
    refreshTimerRef.current = setInterval(async () => {
      try {
        if (isMounted.current && auth.currentUser) {
          // Force token refresh
          await auth.currentUser.getIdToken(true);
          // Update custom claims
          const claims = await extractCustomClaims(auth.currentUser);
          if (isMounted.current) {
            setCustomClaims(claims);
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [extractCustomClaims]);

  /**
   * SECURITY: Clean up all sensitive state on logout or unmount
   */
  const cleanupAuthState = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    if (isMounted.current) {
      setUser(null);
      setCustomClaims(null);
      setAuthError(null);
    }
  }, []);

  /**
   * SECURITY: Handle auth state changes
   * This is the ONLY place where we set user/claims state
   */
  useEffect(() => {
    isMounted.current = true;
    let unsubscribe;

    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          // SECURITY: Always check if component is still mounted
          if (!isMounted.current) return;

          if (firebaseUser) {
            try {
              // Sync user data to Firestore (ensures email and displayName are up-to-date)
              await syncUserToFirestore(firebaseUser);
              
              // Extract custom claims from token
              const claims = await extractCustomClaims(firebaseUser);
              
              if (isMounted.current) {
                setUser(firebaseUser);
                setCustomClaims(claims);
                setAuthError(null);
                
                // Setup token refresh
                setupTokenRefresh(firebaseUser);
              }
            } catch (error) {
              console.error('Error processing user auth:', error);
              if (isMounted.current) {
                setAuthError('Authentication error');
                cleanupAuthState();
              }
            }
          } else {
            // User logged out
            cleanupAuthState();
          }

          if (isMounted.current) {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted.current) {
          setLoading(false);
          setAuthError('Failed to initialize authentication');
        }
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      cleanupAuthState();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [syncUserToFirestore, extractCustomClaims, setupTokenRefresh, cleanupAuthState]);

  /**
   * SECURITY: Sign in function with proper error handling
   */
  const signIn = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // After sign in, force refresh to get latest custom claims
      if (result.user) {
        await result.user.getIdToken(true);
      }
      
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  /**
   * SECURITY: Sign up function
   */
  const signUp = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  /**
   * SECURITY: Google sign in
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Force refresh to get custom claims
      if (result.user) {
        await result.user.getIdToken(true);
      }
      
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  /**
   * SECURITY: Sign out with complete state cleanup
   */
  const signOut = useCallback(async () => {
    try {
      setAuthError(null);
      await firebaseSignOut(auth);
      // State cleanup happens in onAuthStateChanged
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  /**
   * SECURITY: Get fresh ID token
   * IMPORTANT: This should be called before EVERY backend API request
   */
  const getIdToken = useCallback(async (forceRefresh = false) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Failed to get ID token:', error);
      throw new Error('Authentication token unavailable');
    }
  }, []);

  /**
   * SECURITY: Computed properties from custom claims
   * These are FOR UI DISPLAY ONLY - never use for authorization!
   */
  const isAdmin = customClaims?.admin === true || customClaims?.superAdmin === true;
  const isSuperAdmin = customClaims?.superAdmin === true;
  const userRole = customClaims?.role || 'user';

  // Context value
  const value = {
    // User data
    user,
    customClaims,
    
    // UI display flags (NOT for authorization!)
    isAdmin,
    isSuperAdmin,
    userRole,
    
    // Auth functions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getIdToken,
    
    // State
    loading,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
