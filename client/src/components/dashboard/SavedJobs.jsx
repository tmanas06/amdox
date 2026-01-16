import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobs as jobService } from '../../services/api';
import { toast } from 'react-toastify';
import './SavedJobs.css';

const SavedJobs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch saved and applied jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch all jobs and filter by user's saved status
        const response = await jobService.getAll({ limit: 100 });
        const allJobs = response.data?.data || [];
        
        // Filter saved jobs (in real app, backend would handle this)
        const saved = allJobs.filter(job => user?.jobSeeker?.savedJobs?.includes(job._id));
        const applied = allJobs.filter(job => user?.jobSeeker?.applications?.includes(job._id));
        
        setSavedJobs(saved);
        setAppliedJobs(applied);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setError(err.message || 'Failed to load saved jobs');
        toast.error(err.message || 'Failed to load saved jobs');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchJobs();
    }
  }, [user]);

  const allJobs = [...savedJobs, ...appliedJobs];
  const filteredJobs = activeTab === 'all' 
    ? allJobs
    : activeTab === 'saved' 
      ? savedJobs 
      : appliedJobs;

  const getJobStatus = (job) => {
    const inSaved = savedJobs.find(j => j._id === job._id);
    const inApplied = appliedJobs.find(j => j._id === job._id);
    
    if (inApplied) return 'applied';
    if (inSaved) return 'saved';
    return 'unknown';
  };

  const handleRemoveJob = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job._id !== jobId));
      toast.success('Job removed from saved');
    } catch (err) {
      console.error('Error removing job:', err);
      toast.error(err.message || 'Failed to remove job');
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await jobService.applyJob(jobId);
      const job = savedJobs.find(j => j._id === jobId);
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
      setAppliedJobs(prev => [...prev, job]);
      toast.success('Applied to job successfully!');
    } catch (err) {
      console.error('Error applying to job:', err);
      toast.error(err.message || 'Failed to apply to job');
    }
  };

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h2>Saved Jobs</h2>
        <div className="saved-jobs-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            Applied
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading your saved jobs...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p>Error: {error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>No {activeTab === 'all' ? 'saved' : activeTab} jobs found.</p>
          <p>Save jobs to keep track of positions you're interested in.</p>
          <button className="btn-primary">Browse Jobs</button>
        </div>
      ) : (
        <div className="saved-jobs-list">
          {filteredJobs.map(job => (
            <div key={job._id} className="saved-job-card">
              <div className="saved-job-content">
                <div className="saved-job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                  
                  <div className="job-meta">
                    <span className="job-location">{job.location}</span>
                    <span className="job-type">{job.type}</span>
                    <span className="job-salary">{job.salary}</span>
                  </div>
                  
                  <div className="job-skills">
                    {job.skills?.slice(0, 4).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills?.length > 4 && <span className="skill-tag more">+{job.skills.length - 4}</span>}
                  </div>
                  
                  <div className="saved-date">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="saved-job-actions">
                  {getJobStatus(job) === 'saved' && (
                    <button 
                      className="btn-apply"
                      onClick={() => handleApplyJob(job._id)}
                    >
                      Apply Now
                    </button>
                  )}
                  {getJobStatus(job) === 'applied' && (
                    <span className="applied-badge">
                      Applied ✓
                    </span>
                  )}
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveJob(job._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
