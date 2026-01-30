import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
import { jobs as jobService, user as userService, applications as applicationService } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

// Import components
import Jobs from '../components/dashboard/Jobs';
import Applications from '../components/dashboard/Applications';
import SavedJobs from '../components/dashboard/SavedJobs';
import Profile from '../components/dashboard/Profile';
// import PostJob from '../components/dashboard/PostJob'; // Unused
import EmployerPostings from '../components/dashboard/EmployerPostings';
import EmployerApplications from '../components/dashboard/EmployerApplications';
import EmployerCandidates from '../components/dashboard/EmployerCandidates';
import EmployerCompanyProfile from '../components/dashboard/EmployerCompanyProfile';
// // import ThemeToggle from '../components/ThemeToggle'; // Unused
import Navbar from '../components/Navbar';

/**
 * Dashboard Component - Amdox Jobs
 * Professional role-based dashboard with glassmorphism navigation
 */
const Dashboard = () => {
  const { user } = useAuth(); // logout unused
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [aiRecommendedJobs, setAiRecommendedJobs] = useState([]);
  const [loadingAIJobs, setLoadingAIJobs] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  const isJobSeeker = user?.role === 'job_seeker';
  const isEmployer = user?.role === 'employer';
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myApplicationsCount, setMyApplicationsCount] = useState(0);

  // Employer Stats State
  const [employerStats, setEmployerStats] = useState({
    activePostings: 0,
    totalApplications: 0,
    activeCandidates: 0,
    profileViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [recentApplications, setRecentApplications] = useState([]);

  // Load saved jobs from backend on component mount
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        if (isJobSeeker) {
          const res = await jobService.getSaved();
          if (res.data && res.data.success) {
            setSavedJobs(res.data.data.map(j => j._id));
          }
        }
      } catch (err) {
        console.error('Error fetching saved jobs for dashboard:', err);
      }
    };
    fetchSaved();
  }, [isJobSeeker]);

  useEffect(() => {
    const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setAppliedJobs(applied);
  }, []);

  // Sync to localStorage as a fallback/cache if desired, or just remove
  useEffect(() => {
    // We can keep this for instant UI feedback but the source of truth is now backend
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  // Fetch recommended jobs on component mount
  useEffect(() => {
    if (isJobSeeker) {
      fetchRecommendedJobs();
      fetchAIRecommendedJobs();
      fetchMyApplications();
    } else if (isEmployer) {
      fetchEmployerStats();
    }
  }, [isJobSeeker, isEmployer]);

  const fetchAIRecommendedJobs = async () => {
    try {
      setLoadingAIJobs(true);
      const res = await jobService.getAIRecommendations();
      if (res.data && res.data.success) {
        setAiRecommendedJobs(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching AI recommended jobs:', error);
    } finally {
      setLoadingAIJobs(false);
    }
  };

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

  const fetchEmployerStats = async () => {
    try {
      const res = await userService.getDashboardStats();
      if (res.data && res.data.success) {
        setEmployerStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching employer stats:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await applicationService.getMyApplications();
      if (res.data && res.data.success) {
        setRecentApplications(res.data.data.slice(0, 3)); // show top 3
        setMyApplicationsCount(res.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApps(false);
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Applied': 'status-applied',
      'Interview Scheduled': 'status-interview',
      'Rejected': 'status-rejected',
      'Offer Received': 'status-offer',
      'Hired': 'status-hired'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-applied'}`}>
        {status}
      </span>
    );
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
      <Navbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
                          <span className="stat-trend">{myApplicationsCount}</span>
                        </div>
                        <div className="stat-value">{myApplicationsCount}</div>
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
                          <span className="stat-trend">{employerStats.activePostings}</span>
                        </div>
                        <div className="stat-value">{employerStats.activePostings}</div>
                        <div className="stat-description">Jobs currently live</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Total Applications</span>
                          <span className="stat-trend">{employerStats.totalApplications}</span>
                        </div>
                        <div className="stat-value">{employerStats.totalApplications}</div>
                        <div className="stat-description">Applications received</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Active Candidates</span>
                          <span className="stat-trend">{employerStats.activeCandidates}</span>
                        </div>
                        <div className="stat-value">{employerStats.activeCandidates}</div>
                        <div className="stat-description">Candidates in pipeline</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <span className="stat-label">Profile Views</span>
                          <span className="stat-trend">{employerStats.profileViews}</span>
                        </div>
                        <div className="stat-value">{employerStats.profileViews}</div>
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
                        <h3 className="card-title">AI Picks for You ✨</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>Groq AI</span>
                      </div>
                      <div className="card-content">
                        {loadingAIJobs ? (
                          <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI is analyzing your profile...</p>
                          </div>
                        ) : aiRecommendedJobs.length > 0 ? (
                          aiRecommendedJobs.map((job) => (
                            <div className="job-item ai-pick" key={`ai-${job._id}`} style={{ borderLeft: '3px solid var(--primary-color)' }}>
                              <div className="job-item-header">
                                <h4 className="job-item-title">{job.title}</h4>
                                <span className="job-item-badge">{job.isRemote ? 'Remote' : 'On-site'}</span>
                              </div>
                              <p className="job-item-company">{job.company}</p>
                              <div className="job-item-meta">
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>{job.type}</span>
                              </div>
                              <div className="job-item-actions">
                                <button className="btn-primary" onClick={() => navigate(`/jobs/${job._id}`)}>View Match</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state">
                            <p className="empty-state-text" style={{ fontSize: '0.9rem' }}>No AI picks yet</p>
                            <p className="empty-state-subtext" style={{ fontSize: '0.8rem' }}>Complete your profile for better matches</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Recommended Jobs</h3>
                        <button className="card-action" onClick={() => setActiveTab('jobs')}>View All</button>
                      </div>
                      <div className="card-content">
                        {loadingJobs ? (
                          <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Loading jobs...</p>
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
                            <p className="empty-state-text" style={{ color: 'var(--text-muted)' }}>No jobs available</p>
                            <p className="empty-state-subtext" style={{ color: 'var(--text-secondary)' }}>Check back soon for new opportunities</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="content-card">
                      <div className="card-header">
                        <h3 className="card-title">Application Status</h3>
                      </div>
                      <div className="card-content">
                        {loadingApps ? (
                          <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Loading applications...</p>
                          </div>
                        ) : recentApplications.length > 0 ? (
                          <div className="application-status-list">
                            {recentApplications.map((app) => (
                              <div key={app._id} className="status-item" style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{app.job?.title || 'Unknown Job'}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{app.job?.company || 'Unknown Company'}</div>
                                </div>
                                {getStatusBadge(app.status)}
                              </div>
                            ))}
                            <button
                              className="btn-secondary"
                              style={{ width: '100%', marginTop: '1rem' }}
                              onClick={() => setActiveTab('applications')}
                            >
                              View All Applications
                            </button>
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p className="empty-state-text" style={{ color: 'var(--text-muted)' }}>No applications yet</p>
                            <p className="empty-state-subtext" style={{ color: 'var(--text-secondary)' }}>Start applying to jobs to track your progress</p>
                            <button className="btn-primary" onClick={() => setActiveTab('jobs')}>Browse Jobs</button>
                          </div>
                        )}
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
                          <button className="quick-action-item" onClick={() => setActiveTab('postings')}>
                            <div className="quick-action-content">
                              <h4>Post a New Job</h4>
                              <p>Create a job listing to attract top talent</p>
                            </div>
                          </button>
                          <button className="quick-action-item" onClick={() => setActiveTab('postings')}>
                            <div className="quick-action-content">
                              <h4>Manage Postings</h4>
                              <p>View and edit your active job postings</p>
                            </div>
                          </button>
                          <button className="quick-action-item" onClick={() => setActiveTab('candidates')}>
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
                        {recentActivity.length > 0 ? (
                          <div className="activity-list">
                            {recentActivity.map((activity, index) => (
                              <div key={index} className="activity-item" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {activity.type === 'Application' ? '📝' : '🔔'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activity.description}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{activity.candidate} • {new Date(activity.time).toLocaleDateString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p className="empty-state-text">No activity yet</p>
                            <p className="empty-state-subtext">Start posting jobs to see activity here</p>
                            <button className="btn-primary" onClick={() => setActiveTab('postings')}>Post Your First Job</button>
                          </div>
                        )}
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
              {activeTab === 'postings' && isEmployer && <EmployerPostings />}
              {activeTab === 'applications' && isEmployer && <EmployerApplications />}

              {activeTab === 'candidates' && isEmployer && <EmployerCandidates />}

              {activeTab === 'company' && isEmployer && <EmployerCompanyProfile />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
