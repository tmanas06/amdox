import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

/**
 * Dashboard Component - Amdox Jobs
 * Role-based dashboard for Job Seekers and Employers
 */
const Dashboard = () => {
  const { user, logout } = useAuth();

  const isJobSeeker = user?.role === 'job_seeker';
  const isEmployer = user?.role === 'employer';

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="logo-box">
              <img src="/logo/logo.png" alt="Amdox Jobs Logo" className="logo-image" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Amdox Jobs™</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="user-profile">
              {user?.profile?.photoURL && (
                <img 
                  src={user.profile.photoURL} 
                  alt={user.profile.name || user.email}
                  className="profile-avatar"
                />
              )}
              <div className="user-details">
                <p className="user-name">{user?.profile?.name || user?.email}</p>
                <p className="user-role">
                  {isJobSeeker ? '👤 Job Seeker' : isEmployer ? '👔 Employer' : 'User'}
                </p>
              </div>
            </div>
            <button onClick={logout} className="logout-btn-dashboard">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2 className="welcome-title">
              {isJobSeeker 
                ? `Welcome back, ${user?.profile?.name || 'Job Seeker'}! 👋`
                : isEmployer
                ? `Welcome, ${user?.profile?.name || 'Employer'}! 👔`
                : 'Welcome!'
              }
            </h2>
            <p className="welcome-subtitle">
              {isJobSeeker
                ? 'Discover your next tech opportunity from 500+ live jobs'
                : isEmployer
                ? 'Manage your job postings and find the best tech talent'
                : 'Get started with Amdox Jobs'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {isJobSeeker ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon job-icon">💼</div>
                  <div className="stat-content">
                    <h3 className="stat-value">500+</h3>
                    <p className="stat-label">Live Tech Jobs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon application-icon">📝</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Applications</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon saved-icon">⭐</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Saved Jobs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon match-icon">🎯</div>
                  <div className="stat-content">
                    <h3 className="stat-value">85%</h3>
                    <p className="stat-label">Match Rate</p>
                  </div>
                </div>
              </>
            ) : isEmployer ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon job-icon">📋</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Active Jobs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon application-icon">📥</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Applications</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon candidate-icon">👥</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Candidates</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon views-icon">👁️</div>
                  <div className="stat-content">
                    <h3 className="stat-value">0</h3>
                    <p className="stat-label">Total Views</p>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              {isJobSeeker ? (
                <>
                  <button className="action-card">
                    <div className="action-icon">🔍</div>
                    <h4 className="action-title">Browse Jobs</h4>
                    <p className="action-desc">Explore 500+ tech jobs</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">💾</div>
                    <h4 className="action-title">Saved Jobs</h4>
                    <p className="action-desc">View your saved positions</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">📄</div>
                    <h4 className="action-title">My Applications</h4>
                    <p className="action-desc">Track your applications</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">⚙️</div>
                    <h4 className="action-title">Profile Settings</h4>
                    <p className="action-desc">Update your profile</p>
                  </button>
                </>
              ) : isEmployer ? (
                <>
                  <button className="action-card">
                    <div className="action-icon">➕</div>
                    <h4 className="action-title">Post a Job</h4>
                    <p className="action-desc">Create a new job listing</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">📋</div>
                    <h4 className="action-title">My Jobs</h4>
                    <p className="action-desc">Manage your job postings</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">📥</div>
                    <h4 className="action-title">Applications</h4>
                    <p className="action-desc">Review candidate applications</p>
                  </button>
                  <button className="action-card">
                    <div className="action-icon">⚙️</div>
                    <h4 className="action-title">Company Settings</h4>
                    <p className="action-desc">Update company profile</p>
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Recent Activity / Featured Jobs */}
          <div className="content-section">
            {isJobSeeker ? (
              <div className="featured-jobs">
                <h3 className="section-title">Featured Tech Jobs</h3>
                <div className="jobs-list">
                  <div className="job-card">
                    <div className="job-header">
                      <h4 className="job-title">Senior Full Stack Developer</h4>
                      <span className="job-badge">New</span>
                    </div>
                    <p className="job-company">Tech Corp India</p>
                    <div className="job-meta">
                      <span className="job-location">📍 Bangalore</span>
                      <span className="job-type">💼 Full-time</span>
                      <span className="job-salary">💰 ₹15-25 LPA</span>
                    </div>
                    <button className="job-apply-btn">Apply Now</button>
                  </div>
                  <div className="job-card">
                    <div className="job-header">
                      <h4 className="job-title">React.js Developer</h4>
                      <span className="job-badge">Hot</span>
                    </div>
                    <p className="job-company">StartupXYZ</p>
                    <div className="job-meta">
                      <span className="job-location">📍 Remote</span>
                      <span className="job-type">💼 Full-time</span>
                      <span className="job-salary">💰 ₹12-20 LPA</span>
                    </div>
                    <button className="job-apply-btn">Apply Now</button>
                  </div>
                  <div className="job-card">
                    <div className="job-header">
                      <h4 className="job-title">Node.js Backend Engineer</h4>
                      <span className="job-badge">Popular</span>
                    </div>
                    <p className="job-company">CloudTech Solutions</p>
                    <div className="job-meta">
                      <span className="job-location">📍 Hyderabad</span>
                      <span className="job-type">💼 Full-time</span>
                      <span className="job-salary">💰 ₹18-30 LPA</span>
                    </div>
                    <button className="job-apply-btn">Apply Now</button>
                  </div>
                </div>
              </div>
            ) : isEmployer ? (
              <div className="employer-dashboard">
                <h3 className="section-title">Get Started</h3>
                <div className="get-started-card">
                  <div className="get-started-content">
                    <h4 className="get-started-title">Post Your First Job</h4>
                    <p className="get-started-desc">
                      Start attracting top tech talent by posting your first job listing. 
                      Reach 10K+ active developers on our platform.
                    </p>
                    <button className="primary-action-btn">
                      Post a Job
                    </button>
                  </div>
                  <div className="get-started-stats">
                    <div className="mini-stat">
                      <span className="mini-stat-value">10K+</span>
                      <span className="mini-stat-label">Active Developers</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value">500+</span>
                      <span className="mini-stat-label">Companies</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value">85%</span>
                      <span className="mini-stat-label">Placement Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
