const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Auth Service
 * Handles all authentication API calls
 */

/**
 * Store JWT token in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Get JWT token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Firebase login - sends Firebase user data to backend
 * @param {Object} firebaseUser - Firebase user object with uid, email, displayName, photoURL
 * @param {string} role - Optional role (job_seeker or employer)
 * @returns {Promise<Object>} Response with token and user data
 */
export const firebaseLogin = async (firebaseUser, role = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        role: role
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Firebase login failed');
    }

    // Store token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Firebase login error:', error);
    throw error;
  }
};

/**
 * Email/password registration
 * @param {Object} userData - { email, password, confirmPassword, role, name, phone }
 * @returns {Promise<Object>} Response with token and user data
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Email/password login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Response with token and user data
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, remove it
      if (response.status === 401) {
        removeToken();
      }
      throw new Error(data.message || 'Failed to get user');
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Logout - removes token from localStorage
 */
export const logout = () => {
  removeToken();
};
