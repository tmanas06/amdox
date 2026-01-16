import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Jobs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  
  // Mock job data - in a real app, this would come from an API
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp India',
      logo: 'https://logo.clearbit.com/techcorp.com',
      location: 'Bangalore',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      posted: '2 days ago',
      description: 'We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      experience: '3-5 years',
      jobId: 'TCI-FS-001'
    },
    {
      id: 2,
      title: 'React.js Developer',
      company: 'StartupXYZ',
      logo: 'https://logo.clearbit.com/startupxyz.com',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹12-20 LPA',
      posted: '1 week ago',
      description: 'Join our fast-growing startup as a React.js Developer. Work on exciting projects and help shape the future of our product.',
      skills: ['React', 'Redux', 'JavaScript', 'REST APIs'],
      experience: '2-4 years',
      jobId: 'SXYZ-REACT-002'
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'DataSystems',
      logo: 'https://logo.clearbit.com/datasystems.com',
      location: 'Pune',
      type: 'Full-time',
      salary: '₹18-30 LPA',
      posted: '3 days ago',
      description: 'Looking for a Backend Engineer with strong experience in distributed systems and cloud infrastructure.',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experience: '4-6 years',
      jobId: 'DS-BE-003'
    },
    {
      id: 4,
      title: 'Frontend Developer',
      company: 'WebCraft',
      logo: 'https://logo.clearbit.com/webcraft.io',
      location: 'Hyderabad',
      type: 'Contract',
      salary: '₹10-15 LPA',
      posted: '5 days ago',
      description: 'Seeking a talented Frontend Developer to create beautiful and responsive user interfaces.',
      skills: ['JavaScript', 'React', 'CSS3', 'HTML5'],
      experience: '1-3 years',
      jobId: 'WC-FE-004'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudScale',
      logo: 'https://logo.clearbit.com/cloudscale.com',
      location: 'Bangalore',
      type: 'Full-time',
      salary: '₹20-35 LPA',
      posted: '1 day ago',
      description: 'Looking for a DevOps Engineer to automate and optimize our infrastructure and deployment processes.',
      skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Docker'],
      experience: '3-5 years',
      jobId: 'CS-DEVOPS-005'
    }
  ]);

  // Load saved and applied jobs from localStorage on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setSavedJobs(saved);
    setAppliedJobs(applied);
    
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when savedJobs or appliedJobs change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  const handleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast.success('Job removed from saved jobs');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved successfully!');
    }
  };

  const handleApplyJob = (job) => {
    if (appliedJobs.includes(job.jobId)) {
      toast.info('You have already applied to this job');
      return;
    }
    
    setAppliedJobs([...appliedJobs, job.jobId]);
    
    // In a real app, this would be an API call
    console.log('Applying to job:', job.jobId);
    
    // Show success message
    toast.success(`Application submitted for ${job.title} at ${job.company}`);
    
    // Remove from saved jobs if it was saved
    if (savedJobs.includes(job.jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== job.jobId));
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !jobType || job.type.toLowerCase() === jobType.toLowerCase();
    const matchesLocation = !location || job.location.toLowerCase() === location.toLowerCase();
    
    return matchesSearch && matchesType && matchesLocation;
  });

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Find Your Dream Job</h2>
        <p className="jobs-subtitle">Browse through {filteredJobs.length} available positions</p>
        
        <div className="jobs-filters">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search jobs, companies, or skills..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-group">
            <label htmlFor="job-type">Job Type</label>
            <select 
              id="job-type"
              className="filter-select"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select 
              id="location"
              className="filter-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          
          <button 
            className="clear-filters"
            onClick={() => {
              setSearchTerm('');
              setJobType('');
              setLocation('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="jobs-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredJobs.length}</span>
          <span className="stat-label">Jobs Found</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{savedJobs.length}</span>
          <span className="stat-label">Saved Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{appliedJobs.length}</span>
          <span className="stat-label">Applications</span>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="no-results">
          <h3>No jobs found matching your criteria</h3>
          <p>Try adjusting your search or filters to find more jobs</p>
          <button 
            className="btn-primary"
            onClick={() => {
              setSearchTerm('');
              setJobType('');
              setLocation('');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-list">
            {currentJobs.map(job => (
              <div key={job.id} className={`job-card ${appliedJobs.includes(job.jobId) ? 'applied' : ''}`}>
                <div className="job-card-header" style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div className="company-logo" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #6e8efb, #a777e3)'
                  }}>
                    <img 
                      src={job.logo} 
                      alt={job.company}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/50/007bff/ffffff?text=' + job.company.charAt(0);
                      }}
                    />
                  </div>
                  <div className="job-title-section">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.company} • <span className="job-id">{job.jobId}</span></p>
                  </div>
                  <div className="job-meta">
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-type">📋 {job.type}</span>
                    <span className="job-salary">💰 {job.salary}</span>
                    <span className="job-experience">👨‍💻 {job.experience}</span>
                  </div>
                </div>
                
                <p className="job-description">
                  {job.description}
                </p>
                
                <div className="job-skills">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                
                <div className="job-actions">
                  <button 
                    className={`btn-save ${savedJobs.includes(job.jobId) ? 'saved' : ''}`}
                    onClick={() => handleSaveJob(job.jobId)}
                  >
                    <span className="icon">{savedJobs.includes(job.jobId) ? '🔖' : '🔖'}</span>
                    {savedJobs.includes(job.jobId) ? 'Saved' : 'Save'}
                  </button>
                  <button 
                    className={`btn-apply ${appliedJobs.includes(job.jobId) ? 'applied' : ''}`}
                    onClick={() => handleApplyJob(job)}
                    disabled={appliedJobs.includes(job.jobId)}
                  >
                    {appliedJobs.includes(job.jobId) ? '✓ Applied' : 'Apply Now'}
                  </button>
                </div>
                
                <div className="job-footer">
                  <span className="job-posted">⏱️ Posted {job.posted}</span>
                  {appliedJobs.includes(job.jobId) && (
                    <span className="application-status">✓ Application Submitted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
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
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <span className="page-ellipsis">...</span>
                )}
              </div>
              
              <button 
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
