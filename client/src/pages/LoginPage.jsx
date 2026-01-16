import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

/**
 * LoginPage Component - Amdox Jobs
 * Dark glassmorphism design with professional split layout
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts or when switching forms
  useEffect(() => {
    clearError();
    setFormError('');
  }, [showEmailForm, clearError]);

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    try {
      setFormError('');
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Google sign-in failed');
    }
  };

  /**
   * Handle Work Email button click
   */
  const handleWorkEmailClick = () => {
    setShowEmailForm(true);
  };

  /**
   * Handle email/password login form submission
   */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate inputs
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Login failed');
    }
  };

  const displayError = formError || error;

  return (
    <div className="amdox-page">
      {/* Header */}
      <header className="amdox-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="logo-box">
              <img src="/logo/logo.png" alt="Amdox Jobs Logo" className="logo-image" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Amdox Jobs™</h1>
              <p className="brand-subtitle">India's Fastest Tech Hiring Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="amdox-container">
        {/* Left Column - Hero Section (60%) */}
        <div className="hero-section-dark">
          <h2 className="hero-heading-dark">
            Find Your Next Tech Role
          </h2>
          
          <div className="hero-stats-dark">
            <div className="stat-item-dark">
              <div className="stat-bullet-dark"></div>
              <span className="stat-text-dark">500+ Live Tech Jobs from Top Companies</span>
            </div>
            <div className="stat-item-dark">
              <div className="stat-bullet-dark"></div>
              <span className="stat-text-dark">AI-Powered Job Matching</span>
            </div>
            <div className="stat-item-dark">
              <div className="stat-bullet-dark"></div>
              <span className="stat-text-dark">85% Placement Success Rate</span>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Card (40%) */}
        <div className="auth-section-dark">
          <div className="auth-card-dark">
            <h3 className="auth-title-dark">Welcome Back</h3>
            <p className="auth-subtitle-dark">
              Access saved jobs, applications, and recommendations
            </p>

            {/* Error message */}
            {displayError && (
              <div className="error-message-dark" role="alert">
                {displayError}
              </div>
            )}

            {/* Work Email Form or Button */}
            {!showEmailForm ? (
              <>
                <button
                  type="button"
                  onClick={handleWorkEmailClick}
                  disabled={loading}
                  className="work-email-btn-dark"
                >
                  Continue with Work Email
                </button>

                <div className="email-info-dark">
                  <span className="info-emoji">👨‍💼</span>
                  <span className="info-text-small">Company email → Employer</span>
                  <span className="info-separator">|</span>
                  <span className="info-emoji">👥</span>
                  <span className="info-text-small">Gmail → Job Seeker</span>
                </div>

                <div className="divider-dark">
                  <div className="divider-line"></div>
                  <span className="divider-text">or</span>
                  <div className="divider-line"></div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="google-btn-dark"
                >
                  <svg className="google-icon-dark" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? 'Signing in...' : 'Sign in with Google'}
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailLogin} className="email-form-dark">
                <div className="form-group-dark">
                  <label htmlFor="email">Work Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group-dark">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn-dark"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmail('');
                    setPassword('');
                    setFormError('');
                  }}
                  className="cancel-btn-dark"
                >
                  Back
                </button>
              </form>
            )}

            <div className="auth-footer-dark">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link-dark">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="amdox-footer">
        {/* Footer content can be added here in the future */}
      </footer>
    </div>
  );
};

export default LoginPage;
