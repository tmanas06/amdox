import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { 
  firebaseLogin, 
  login, 
  register, 
  getCurrentUser, 
  logout as removeToken,
  getToken 
} from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a token
        const token = getToken();
        if (token) {
          // Try to get user from backend
          try {
            const response = await getCurrentUser();
            if (isMounted) {
              setUser(response.user);
            }
          } catch (err) {
            console.error('Failed to get current user:', err);
            // Token might be invalid, remove it
            removeToken();
            if (isMounted) {
              setUser(null);
            }
          }
        }

        // Listen to Firebase auth state changes
        // This handles Firebase Google sign-in
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (firebaseUser) {
            // User is signed in with Firebase
            // Only sync with backend if we don't already have a user from email/password
            if (!getToken()) {
              try {
                const response = await firebaseLogin(firebaseUser);
                if (isMounted) {
                  setUser(response.user);
                }
              } catch (err) {
                console.error('Failed to sync Firebase user with backend:', err);
                if (isMounted) {
                  setError(err.message || 'Failed to sync with backend');
                }
              }
            }
          } else {
            // User is signed out from Firebase
            // Only clear user if we don't have a token (email/password user)
            if (!getToken() && isMounted) {
              setUser(null);
            }
          }
          
          if (isMounted) {
            setLoading(false);
          }
        });

        // If we loaded user from token and Firebase has no user, we're done
        if (token && !auth.currentUser && isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in with Google using popup
   * @param {string} role - Optional role (job_seeker or employer)
   */
  const signInWithGoogle = async (role = null) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Send to backend
      const response = await firebaseLogin(firebaseUser, role);
      if (response && response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed';
      
      // Handle Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google using redirect
   * @param {string} role - Optional role (job_seeker or employer)
   */
  const signInWithGoogleRedirect = async (role = null) => {
    try {
      setError(null);
      // Store role in sessionStorage for after redirect
      if (role) {
        sessionStorage.setItem('pendingRole', role);
      }
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      const errorMessage = error.message || 'Google sign-in redirect failed';
      setError(errorMessage);
      throw error;
    }
  };

  /**
   * Email/password login
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await login(email, password);
      if (response && response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/password registration
   * @param {Object} userData - { email, password, confirmPassword, role, name, phone }
   */
  const registerWithEmail = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await register(userData);
      if (response && response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Sign out from Firebase if signed in
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      
      // Remove token
      removeToken();
      
      // Clear user state
      setUser(null);
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithGoogleRedirect,
    loginWithEmail,
    registerWithEmail,
    logout,
    isAuthenticated: !!user,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Provides access to auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
