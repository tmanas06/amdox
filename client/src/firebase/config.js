import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC0mapz7fR6aY_OxwnRX31RYWiDQyqsTBs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "amdox-f2995.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "amdox-f2995",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "amdox-f2995.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "432230585932",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:432230585932:web:7d2620e27d4469496906e9",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DCPYYNX5BN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { analytics };
export default app;
