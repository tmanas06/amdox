import React, { useState, useEffect } from 'react';
import { jobs as jobService } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Applications.css';

const Applications = ({ onBrowseJobs }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');

  // Fetch user applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Dynamic flow (no static): use localStorage applied job IDs + real job data
        const appliedIds = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        if (!Array.isArray(appliedIds) || appliedIds.length === 0) {
          setApplications([]);
          return;
        }

        const results = await Promise.allSettled(appliedIds.map((jobId) => jobService.getById(jobId)));
        const jobs = results
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value?.data?.data)
          .filter(Boolean);

        const appRows = jobs.map(j => ({
          _id: j._id,
          jobId: j._id,
          jobTitle: j.title,
          company: j.company,
          appliedDate: j.createdAt || new Date().toISOString(),
          lastUpdated: j.updatedAt || j.createdAt || new Date().toISOString(),
          status: 'Applied',
          jobDetails: { location: j.location, type: j.type },
          nextSteps: 'Waiting for response from recruiter',
        }));

        setApplications(appRows);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications');
        toast.error(err.message || 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Sorting
    if (sortFilter === 'oldest') {
      filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    } else {
      filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, sortFilter]);

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

  const handleUpdateStatus = async (applicationId, newStatus) => {
    // No backend support yet; keep UX dynamic locally
    setApplications(prev =>
      prev.map(app =>
        app._id === applicationId ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() } : app
      )
    );
    toast.success('Application status updated');
  };

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        <div className="applications-filters">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview scheduled">Interview</option>
            <option value="offer received">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          <select 
            className="filter-select"
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="newest">Most Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {isLoading ? (
          <div className="empty-state">
            <p>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>Error: {error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <button className="btn-primary" onClick={onBrowseJobs}>Browse Jobs</button>
          </div>
        ) : (
          filteredApplications.map(application => (
            <div key={application._id} className="application-card">
              <div className="application-card-header">
                <div>
                  <h3 className="job-title">{application.jobTitle}</h3>
                  <p className="company-name">{application.company}</p>
                </div>
                <div className="application-status">
                  {getStatusBadge(application.status)}
                </div>
              </div>
              
              <div className="application-details">
                <div className="detail-item">
                  <span className="detail-label">Applied:</span>
                  <span>{new Date(application.appliedDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span>{new Date(application.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span>{application.jobDetails?.location || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span>{application.jobDetails?.type || 'N/A'}</span>
                </div>
              </div>
              
              <div className="application-next-steps">
                <h4>Next Steps:</h4>
                <p>{application.nextSteps || 'Waiting for response from recruiter'}</p>
              </div>
              
              {application.notes && (
                <div className="application-notes">
                  <h4>My Notes:</h4>
                  <p>{application.notes}</p>
                </div>
              )}
              
              <div className="application-actions">
                <button className="btn-outline" onClick={() => navigate(`/jobs/${application.jobId}`)}>View Job</button>
                <button className="btn-outline">Add Note</button>
                <select 
                  className="btn-outline"
                  value={application.status}
                  onChange={(e) => {
                    if (e.target.value !== application.status) {
                      handleUpdateStatus(application._id, e.target.value);
                    }
                  }}
                >
                  <option value={application.status} disabled hidden>{application.status}</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;
