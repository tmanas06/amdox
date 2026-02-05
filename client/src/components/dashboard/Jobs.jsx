import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jobs as jobService } from '../../services/api';
import './Jobs.css';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const jobsPerPage = 10;

  // Use a ref to track if the initial load has happened
  // This prevents double-fetching in React 18 Strict Mode effectively
  const initialized = useRef(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page and jobs when filters change
  useEffect(() => {
    setCurrentPage(1);
    setJobs([]);
    setHasMore(true);
  }, [debouncedSearchTerm, jobType, location, minSalary, maxSalary, experienceLevel]);

  // Fetch jobs from API
  const fetchJobs = useCallback(async (page) => {
    try {
      setIsLoading(true);
      const params = {
        search: debouncedSearchTerm,
        location,
        type: jobType,
        remote: location === 'remote' ? 'true' : '',
        page: page,
        limit: jobsPerPage,
        minSalary: minSalary || undefined,
        maxSalary: maxSalary || undefined,
        experienceLevel: experienceLevel || undefined
      };

      const response = await jobService.getAll(params);

      if (response && response.data) {
        const newJobs = response.data.data || [];
        const total = response.data.total || 0;

        setJobs(prevJobs => {
          // If page is 1, replace jobs. Otherwise, append.
          if (page === 1) return newJobs;

          // Filter out duplicates just in case
          const existingIds = new Set(prevJobs.map(j => j._id));
          const uniqueNewJobs = newJobs.filter(j => !existingIds.has(j._id));
          return [...prevJobs, ...uniqueNewJobs];
        });

        // Determine if there are more jobs to load
        // If we received fewer jobs than requested, we've reached the end
        // Or if the total jobs matches what we have (approximately)
        if (newJobs.length < jobsPerPage || (params.page * params.limit) >= total) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(error.message || 'Failed to load jobs');
      if (page === 1) setJobs([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, jobType, location, minSalary, maxSalary, experienceLevel]);

  // Effect to trigger fetch when currentPage changes
  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, fetchJobs]);

  // Load saved and applied jobs on component mount
  useEffect(() => {
    const fetchSavedAndApplied = async () => {
      try {
        const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        setAppliedJobs(applied);

        // Fetch saved jobs from backend
        // Only checking if token exists to avoid errors if not logged in
        if (localStorage.getItem('token')) {
          const res = await jobService.getSaved();
          if (res.data && res.data.success) {
            const fetchedSavedIds = res.data.data.map(job => job._id);
            setSavedJobs(fetchedSavedIds);
          }
        }
      } catch (err) {
        console.error('Error fetching saved/applied jobs:', err);
      }
    };

    if (!initialized.current) {
      initialized.current = true;
      fetchSavedAndApplied();
    }
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight &&
        !isLoading &&
        hasMore
      ) {
        setCurrentPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore]);

  // Save to localStorage when savedJobs or appliedJobs change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  // Toggle save job
  const toggleSaveJob = async (jobId) => {
    const isSaved = savedJobs.includes(jobId);

    try {
      if (isSaved) {
        await jobService.unsave(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      } else {
        await jobService.save(jobId);
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
      toast.error(err.message || 'Failed to update saved jobs');

      // Fallback for demo/no-backend if needed, though this seems to use a real backend
      if (!localStorage.getItem('token')) {
        toast.warning('Please log in to save jobs');
      }
    }
  };

  const handleApplyJob = (job) => {
    if (appliedJobs.includes(job._id)) {
      toast.info('You have already applied to this job');
      return;
    }

    (async () => {
      try {
        await jobService.apply(job._id, {});
        const newAppliedJobs = [...appliedJobs, job._id];
        setAppliedJobs(newAppliedJobs);
        localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
        toast.success('Successfully applied to the job!');
      } catch (err) {
        console.error('Apply failed:', err);
        toast.error(err.message || 'Failed to apply to job');
      }
    })();

    // Remove from saved jobs when applied
    if (savedJobs.includes(job._id)) {
      const updatedSavedJobs = savedJobs.filter(id => id !== job._id);
      setSavedJobs(updatedSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    }
  };

  // Get unique job types, locations, and experience levels for filters
  // Note: Since we are paginating, these derived lists will only show filters based on *loaded* jobs.
  // Ideally, these should come from a separate API endpoint or be static. 
  // For now, keeping as is but aware of the limitation.
  const jobTypes = [...new Set(jobs.map(job => job.type).filter(Boolean))];
  const locations = [
    'remote',
    ...new Set(
      jobs
        .flatMap(job => (job.isRemote ? [] : [job.location]))
        .filter(Boolean)
    ),
  ];

  const experienceLevels = [
    'Internship',
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Lead',
    'Manager',
    'Executive'
  ];

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <div className="header-content">
          <h1>Find Your Dream Job</h1>
          <p className="jobs-subtitle">Browse through available positions</p>
        </div>

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search for jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>

          <div className="filter-actions">
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setJobType('');
                setLocation('');
                setMinSalary('');
                setMaxSalary('');
                setExperienceLevel('');
              }}
              disabled={!searchTerm && !jobType && !location && !minSalary && !maxSalary && !experienceLevel}
            >
              Clear Filters
            </button>

            <button
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className={`advanced-filters ${showAdvancedFilters ? 'is-visible' : ''}`}>
            <div className="advanced-filters-grid">
              <div className="filter-group">
                <label htmlFor="job-type" className="filter-label">Job Type</label>
                <select
                  id="job-type"
                  className="filter-select"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">All Job Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  {/* Fallback specific options if dynamic list is empty initially */}
                  {!jobTypes.length && ['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
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
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc === 'remote' ? 'Remote' : loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="min-salary" className="filter-label">Min Salary ($)</label>
                <input
                  type="number"
                  id="min-salary"
                  className="filter-input"
                  placeholder="Min"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="max-salary" className="filter-label">Max Salary ($)</label>
                <input
                  type="number"
                  id="max-salary"
                  className="filter-input"
                  placeholder="Max"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  min={minSalary || '0'}
                  step="1000"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="experience-level" className="filter-label">Experience Level</label>
                <select
                  id="experience-level"
                  className="filter-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  aria-label="Filter by experience level"
                >
                  <option value="">Any Experience Level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(searchTerm || jobType || location || minSalary || maxSalary || experienceLevel) && (
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
              {minSalary && (
                <span className="filter-tag">
                  ${minSalary}+
                  <button onClick={() => setMinSalary('')} aria-label="Remove min salary filter">×</button>
                </span>
              )}
              {maxSalary && (
                <span className="filter-tag">
                  Up to ${maxSalary}
                  <button onClick={() => setMaxSalary('')} aria-label="Remove max salary filter">×</button>
                </span>
              )}
              {experienceLevel && (
                <span className="filter-tag">
                  {experienceLevel}
                  <button onClick={() => setExperienceLevel('')} aria-label="Remove experience level filter">×</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="jobs-content">
        <div className="jobs-list">
          {jobs.length > 0 ? (
            <>
              {jobs.map((job) => (
                <article key={job._id} className="job-card">
                  <div className="job-card-header">
                    <div className="company-logo">
                      <img
                        src={job.logo || job.postedBy?.profile?.photoURL}
                        alt={`${job.company} logo`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxwYXRoIGQ9Ik0xNiAyMXYtMkE0IDQgMCAwIDAgMTIgMTVIOEE0IDQgMCAwIDAgNCAxN3YyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
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
                        className={`btn-save ${savedJobs.includes(job._id) ? 'saved' : ''}`}
                        onClick={() => toggleSaveJob(job._id)}
                        aria-label={savedJobs.includes(job._id) ? 'Remove from saved jobs' : 'Save job'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={savedJobs.includes(job._id) ? "#3b82f6" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {savedJobs.includes(job._id) ? 'Saved' : 'Save'}
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        View
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
                        <span>
                          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                        </span>
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
                      className={`btn-apply ${appliedJobs.includes(job._id) ? 'applied' : ''}`}
                      onClick={() => handleApplyJob(job)}
                      disabled={appliedJobs.includes(job._id)}
                    >
                      {appliedJobs.includes(job._id) ? (
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
                      <span>
                        Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              {isLoading && (
                <div className="loading-container" style={{ padding: '2rem 0' }}>
                  <div className="loading-spinner"></div>
                  <p>Loading more jobs...</p>
                </div>
              )}

              {!hasMore && jobs.length > 0 && (
                <div className="no-more-results" style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                  <p>You've seen all available jobs</p>
                </div>
              )}
            </>
          ) : (
            <>
              {isLoading ? (
                <div className="loading-container" style={{ padding: '4rem 0' }}>
                  <div className="loading-spinner"></div>
                  <p>Searching for jobs...</p>
                </div>
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
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
