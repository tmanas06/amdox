import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { jobs as jobService } from '../services/api';
import './JobDetails.css';

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await jobService.getById(id);
        const jobData = response.data?.data || null;
        setJob(jobData);

        // Check local storage for initial state
        const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        setIsSaved(saved.includes(id));
        setIsApplied(applied.includes(id));
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  const toggleSave = () => {
    const current = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let next;
    if (current.includes(id)) {
      next = current.filter(x => x !== id);
      toast.info('Job removed from saved');
    } else {
      next = [...current, id];
      toast.success('Job saved successfully!');
    }
    localStorage.setItem('savedJobs', JSON.stringify(next));
    setIsSaved(!isSaved);
  };

  const handleApply = async () => {
    if (isApplied) return;

    try {
      // Mock application call or real one if available
      await jobService.apply(id, {});

      const currentApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      localStorage.setItem('appliedJobs', JSON.stringify([...currentApplied, id]));

      // Remove from saved if it was there
      const currentSaved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (currentSaved.includes(id)) {
        localStorage.setItem('savedJobs', JSON.stringify(currentSaved.filter(x => x !== id)));
        setIsSaved(false);
      }

      setIsApplied(true);
      toast.success('Successfully applied to the job!');
    } catch (err) {
      toast.error(err.message || 'Failed to apply');
    }
  };

  if (isLoading) {
    return (
      <div className="job-details-page">
        <div className="job-details-card loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching the latest job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <div className="job-details-card error-state">
          <h2>Job unavailable</h2>
          <p>{error || 'This job might have been closed or removed.'}</p>
          <button className="primary-btn" onClick={() => navigate(-1)}>Back to Browse</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <Navbar showTabs={false} />
      <div className="job-details-card">
        <div className="job-details-header">
          <button className="btn-outline" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Browse
          </button>
          <div className="job-details-actions">
            {!isEmployer && (
              <>
                <button className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={toggleSave}>
                  {isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
                </button>
                <button className="primary-btn" onClick={handleApply} disabled={isApplied}>
                  {isApplied ? 'Application Submitted' : 'Quick Apply'}
                </button>
              </>
            )}
            {isEmployer && (
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Viewing as Employer
              </div>
            )}
          </div>
        </div>

        <h1 className="job-details-title">{job.title}</h1>
        <div className="job-details-subtitle">
          <span className="company-info">{job.company}</span>
          <span className="dot">•</span>
          <span className="location-info">{job.isRemote ? '🌍 Remote' : job.location}</span>
          <span className="dot">•</span>
          <span className="job-type-info">{job.type}</span>
        </div>

        <div className="job-details-meta">
          <div className="meta-block">
            <strong>Target Compensation</strong>
            <span>{job.salary || 'Competitive'}</span>
          </div>
          <div className="meta-block">
            <strong>Required Experience</strong>
            <span>{job.experience || 'Entry Level'}</span>
          </div>
          <div className="meta-block">
            <strong>Date Posted</strong>
            <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
          <div className="meta-block">
            <strong>Internal Job Ref</strong>
            <span>{job._id?.slice(-8).toUpperCase() || 'AMDX-REF'}</span>
          </div>
        </div>

        <div className="job-details-section">
          <h3>Role Overview</h3>
          <p>{job.description}</p>
        </div>

        {!!job.skills?.length && (
          <div className="job-details-section">
            <h3>Key Skills Needed</h3>
            <div className="job-details-tags">
              {job.skills.map((s, idx) => (
                <span key={`${s}-${idx}`} className="tag">{s}</span>
              ))}
            </div>
          </div>
        )}

        {!!job.benefits?.length && (
          <div className="job-details-section">
            <h3>Perks & Benefits</h3>
            <div className="job-details-tags">
              {job.benefits.map((b, idx) => (
                <span key={`${b}-${idx}`} className="tag benefit-tag">{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
