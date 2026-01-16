import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Applications = () => {
  const { user } = useAuth();
  
  // Mock applications data
  const applications = [
    {
      id: 1,
      jobTitle: 'Senior Full Stack Developer',
      company: 'Tech Corp India',
      status: 'Applied',
      appliedDate: '2025-01-10',
      lastUpdated: '2025-01-10',
      nextSteps: 'Application under review',
      notes: 'Good match with my skills',
      jobDetails: {
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹15-25 LPA'
      }
    },
    {
      id: 2,
      jobTitle: 'React.js Developer',
      company: 'StartupXYZ',
      status: 'Interview Scheduled',
      appliedDate: '2025-01-05',
      lastUpdated: '2025-01-12',
      nextSteps: 'Technical interview on 2025-01-20',
      notes: 'Prepare for React and Redux questions',
      jobDetails: {
        location: 'Remote',
        type: 'Full-time',
        salary: '₹12-20 LPA'
      }
    },
    {
      id: 3,
      jobTitle: 'Backend Engineer',
      company: 'DataSystems',
      status: 'Rejected',
      appliedDate: '2024-12-20',
      lastUpdated: '2025-01-08',
      nextSteps: 'Try again in 6 months',
      notes: 'Need to improve system design skills',
      jobDetails: {
        location: 'Pune',
        type: 'Full-time',
        salary: '₹18-30 LPA'
      }
    }
  ];

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Applied': 'status-applied',
      'Interview Scheduled': 'status-interview',
      'Rejected': 'status-rejected',
      'Offer Received': 'status-offer',
      'Hired': 'status-hired'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        <div className="applications-filters">
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="filter-select">
            <option value="newest">Most Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <button className="btn-primary">Browse Jobs</button>
          </div>
        ) : (
          applications.map(application => (
            <div key={application.id} className="application-card">
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
                  <span>{application.appliedDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span>{application.lastUpdated}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span>{application.jobDetails.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span>{application.jobDetails.type}</span>
                </div>
              </div>
              
              <div className="application-next-steps">
                <h4>Next Steps:</h4>
                <p>{application.nextSteps}</p>
              </div>
              
              <div className="application-notes">
                <h4>My Notes:</h4>
                <p>{application.notes}</p>
              </div>
              
              <div className="application-actions">
                <button className="btn-outline">View Job</button>
                <button className="btn-outline">Add Note</button>
                <button className="btn-outline">Update Status</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;
