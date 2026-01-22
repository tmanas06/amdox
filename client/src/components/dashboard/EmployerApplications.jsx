import React, { useEffect, useState } from 'react';
import { applications as applicationService } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const EmployerApplications = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [apps, setApps] = useState([]);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await applicationService.getEmployerApplications();
      setApps(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load applications');
      toast.error(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      toast.success('Status updated');
      setApps(prev => prev.map(a => (a._id === appId ? { ...a, status } : a)));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Applications</h3>
        </div>
        <div className="card-content">
          <div className="empty-state"><p>Loading applications...</p></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Applications</h3>
          <button className="btn-secondary" onClick={load}>Retry</button>
        </div>
        <div className="card-content">
          <div className="empty-state"><p>Error: {error}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <h3 className="card-title">Applications</h3>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>
      <div className="card-content">
        {apps.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No active applications</p>
            <p className="empty-state-subtext">Applications from candidates will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {apps.map(a => (
              <div key={a._id} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.20)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{a.job?.title || 'Job'}</div>
                    <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                      Candidate: {a.applicant?.profile?.name || a.applicant?.email || '—'} • {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn-outline" onClick={() => a.job?._id && navigate(`/jobs/${a.job._id}`)}>View Job</button>
                    <select
                      className="btn-outline"
                      value={a.status || 'Applied'}
                      onChange={(e) => updateStatus(a._id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Hired">Hired</option>
                    </select>
                  </div>
                </div>
                {a.coverLetter ? (
                  <div style={{ marginTop: '0.75rem', color: '#cbd5e1' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Cover Letter</div>
                    <div style={{ color: '#94a3b8' }}>{a.coverLetter}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerApplications;

