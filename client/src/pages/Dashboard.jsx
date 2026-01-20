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
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  const isJobSeeker = user?.role === 'job_seeker';
  const isEmployer = user?.role === 'employer';
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  }, []);

  useEffect(() => {
    const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setAppliedJobs(applied);
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
  }, [isJobSeeker]);

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await jobService.getAll({ limit: 2 });
      if (response.data && response.data.data) {
        setRecommendedJobs(response.data.data.slice(0, 2));
        setTotalJobsCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      setRecommendedJobs([]);
      setTotalJobsCount(0);
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
                {activeTab === 'jobs' && `Explore ${totalJobsCount || 0} jobs from top companies`}
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
                        <div className="stat-value">{totalJobsCount || 0}</div>
                        <div className="stat-description">Tech positions available</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">My Applications</span>
                          <span className="stat-trend">{appliedJobs.length}</span>
                        </div>
                        <div className="stat-value">{appliedJobs.length}</div>
                        <div className="stat-description">Applications submitted</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Saved Jobs</span>
                          <span className="stat-trend">{savedJobs.length}</span>
                        </div>
                        <div className="stat-value">{savedJobs.length}</div>
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
                        <button className="card-action" onClick={() => setActiveTab('jobs')}>View All</button>
                      </div>
                      <div className="card-content">
                        {loadingJobs ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            <p>Loading jobs...</p>
                          </div>
                        ) : recommendedJobs.length > 0 ? (
                          recommendedJobs.map((job) => (
                            <div className="job-item" key={job._id}>
                              <div className="job-item-header">
                                <h4 className="job-item-title">{job.title}</h4>
                                <span className="job-item-badge">{job.isRemote ? 'Remote' : 'On-site'}</span>
                              </div>
                              <p className="job-item-company">{job.company}</p>
                              <div className="job-item-meta">
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>{job.type}</span>
                                <span>•</span>
                                <span>{job.salary}</span>
                              </div>
                              <div className="job-item-actions">
                                <button className="btn-secondary" onClick={() => handleSaveJob(job._id)}>Save</button>
                                <button className="btn-primary" onClick={() => navigate(`/jobs/${job._id}`)}>View</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state">
                            <p className="empty-state-text">No jobs available</p>
                            <p className="empty-state-subtext">Check back soon for new opportunities</p>
                          </div>
                        )}
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
                          <button className="btn-primary" onClick={() => setActiveTab('jobs')}>Browse Jobs</button>
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
              {activeTab === 'applications' && isJobSeeker && <Applications onBrowseJobs={() => setActiveTab('jobs')} />}
              {activeTab === 'saved' && isJobSeeker && <SavedJobs onBrowseJobs={() => setActiveTab('jobs')} />}
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
