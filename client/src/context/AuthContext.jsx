import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { firebaseLogin, login, register, getCurrentUser, logout as authLogout } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages authentication state with Firebase and backend integration
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in with Firebase, get backend user data
          const userData = await getCurrentUser();
          setUser(userData.user);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // If there's an error getting user data, sign out
        setUser(null);
        authLogout();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (role = null) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Send Firebase user data to backend
      const response = await firebaseLogin(firebaseUser, role);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/password login
   */
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await login(email, password);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Email login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/password registration
   */
  const registerWithEmail = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await register(userData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear backend token
      authLogout();
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
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
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;