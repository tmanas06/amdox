import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { user as userApi } from '../services/api';
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
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * Checks for existing token and Firebase auth state
   */
  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Check if we have a token
      const token = getToken();
      if (token) {
        // Try to get user from backend
        try {
          const response = await getCurrentUser();
          setUser(response.user);
        } catch (err) {
          // Token might be invalid, remove it
          removeToken();
        }
      }

      // Listen to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in with Firebase
          // Sync with backend
          try {
            const response = await firebaseLogin(firebaseUser);
            setUser(response.user);
          } catch (err) {
            console.error('Failed to sync Firebase user with backend:', err);
            setError(err.message);
          }
        } else {
          // User is signed out
          // Only clear user if we don't have a token (email/password user)
          if (!getToken()) {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

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
      setUser(response.user);

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Google sign-in failed';
      setError(errorMessage);
      throw error;
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
      setUser(response.user);

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
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
      setUser(response.user);

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
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

  /**
   * Update profile via backend and keep auth context in sync
   */
  const updateProfile = async (profileData) => {
    if (!user?.id) {
      throw new Error('User not loaded');
    }

    const response = await userApi.updateProfile(user.id, profileData);
    const updatedUser = {
      ...user,
      profile: response.data?.user?.profile || response.user?.profile || profileData,
    };
    setUser(updatedUser);
    return updatedUser;
  };

  /**
   * Upload resume or CV and get parsed profile suggestions
   */
  const uploadResume = async (file, type = 'resume') => {
    if (!user?.id) {
      throw new Error('User not loaded');
    }

    try {
      console.log(`📤 Uploading ${type}:`, file.name, file.type, file.size);
      const response = await userApi.uploadResume(user.id, file, type);
      console.log(`📥 ${type} upload response:`, response.data);

      const profile = response.data?.profile;

      if (!profile) {
        console.error('❌ No profile data in response:', response.data);
        throw new Error('Server did not return profile data');
      }

      console.log('✅ Parsed profile data:', profile);
      return profile;
    } catch (error) {
      console.error(`❌ ${type} upload error:`, error);
      throw error;
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
    updateProfile,
    uploadResume,
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
