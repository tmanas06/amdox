import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Import components
import Jobs from '../components/dashboard/Jobs';
import Applications from '../components/dashboard/Applications';
import SavedJobs from '../components/dashboard/SavedJobs';
import Profile from '../components/dashboard/Profile';
import PostJob from '../components/dashboard/PostJob';

/**
 * Dashboard Component - Amdox Jobs
 * Professional role-based dashboard with glassmorphism navigation
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isJobSeeker = user?.role === 'job_seeker';
  const isEmployer = user?.role === 'employer';

  const jobSeekerTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: 'Browse Jobs' },
    { id: 'applications', label: 'Applications' },
    { id: 'saved', label: 'Saved Jobs' },
    { id: 'profile', label: 'Profile' }
  ];

  const employerTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'postings', label: 'Job Postings' },
    { id: 'applications', label: 'Applications' },
    { id: 'candidates', label: 'Candidates' },
    { id: 'company', label: 'Company' }
  ];

  const tabs = isJobSeeker ? jobSeekerTabs : employerTabs;

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar - Glassmorphism */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <img src="/logo/logo.png" alt="Amdox Jobs" className="nav-logo-img" />
            </div>
            <div className="nav-brand-text">
              <h1 className="nav-title">Amdox Jobs</h1>
              <span className="nav-subtitle">Tech Hiring Platform</span>
            </div>
          </div>

          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-user">
            <div className="nav-user-info">
              {user?.profile?.photoURL && (
                <img 
                  src={user.profile.photoURL} 
                  alt={user.profile.name || user.email}
                  className="nav-user-avatar"
                />
              )}
              <div className="nav-user-details">
                <span className="nav-user-name">{user?.profile?.name || user?.email}</span>
                <span className="nav-user-role">
                  {isJobSeeker ? 'Job Seeker' : isEmployer ? 'Employer' : 'User'}
                </span>
              </div>
            </div>
            <button onClick={logout} className="nav-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="dashboard-wrapper">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'jobs' && 'Browse Jobs'}
                {activeTab === 'applications' && isJobSeeker && 'My Applications'}
                {activeTab === 'applications' && isEmployer && 'Job Applications'}
                {activeTab === 'saved' && 'Saved Jobs'}
                {activeTab === 'postings' && 'Job Postings'}
                {activeTab === 'candidates' && 'Candidates'}
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'company' && 'Company Profile'}
              </h2>
              <p className="page-subtitle">
                {activeTab === 'overview' && (isJobSeeker 
                  ? 'Track your job search progress and discover opportunities'
                  : 'Manage your hiring pipeline and track performance')}
                {activeTab === 'jobs' && 'Explore 500+ tech jobs from top companies'}
                {activeTab === 'applications' && isJobSeeker && 'Track and manage your job applications'}
                {activeTab === 'applications' && isEmployer && 'Review and manage candidate applications'}
                {activeTab === 'saved' && 'Your saved job listings'}
                {activeTab === 'postings' && 'Manage your active job postings'}
                {activeTab === 'candidates' && 'Browse and connect with candidates'}
                {activeTab === 'profile' && 'Update your profile information'}
                {activeTab === 'company' && 'Manage your company profile and settings'}
              </p>
            </div>
            {activeTab === 'overview' && (
              <div className="header-actions">
                {isJobSeeker ? (
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('jobs')}
                  >
                    Browse Jobs
                  </button>
                ) : (
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('postings')}
                  >
                    Post New Job
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Stats Grid */}
              <div className="stats-section">
                <div className="stats-grid">
                  {isJobSeeker ? (
                    <>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Active Jobs</span>
                          <span className="stat-trend positive">+12%</span>
                        </div>
                        <div className="stat-value">500+</div>
                        <div className="stat-description">Tech positions available</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">My Applications</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Applications submitted</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Saved Jobs</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Jobs saved for later</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Profile Completion</span>
                          <span className="stat-trend">40%</span>
                        </div>
                        <div className="stat-value">40%</div>
                        <div className="stat-description">Complete your profile</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Active Postings</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Jobs currently live</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Total Applications</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Applications received</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Active Candidates</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Candidates in pipeline</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Profile Views</span>
                          <span className="stat-trend">0</span>
                        </div>
                        <div className="stat-value">0</div>
                        <div className="stat-description">Company profile views</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Main Content Cards */}
              <div className="content-grid">
                {isJobSeeker ? (
                  <>
                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Recommended Jobs</h3>
                        <button className="card-action">View All</button>
                      </div>
                      <div className="card-content">
                        <div className="job-item">
                          <div className="job-item-header">
                            <h4 className="job-item-title">Senior Full Stack Developer</h4>
                            <span className="job-item-badge">New</span>
                          </div>
                          <p className="job-item-company">Tech Corp India</p>
                          <div className="job-item-meta">
                            <span>Bangalore</span>
                            <span>•</span>
                            <span>Full-time</span>
                            <span>•</span>
                            <span>₹15-25 LPA</span>
                          </div>
                          <div className="job-item-actions">
                            <button className="btn-secondary">Save</button>
                            <button className="btn-primary">Apply</button>
                          </div>
                        </div>
                        <div className="job-item">
                          <div className="job-item-header">
                            <h4 className="job-item-title">React.js Developer</h4>
                            <span className="job-item-badge hot">Hot</span>
                          </div>
                          <p className="job-item-company">StartupXYZ</p>
                          <div className="job-item-meta">
                            <span>Remote</span>
                            <span>•</span>
                            <span>Full-time</span>
                            <span>•</span>
                            <span>₹12-20 LPA</span>
                          </div>
                          <div className="job-item-actions">
                            <button className="btn-secondary">Save</button>
                            <button className="btn-primary">Apply</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Application Status</h3>
                      </div>
                      <div className="card-content">
                        <div className="empty-state">
                          <p className="empty-state-text">No applications yet</p>
                          <p className="empty-state-subtext">Start applying to jobs to track your progress</p>
                          <button className="btn-primary">Browse Jobs</button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                      </div>
                      <div className="card-content">
                        <div className="quick-actions-list">
                          <button className="quick-action-item">
                            <div className="quick-action-content">
                              <h4>Post a New Job</h4>
                              <p>Create a job listing to attract top talent</p>
                            </div>
                          </button>
                          <button className="quick-action-item">
                            <div className="quick-action-content">
                              <h4>Manage Postings</h4>
                              <p>View and edit your active job postings</p>
                            </div>
                          </button>
                          <button className="quick-action-item">
                            <div className="quick-action-content">
                              <h4>Browse Candidates</h4>
                              <p>Search and connect with qualified candidates</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                      </div>
                      <div className="card-content">
                        <div className="empty-state">
                          <p className="empty-state-text">No activity yet</p>
                          <p className="empty-state-subtext">Start posting jobs to see activity here</p>
                          <button className="btn-primary">Post Your First Job</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab !== 'overview' && (
            <div className="tab-content">
              {activeTab === 'jobs' && isJobSeeker && <Jobs />}
              {activeTab === 'applications' && isJobSeeker && <Applications />}
              {activeTab === 'saved' && isJobSeeker && <SavedJobs />}
              {activeTab === 'profile' && isJobSeeker && <Profile />}
              
              {/* Employer Tabs */}
              {activeTab === 'postings' && isEmployer && (
                <div className="content-card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Job Postings</h3>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/post-job')}
                    >
                      + Post New Job
                    </button>
                  </div>
                  <div className="card-content">
                    <div className="empty-state">
                      <p className="empty-state-text">No job postings yet</p>
                      <p className="empty-state-subtext">
                        Create your first job posting to get started
                      </p>
                      <button 
                        className="btn-primary"
                        onClick={() => navigate('/post-job')}
                      >
                        Post Your First Job
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'candidates' && isEmployer && (
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">Candidates</h3>
                  </div>
                  <div className="card-content">
                    <div className="empty-state">
                      <p className="empty-state-text">No candidates yet</p>
                      <p className="empty-state-subtext">
                        Candidates will appear here when they apply to your jobs
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'company' && isEmployer && (
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">Company Profile</h3>
                  </div>
                  <div className="card-content">
                    <div className="empty-state">
                      <p className="empty-state-text">Company Profile</p>
                      <p className="empty-state-subtext">
                        Set up your company profile to attract top talent
                      </p>
                      <button className="btn-primary">Edit Company Profile</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
