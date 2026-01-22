import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobs as jobService } from '../services/api';
import './JobDetails.css';

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const savedJobIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('savedJobs') || '[]');
    } catch {
      return [];
    }
  }, []);

  const appliedJobIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    } catch {
      return [];
    }
  }, []);

  const isSaved = savedJobIds.includes(id);
  const isApplied = appliedJobIds.includes(id);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await jobService.getById(id);
        setJob(response.data?.data || null);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  const toggleSave = () => {
    const current = (() => {
      try {
        return JSON.parse(localStorage.getItem('savedJobs') || '[]');
      } catch {
        return [];
      }
    })();

    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    localStorage.setItem('savedJobs', JSON.stringify(next));
    toast.success(current.includes(id) ? 'Job removed from saved' : 'Job saved successfully');
    // quick UX: refresh current page state
    window.location.reload();
  };

  const apply = () => {
    const current = (() => {
      try {
        return JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      } catch {
        return [];
      }
    })();

    if (current.includes(id)) {
      toast.info('You have already applied to this job');
      return;
    }

    localStorage.setItem('appliedJobs', JSON.stringify([...current, id]));

    // If saved, remove from saved
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem('savedJobs') || '[]');
      } catch {
        return [];
      }
    })();
    if (saved.includes(id)) {
      localStorage.setItem('savedJobs', JSON.stringify(saved.filter(x => x !== id)));
    }

    toast.success('Successfully applied to the job!');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="job-details-page">
        <div className="job-details-card">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <div className="job-details-card">
          <h2>Job not available</h2>
          <p>{error || 'This job may have been removed.'}</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="job-details-card">
        <div className="job-details-header">
          <button className="btn-outline" onClick={() => navigate(-1)}>← Back</button>
          <div className="job-details-actions">
            <button className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={toggleSave}>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button className="btn-primary" onClick={apply} disabled={isApplied}>
              {isApplied ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        </div>

        <h1 className="job-details-title">{job.title}</h1>
        <div className="job-details-subtitle">
          <span>{job.company}</span>
          <span>•</span>
          <span>{job.isRemote ? 'Remote' : job.location}</span>
          <span>•</span>
          <span>{job.type}</span>
        </div>

        <div className="job-details-meta">
          <div><strong>Salary:</strong> {job.salary || '—'}</div>
          <div><strong>Experience:</strong> {job.experience || '—'}</div>
          <div><strong>Posted:</strong> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}</div>
          <div><strong>Job ID:</strong> {job.jobId || '—'}</div>
        </div>

        <div className="job-details-section">
          <h3>Description</h3>
          <p>{job.description}</p>
        </div>

        {!!job.skills?.length && (
          <div className="job-details-section">
            <h3>Skills</h3>
            <div className="job-details-tags">
              {job.skills.map((s, idx) => (
                <span key={`${s}-${idx}`} className="tag">{s}</span>
              ))}
            </div>
          </div>
        )}

        {!!job.benefits?.length && (
          <div className="job-details-section">
            <h3>Benefits</h3>
            <ul>
              {job.benefits.map((b, idx) => (
                <li key={`${b}-${idx}`}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

