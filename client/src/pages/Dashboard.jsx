import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobs as jobService } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

// Import components
import Jobs from '../components/dashboard/Jobs';
import Applications from '../components/dashboard/Applications';
import SavedJobs from '../components/dashboard/SavedJobs';
import Profile from '../components/dashboard/Profile';
import PostJob from '../components/dashboard/PostJob';
import ThemeToggle from '../components/ThemeToggle';
import { StatCardSkeleton } from '../components/SkeletonLoader';

/**
 * Dashboard Component - Amdox Jobs
 * Professional role-based dashboard with glassmorphism navigation
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  const isJobSeeker = user?.role === 'job_seeker';
  const isEmployer = user?.role === 'employer';
  const [savedJobs, setSavedJobs] = useState([]);

  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  }, []);

  // Save to localStorage when savedJobs change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  // Fetch recommended jobs on component mount
  useEffect(() => {
    if (isJobSeeker) {
      fetchRecommendedJobs();
    }
    
    // Simulate loading stats for 1.5 seconds
    setTimeout(() => {
      setLoadingStats(false);
    }, 1500);
  }, [isJobSeeker]);

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await jobService.getAll({ limit: 2 });
      if (response.data && response.data.data) {
        setRecommendedJobs(response.data.data.slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      setRecommendedJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Handle save job
  const handleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast.success('Job removed from saved');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved successfully!');
    }
  };

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
      <nav className="dashboard-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <img src="/logo/logo.png" alt="Amdox Jobs logo" className="nav-logo-img" />
            </div>
            <div className="nav-brand-text">
              <h1 className="nav-title">Amdox Jobs</h1>
              <span className="nav-subtitle">Tech Hiring Platform</span>
            </div>
          </div>

          <div className="nav-tabs" role="tablist" aria-label="Dashboard sections">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <span className="nav-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-user" role="region" aria-label="User account">
            <ThemeToggle size="sm" variant="minimal" />
            <div className="nav-user-info">
              {user?.profile?.photoURL && (
                <img 
                  src={user.profile.photoURL} 
                  alt={`Profile picture of ${user.profile.name || user.email}`}
                  className="nav-user-avatar"
                />
              )}
              <div className="nav-user-details">
                <span className="nav-user-name" aria-label="User name">
                  {user?.profile?.name || user?.email}
                </span>
                <span className="nav-user-role" aria-label="User role">
                  {isJobSeeker ? 'Job Seeker' : isEmployer ? 'Employer' : 'User'}
                </span>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="nav-logout-btn"
              aria-label="Logout from account"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content" id="main-content" role="main">
        <div className="dashboard-wrapper">
          {/* Page Header */}
          <header className="page-header">
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
                    aria-label="Navigate to browse jobs section"
                  >
                    Browse Jobs
                  </button>
                ) : (
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('postings')}
                    aria-label="Navigate to job postings section"
                  >
                    Post New Job
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Content Based on Active Tab */}
          <div 
            role="tabpanel" 
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
          >
            {activeTab === 'overview' && (
              <section className="overview-content" aria-label="Dashboard overview">
                {/* Stats Grid */}
                <section className="stats-section" aria-label="Statistics summary">
                  {loadingStats ? (
                    <StatCardSkeleton count={4} />
                  ) : (
                    <div className="stats-grid" role="group" aria-label="Key metrics">
                    {isJobSeeker ? (
                      <>
                        <div className="stat-card" role="article" aria-labelledby="stat-active-jobs">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-active-jobs">Active Jobs</span>
                            <span className="stat-trend positive" aria-label="12% increase">+12%</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-active-jobs">500+</div>
                          <div className="stat-description">Tech positions available</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-applications">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-applications">My Applications</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-applications">0</div>
                          <div className="stat-description">Applications submitted</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-saved">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-saved">Saved Jobs</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-saved">0</div>
                          <div className="stat-description">Jobs saved for later</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-profile">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-profile">Profile Completion</span>
                            <span className="stat-trend" aria-label="40% complete">40%</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-profile">40%</div>
                          <div className="stat-description">Complete your profile</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="stat-card" role="article" aria-labelledby="stat-postings">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-postings">Active Postings</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-postings">0</div>
                          <div className="stat-description">Jobs currently live</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-total-apps">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-total-apps">Total Applications</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-total-apps">0</div>
                          <div className="stat-description">Applications received</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-candidates">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-candidates">Active Candidates</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-candidates">0</div>
                          <div className="stat-description">Candidates in pipeline</div>
                        </div>
                        <div className="stat-card" role="article" aria-labelledby="stat-views">
                          <div className="stat-header">
                            <span className="stat-label" id="stat-views">Profile Views</span>
                            <span className="stat-trend" aria-label="No change">0</span>
                          </div>
                          <div className="stat-value" aria-describedby="stat-views">0</div>
                          <div className="stat-description">Company profile views</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                </section>

                {/* Main Content Cards */}
                <section className="content-grid" aria-label="Main content">
                  {isJobSeeker ? (
                    <>
                      <article className="content-card" aria-labelledby="recommended-jobs-title">
                        <header className="card-header">
                          <h3 className="card-title" id="recommended-jobs-title">Recommended Jobs</h3>
                          <button 
                            className="card-action" 
                            onClick={() => setActiveTab('jobs')}
                            aria-label="View all recommended jobs"
                          >
                            View All
                          </button>
                        </header>
                        <div className="card-content">
                          {loadingJobs ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                              <p role="status" aria-live="polite">Loading jobs...</p>
                            </div>
                          ) : recommendedJobs.length > 0 ? (
                            <div role="list" aria-label="Recommended job listings">
                              {recommendedJobs.map((job) => (
                                <article className="job-item" key={job._id} role="listitem">
                                  <header className="job-item-header">
                                    <h4 className="job-item-title">{job.title}</h4>
                                    <span className="job-item-badge" aria-label={`Work type: ${job.isRemote ? 'Remote' : 'On-site'}`}>
                                      {job.isRemote ? 'Remote' : 'On-site'}
                                    </span>
                                  </header>
                                  <p className="job-item-company">{job.company}</p>
                                  <div className="job-item-meta" aria-label="Job details">
                                    <span>{job.location}</span>
                                    <span aria-hidden="true">•</span>
                                    <span>{job.type}</span>
                                    <span aria-hidden="true">•</span>
                                    <span>{job.salary}</span>
                                  </div>
                                  <div className="job-item-actions">
                                    <button 
                                      className="btn-secondary" 
                                      onClick={() => handleSaveJob(job._id)}
                                      aria-label={`Save ${job.title} job`}
                                    >
                                      Save
                                    </button>
                                    <button 
                                      className="btn-primary" 
                                      onClick={() => navigate(`/jobs/${job._id}`)}
                                      aria-label={`View details for ${job.title} job`}
                                    >
                                      View
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state" role="status">
                              <p className="empty-state-text">No jobs available</p>
                              <p className="empty-state-subtext">Check back soon for new opportunities</p>
                            </div>
                          )}
                        </div>
                      </article>

                      <article className="content-card" aria-labelledby="application-status-title">
                        <header className="card-header">
                          <h3 className="card-title" id="application-status-title">Application Status</h3>
                        </header>
                        <div className="card-content">
                          <div className="empty-state" role="status">
                            <p className="empty-state-text">No applications yet</p>
                            <p className="empty-state-subtext">Start applying to jobs to track your progress</p>
                            <button 
                              className="btn-primary" 
                              onClick={() => setActiveTab('jobs')}
                              aria-label="Navigate to browse jobs to start applying"
                            >
                              Browse Jobs
                            </button>
                          </div>
                        </div>
                      </article>
                    </>
                  ) : (
                    <>
                      <article className="content-card" aria-labelledby="quick-actions-title">
                        <header className="card-header">
                          <h3 className="card-title" id="quick-actions-title">Quick Actions</h3>
                        </header>
                        <div className="card-content">
                          <nav className="quick-actions-list" role="list" aria-label="Quick action buttons">
                            <button className="quick-action-item" role="listitem" aria-label="Post a new job listing">
                              <div className="quick-action-content">
                                <h4>Post a New Job</h4>
                                <p>Create a job listing to attract top talent</p>
                              </div>
                            </button>
                            <button className="quick-action-item" role="listitem" aria-label="Manage existing job postings">
                              <div className="quick-action-content">
                                <h4>Manage Postings</h4>
                                <p>View and edit your active job postings</p>
                              </div>
                            </button>
                            <button className="quick-action-item" role="listitem" aria-label="Browse available candidates">
                              <div className="quick-action-content">
                                <h4>Browse Candidates</h4>
                                <p>Search and connect with qualified candidates</p>
                              </div>
                            </button>
                          </nav>
                        </div>
                      </article>

                      <article className="content-card" aria-labelledby="recent-activity-title">
                        <header className="card-header">
                          <h3 className="card-title" id="recent-activity-title">Recent Activity</h3>
                        </header>
                        <div className="card-content">
                          <div className="empty-state" role="status">
                            <p className="empty-state-text">No activity yet</p>
                            <p className="empty-state-subtext">Start posting jobs to see activity here</p>
                            <button 
                              className="btn-primary"
                              aria-label="Post your first job to get started"
                            >
                              Post Your First Job
                            </button>
                          </div>
                        </div>
                      </article>
                    </>
                  )}
                </section>
              </section>
            )}

            {/* Tab Content */}
            {activeTab !== 'overview' && (
              <section className="tab-content" aria-label={`${activeTab} content`}>
                {activeTab === 'jobs' && isJobSeeker && <Jobs />}
                {activeTab === 'applications' && isJobSeeker && <Applications />}
                {activeTab === 'saved' && isJobSeeker && <SavedJobs />}
                {activeTab === 'profile' && isJobSeeker && <Profile />}
                
                {/* Employer Tabs */}
                {activeTab === 'postings' && isEmployer && (
                  <article className="content-card" aria-labelledby="job-postings-title">
                    <header className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="card-title" id="job-postings-title">Job Postings</h3>
                      <button 
                        className="btn-primary"
                        onClick={() => navigate('/post-job')}
                        aria-label="Create a new job posting"
                      >
                        + Post New Job
                      </button>
                    </header>
                    <div className="card-content">
                      <div className="empty-state" role="status">
                        <p className="empty-state-text">No job postings yet</p>
                        <p className="empty-state-subtext">
                          Create your first job posting to get started
                        </p>
                        <button 
                          className="btn-primary"
                          onClick={() => navigate('/post-job')}
                          aria-label="Create your first job posting"
                        >
                          Post Your First Job
                        </button>
                      </div>
                    </div>
                  </article>
                )}
                
                {activeTab === 'candidates' && isEmployer && (
                  <article className="content-card" aria-labelledby="candidates-title">
                    <header className="card-header">
                      <h3 className="card-title" id="candidates-title">Candidates</h3>
                    </header>
                    <div className="card-content">
                      <div className="empty-state" role="status">
                        <p className="empty-state-text">No candidates yet</p>
                        <p className="empty-state-subtext">
                          Candidates will appear here when they apply to your jobs
                        </p>
                      </div>
                    </div>
                  </article>
                )}
                
                {activeTab === 'company' && isEmployer && (
                  <article className="content-card" aria-labelledby="company-profile-title">
                    <header className="card-header">
                      <h3 className="card-title" id="company-profile-title">Company Profile</h3>
                    </header>
                    <div className="card-content">
                      <div className="empty-state" role="status">
                        <p className="empty-state-text">Company Profile</p>
                        <p className="empty-state-subtext">
                          Set up your company profile to attract top talent
                        </p>
                        <button 
                          className="btn-primary"
                          aria-label="Edit your company profile information"
                        >
                          Edit Company Profile
                        </button>
                      </div>
                    </div>
                  </article>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Status announcements for screen readers */}
      <div 
        className="status-announcement" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        id="status-announcements"
      ></div>
    </div>
  );
};

export default Dashboard;
