# 🎨 Visual Development Mode Guide

This guide helps you switch between **Visual Development Mode** (mock authentication) and **Production Mode** (real authentication) for the AMDox Jobs application.

## 📋 Current Status

**✅ VISUAL DEVELOPMENT MODE ACTIVE**
- Authentication is mocked for UI development
- No backend connection required
- All authentication flows work with fake data
- Perfect for working on visuals, styling, and UX

---

## 🔄 How to Switch Modes

### 🎨 **Visual Development Mode** (Current)
**Use this when:** Working on UI, styling, layouts, components

**Features:**
- ✅ Auto-logged in as mock user
- ✅ All auth flows work (Google, email, registration)
- ✅ No backend/database required
- ✅ Console shows "🎨 Visual Development Mode" messages

### 🔧 **Production Mode** (Real Authentication)
**Use this when:** Testing real authentication, backend integration

**Features:**
- ✅ Real Firebase Google authentication
- ✅ Real email/password registration and login
- ✅ Backend API integration
- ✅ MongoDB database connection required

---

## 🔄 **Switch to Production Mode**

### Step 1: Restore Original AuthContext
Replace `client/src/context/AuthContext.jsx` with this content:

```jsx
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const token = getToken();
        if (token) {
          try {
            const response = await getCurrentUser();
            if (isMounted) {
              setUser(response.user);
            }
          } catch (err) {
            console.error('Failed to get current user:', err);
            removeToken();
            if (isMounted) {
              setUser(null);
            }
          }
        }

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (firebaseUser) {
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
            if (!getToken() && isMounted) {
              setUser(null);
            }
          }
          
          if (isMounted) {
            setLoading(false);
          }
        });

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

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async (role = null) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
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

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      
      removeToken();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
```

### Step 2: Ensure Backend is Running
Make sure your backend server is running and connected to MongoDB:

```bash
# In server directory
npm run dev
```

### Step 3: Restart Client
```bash
# In client directory
npm start
```

---

## 🎨 **Switch Back to Visual Development Mode**

### Quick Method:
Replace `client/src/context/AuthContext.jsx` with the current mock version (the one that's currently active).

### Or Use This Command:
```bash
# Copy the current mock version
cp client/src/context/AuthContext.jsx client/src/context/AuthContext.mock.jsx
```

---

## 📁 **File Backup Strategy**

### Current Files:
- `client/src/context/AuthContext.jsx` - **Mock version (Visual Development)**
- `client/src/context/AuthContext.production.jsx` - **Real version (Production)** *(create this)*

### Create Backup:
```bash
# Save current mock version
cp client/src/context/AuthContext.jsx client/src/context/AuthContext.mock.jsx

# Save production version (when you create it)
cp client/src/context/AuthContext.jsx client/src/context/AuthContext.production.jsx
```

### Quick Switch Commands:
```bash
# Switch to Visual Development Mode
cp client/src/context/AuthContext.mock.jsx client/src/context/AuthContext.jsx

# Switch to Production Mode  
cp client/src/context/AuthContext.production.jsx client/src/context/AuthContext.jsx
```

---

## 🔍 **How to Identify Current Mode**

### Visual Development Mode:
- ✅ Console shows: `🎨 Visual Development Mode: Authentication bypassed`
- ✅ Auto-logged in immediately
- ✅ Mock user data in profile
- ✅ No "Failed to fetch" errors

### Production Mode:
- ✅ Real login/registration forms work
- ✅ Firebase popup authentication
- ✅ Backend API calls
- ✅ Real user data from database

---

## 🚨 **Troubleshooting**

### If Visual Development Mode Doesn't Work:
1. Check console for `🎨 Visual Development Mode` messages
2. Ensure mock AuthContext is properly saved
3. Restart the client: `npm start`

### If Production Mode Doesn't Work:
1. Ensure backend server is running
2. Check MongoDB connection
3. Verify Firebase configuration
4. Check for "Failed to fetch" errors

---

## 📝 **Notes**

- **Visual Development Mode** is perfect for UI/UX work
- **Production Mode** is needed for real authentication testing
- Always backup your files before switching
- The current mode is clearly indicated in browser console

---

**Happy Development! 🚀**