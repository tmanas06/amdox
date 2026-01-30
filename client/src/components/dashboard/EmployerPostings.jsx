import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs as jobService } from '../../services/api';
import { toast } from 'react-toastify';

const EmployerPostings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await jobService.getEmployerJobs();
        setJobs(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load postings');
        toast.error(err.message || 'Failed to load postings');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const res = await jobService.delete(id);
        if (res.data && res.data.success) {
          toast.success('Job deleted successfully');
          setJobs(jobs.filter(j => j._id !== id));
        }
      } catch (err) {
        console.error('Error deleting job:', err);
        toast.error(err.message || 'Failed to delete job');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Job Postings</h3>
          <button className="btn-primary" onClick={() => navigate('/post-job')}>+ Post New Job</button>
        </div>
        <div className="card-content">
          <div className="empty-state"><p>Loading your job postings...</p></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Job Postings</h3>
          <button className="btn-primary" onClick={() => navigate('/post-job')}>+ Post New Job</button>
        </div>
        <div className="card-content">
          <div className="empty-state"><p>Error: {error}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">Job Postings</h3>
        <button className="btn-primary" onClick={() => navigate('/post-job')}>+ Post New Job</button>
      </div>
      <div className="card-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No job postings yet</p>
            <p className="empty-state-subtext">Create your first job posting to get started</p>
            <button className="btn-primary" onClick={() => navigate('/post-job')}>Post Your First Job</button>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(j => (
              <div key={j._id} className="job-posting-card">
                <div className="job-posting-content">
                  <div className="job-posting-info">
                    <div className="job-posting-title">{j.title}</div>
                    <div className="job-posting-meta">{j.company} • {j.isRemote ? 'Remote' : j.location} • {j.type}</div>
                  </div>
                  <div className="job-posting-actions">
                    <div className="job-posting-status">
                      Status: <span className={`status-badge status-${j.status}`}>{j.status}</span>
                    </div>
                    <div className="job-posting-buttons">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate(`/post-job/${j._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary btn-sm btn-danger"
                        onClick={() => handleDelete(j._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerPostings;

