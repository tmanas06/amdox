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
          <div style={{ display: 'grid', gap: '1rem' }}>
            {jobs.map(j => (
              <div key={j._id} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.20)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{j.title}</div>
                    <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>{j.company} • {j.isRemote ? 'Remote' : j.location} • {j.type}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#94a3b8' }}>
                      Status: <span style={{ color: j.status === 'active' ? '#34d399' : '#fbbf24' }}>{j.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/post-job/${j._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        style={{
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.2)',
                          background: 'rgba(239, 68, 68, 0.05)'
                        }}
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

