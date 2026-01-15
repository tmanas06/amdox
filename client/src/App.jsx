import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

/**
 * Home/Dashboard Component (example)
 * Replace this with your actual dashboard/home page
 */
const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to AMDox Job Portal</h1>
        <div className="user-info">
          <p>Hello, {user?.profile?.name || user?.email}!</p>
          <p>Role: <strong>{user?.role}</strong></p>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      <main>
        <p>This is your dashboard. Build your job listing features here!</p>
      </main>
    </div>
  );
};

/**
 * Main App Component
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
