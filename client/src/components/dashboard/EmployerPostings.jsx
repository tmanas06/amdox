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
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{j.title}</div>
                    <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>{j.company} • {j.isRemote ? 'Remote' : j.location} • {j.type}</div>
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    Status: <span style={{ color: j.status === 'active' ? '#34d399' : '#fbbf24' }}>{j.status}</span>
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

