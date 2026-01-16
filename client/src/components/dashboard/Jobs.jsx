import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jobs as jobService } from '../../services/api';
import './Jobs.css';

const Jobs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobs, setJobs] = useState([]);
  const jobsPerPage = 5;

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchTerm,
        location: location,
        type: jobType,
        remote: location === 'remote' ? 'true' : '',
        page: currentPage,
        limit: jobsPerPage
      };
      
      const response = await jobService.getAll(params);
      if (response && response.data) {
        setJobs(response.data.data || []);
        setTotalJobs(response.data.total || 0);
      } else {
        console.error('Invalid response format:', response);
        setJobs([]);
        setTotalJobs(0);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(error.message || 'Failed to load jobs');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved and applied jobs from localStorage on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setSavedJobs(saved);
    setAppliedJobs(applied);
    
    fetchJobs();
  }, [currentPage]);

  // Handle search and filter changes
  useEffect(() => {
    fetchJobs();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, jobType, location]);

  // Save to localStorage when savedJobs or appliedJobs change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  // Toggle save job
  const toggleSaveJob = (jobId) => {
    const isSaved = savedJobs.includes(jobId);
    let updatedSavedJobs;
    
    if (isSaved) {
      updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      updatedSavedJobs = [...savedJobs, jobId];
    }
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    
    toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully');
  };

  const handleApplyJob = (job) => {
    if (appliedJobs.includes(job.jobId)) {
      toast.info('You have already applied to this job');
      return;
    }

    const newAppliedJobs = [...appliedJobs, job.jobId];
    setAppliedJobs(newAppliedJobs);
    localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
    
    // Remove from saved jobs when applied
    if (savedJobs.includes(job.jobId)) {
      const updatedSavedJobs = savedJobs.filter(id => id !== job.jobId);
      setSavedJobs(updatedSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    }

    toast.success('Successfully applied to the job!');
  };

  // Get job button state
  const getJobButtonState = (jobId) => {
    if (appliedJobs.includes(jobId)) return 'applied';
    if (savedJobs.includes(jobId)) return 'saved';
    return 'default';
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Don't need to call fetchJobs here as the useEffect will trigger it
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Finding the best jobs for you...</p>
      </div>
    );
  }

  // Get unique job types and locations for filters
  const jobTypes = [...new Set(jobs.map(job => job.type))];
  const locations = [...new Set(jobs.flatMap(job => job.isRemote ? ['Remote', job.location] : [job.location]))];

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <div className="header-content">
          <h1>Find Your Dream Job</h1>
          <p className="jobs-subtitle">Browse through {jobs.length} available positions</p>
        </div>

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by job title, company, or skills..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search jobs"
            />
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="job-type" className="filter-label">Job Type</label>
              <select
                id="job-type"
                className="filter-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                aria-label="Filter by job type"
              >
                <option value="">All Job Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="location" className="filter-label">Location</label>
              <select
                id="location"
                className="filter-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filter by location"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setJobType('');
                setLocation('');
              }}
              disabled={!searchTerm && !jobType && !location}
            >
              Clear Filters
            </button>
          </div>

          {searchTerm || jobType || location ? (
            <div className="active-filters">
              <span>Active filters: </span>
              {searchTerm && (
                <span className="filter-tag">
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} aria-label="Remove search term">×</button>
                </span>
              )}
              {jobType && (
                <span className="filter-tag">
                  {jobType}
                  <button onClick={() => setJobType('')} aria-label="Remove job type filter">×</button>
                </span>
              )}
              {location && (
                <span className="filter-tag">
                  {location}
                  <button onClick={() => setLocation('')} aria-label="Remove location filter">×</button>
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="jobs-content">
        <div className="jobs-list">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <article key={job.id} className="job-card">
                <div className="job-card-header">
                  <div className="company-logo">
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Yzc1N2QiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOSAyMWEyIDIgMCAwIDAgMi0yVjVhMiAyIDAgMCAwLTItM0g1YTIgMiAwIDAgMC0yIDJ2MTRhMiAyIDAgMCAwIDIgMnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMiAxOCAxMiAxMiA5IDEzIj48L3BvbHlsaW5lPjxyZWN0IHg9IjgiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiByeT0iMSI+PC9yZWN0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="company-info">
                      <span className="company-name">{job.company}</span>
                      {job.isRemote && (
                        <span className="remote-badge">Remote</span>
                      )}
                    </div>
                  </div>
                  <div className="job-actions">
                    <button
                      className={`btn-save ${savedJobs.includes(job.jobId) ? 'saved' : ''}`}
                      onClick={() => toggleSaveJob(job.jobId)}
                      aria-label={savedJobs.includes(job.jobId) ? 'Remove from saved jobs' : 'Save job'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={savedJobs.includes(job.jobId) ? "#3b82f6" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      {savedJobs.includes(job.jobId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="job-details">
                  <div className="job-meta">
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{job.type}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{job.location}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span>{job.salary}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{job.description}</p>
                  </div>

                  <div className="job-skills">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="skill-tag more">+{job.skills.length - 5} more</span>
                    )}
                  </div>

                  {job.benefits && job.benefits.length > 0 && (
                    <div className="job-benefits">
                      <div className="benefits-title">Benefits:</div>
                      <div className="benefits-list">
                        {job.benefits.slice(0, 3).map((benefit, index) => (
                          <span key={index} className="benefit-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            {benefit}
                          </span>
                        ))}
                        {job.benefits.length > 3 && (
                          <span className="benefit-tag more">+{job.benefits.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="job-card-footer">
                  <button
                    className={`btn-apply ${appliedJobs.includes(job.jobId) ? 'applied' : ''}`}
                    onClick={() => handleApplyJob(job)}
                    disabled={appliedJobs.includes(job.jobId)}
                  >
                    {appliedJobs.includes(job.jobId) ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Applied
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                  <div className="job-posted">
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="11" y1="16" x2="11.01" y2="16"></line>
              </svg>
              <h3>No jobs found</h3>
              <p>We couldn't find any jobs matching your criteria. Try adjusting your search or filters.</p>
              <div className="pagination-actions">
                <button
                  className="clear-all-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setJobType('');
                    setLocation('');
                  }}
                >
                  Clear All Filters
                </button>
                
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      Previous
                    </button>
                    
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => paginate(pageNum)}
                            aria-label={`Page ${pageNum}${currentPage === pageNum ? ', current page' : ''}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="page-ellipsis">...</span>
                      )}
                    </div>
                    
                    <button 
                      className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
