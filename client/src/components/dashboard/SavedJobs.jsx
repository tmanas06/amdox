import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SavedJobs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock saved jobs data
  const savedJobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp India',
      location: 'Bangalore',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      savedDate: '2025-01-10',
      status: 'saved',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS']
    },
    {
      id: 2,
      title: 'React.js Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹12-20 LPA',
      savedDate: '2025-01-08',
      status: 'applied',
      skills: ['React', 'Redux', 'JavaScript', 'REST APIs']
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'DataSystems',
      location: 'Pune',
      type: 'Full-time',
      salary: '₹18-30 LPA',
      savedDate: '2025-01-05',
      status: 'saved',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker']
    }
  ];

  const filteredJobs = activeTab === 'all' 
    ? savedJobs 
    : savedJobs.filter(job => job.status === activeTab);

  const handleRemoveJob = (jobId) => {
    // In a real app, this would make an API call to remove the job
    console.log(`Removing job ${jobId} from saved jobs`);
  };

  const handleApplyJob = (jobId) => {
    // In a real app, this would navigate to the application page
    console.log(`Applying to job ${jobId}`);
  };

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h2>Saved Jobs</h2>
        <div className="saved-jobs-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            Applied
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>No saved jobs found.</p>
          <p>Save jobs to keep track of positions you're interested in.</p>
          <button className="btn-primary">Browse Jobs</button>
        </div>
      ) : (
        <div className="saved-jobs-list">
          {filteredJobs.map(job => (
            <div key={job.id} className="saved-job-card">
              <div className="saved-job-content">
                <div className="saved-job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                  
                  <div className="job-meta">
                    <span className="job-location">{job.location}</span>
                    <span className="job-type">{job.type}</span>
                    <span className="job-salary">{job.salary}</span>
                  </div>
                  
                  <div className="job-skills">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  
                  <div className="saved-date">
                    Saved on {job.savedDate}
                  </div>
                </div>
                
                <div className="saved-job-actions">
                  {job.status === 'saved' && (
                    <button 
                      className="btn-apply"
                      onClick={() => handleApplyJob(job.id)}
                    >
                      Apply Now
                    </button>
                  )}
                  {job.status === 'applied' && (
                    <span className="applied-badge">
                      Applied ✓
                    </span>
                  )}
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveJob(job.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
