# Design Document: Enhanced Job Features

## Overview

This design document outlines the technical implementation for five major enhancements to the AMDox Jobs platform: Job Detail Pages, Advanced Filtering, Job Alerts, Job Comparison, and Company Profile Pages. The implementation will leverage the existing MERN stack architecture (MongoDB, Express, React, Node.js) with Firebase authentication, while maintaining the modern design system featuring purple-coral gradients, glassmorphism effects, and dark/light theme support.

The design emphasizes:
- Seamless integration with existing features and design patterns
- Mobile-first responsive design with accessibility compliance
- Performance optimization through caching and efficient state management
- Scalable architecture supporting future enhancements

## Architecture

### System Architecture

The enhanced features follow the existing three-tier architecture:

**Client Tier (React)**
- New React components for job details, filters, comparison, and company pages
- Enhanced state management using React Context API for filter state and comparison selections
- Integration with existing AuthContext for authentication state
- Reuse of existing theme system and CSS design tokens

**Server Tier (Express/Node.js)**
- New REST API endpoints for advanced filtering, job alerts, and company data
- Background job scheduler for processing and sending job alert emails
- Enhanced job and company data models in MongoDB
- Integration with existing authentication middleware

**Data Tier (MongoDB)**
- Extended Job and User schemas to support new features
- New Company and JobAlert collections
- Indexes optimized for filtering and querying performance

### Component Architecture

```
Client Components:
├── JobDetailPage/
│   ├── JobDetailPage.jsx (main container)
│   ├── JobHeader.jsx (title, company, location)
│   ├── JobDescription.jsx (full description)
│   ├── JobRequirements.jsx (skills, qualifications)
│   ├── JobBenefits.jsx (benefits list)
│   ├── CompanyInfo.jsx (company summary)
│   └── JobActions.jsx (apply, save buttons)
├── AdvancedFilters/
│   ├── FilterPanel.jsx (main container)
│   ├── SalaryRangeSlider.jsx (dual-handle slider)
│   ├── ExperienceLevelFilter.jsx (checkbox group)
│   ├── CompanySizeFilter.jsx (checkbox group)
│   └── FilterSummary.jsx (active filters display)
├── JobAlerts/
│   ├── JobAlertsSettings.jsx (main settings page)
│   ├── AlertPreferenceForm.jsx (create/edit form)
│   ├── AlertsList.jsx (list of user alerts)
│   └── AlertItem.jsx (individual alert card)
├── JobComparison/
│   ├── ComparisonPage.jsx (main container)
│   ├── ComparisonTable.jsx (side-by-side table)
│   ├── ComparisonRow.jsx (attribute row)
│   ├── ComparisonSelector.jsx (job selection UI)
│   └── ComparisonActions.jsx (apply, save actions)
└── CompanyProfile/
    ├── CompanyProfilePage.jsx (main container)
    ├── CompanyHeader.jsx (logo, name, info)
    ├── CompanyAbout.jsx (description, mission)
    ├── CompanyCulture.jsx (values, benefits)
    └── CompanyJobs.jsx (job listings)
```

## Components and Interfaces

### 1. Job Detail Page

**JobDetailPage Component**

```javascript
// Props interface
interface JobDetailPageProps {
  jobId: string;
}

// Component structure
const JobDetailPage = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch job details on mount
  useEffect(() => {
    fetchJobDetails(jobId);
  }, [jobId]);

  // Render job detail sections
  return (
    <div className="job-detail-page">
      <JobHeader job={job} />
      <JobDescription description={job.description} />
      <JobRequirements requirements={job.requirements} />
      <JobBenefits benefits={job.benefits} />
      <CompanyInfo company={job.company} />
      <JobActions job={job} user={user} />
    </div>
  );
};
```

**API Endpoint**

```
GET /api/jobs/:jobId
Response: {
  _id: string,
  title: string,
  company: {
    _id: string,
    name: string,
    logo: string,
    size: string,
    industry: string
  },
  location: string,
  salaryRange: { min: number, max: number },
  jobType: string,
  experienceLevel: string,
  description: string,
  requirements: string[],
  qualifications: string[],
  benefits: string[],
  skills: string[],
  postedDate: Date,
  applicationDeadline: Date,
  isActive: boolean
}
```

### 2. Advanced Filtering System

**FilterPanel Component**

```javascript
// Filter state interface
interface FilterState {
  salaryRange: { min: number, max: number };
  experienceLevels: string[];
  companySizes: string[];
  jobTypes: string[];
  locations: string[];
}

// Component structure
const FilterPanel = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleSalaryChange = (range) => {
    const newFilters = { ...filters, salaryRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleExperienceChange = (levels) => {
    const newFilters = { ...filters, experienceLevels: levels };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Similar handlers for other filters

  return (
    <aside className="filter-panel">
      <SalaryRangeSlider 
        value={filters.salaryRange}
        onChange={handleSalaryChange}
      />
      <ExperienceLevelFilter
        selected={filters.experienceLevels}
        onChange={handleExperienceChange}
      />
      <CompanySizeFilter
        selected={filters.companySizes}
        onChange={handleCompanySizeChange}
      />
    </aside>
  );
};
```

**SalaryRangeSlider Component**

```javascript
const SalaryRangeSlider = ({ value, onChange, min = 0, max = 300000 }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
  };

  const handleCommit = () => {
    onChange(localValue);
  };

  return (
    <div className="salary-range-slider">
      <label>Salary Range</label>
      <DualRangeSlider
        min={min}
        max={max}
        value={localValue}
        onChange={handleChange}
        onChangeCommitted={handleCommit}
        step={5000}
        aria-label="Salary range"
      />
      <div className="range-display">
        ${localValue.min.toLocaleString()} - ${localValue.max.toLocaleString()}
      </div>
    </div>
  );
};
```

**API Endpoint**

```
GET /api/jobs/search?filters={filterObject}
Query Parameters:
  - salaryMin: number
  - salaryMax: number
  - experienceLevels: string[] (comma-separated)
  - companySizes: string[] (comma-separated)
  - jobTypes: string[] (comma-separated)
  - locations: string[] (comma-separated)
  - page: number
  - limit: number

Response: {
  jobs: Job[],
  totalCount: number,
  page: number,
  totalPages: number
}
```

### 3. Job Alert System

**JobAlertsSettings Component**

```javascript
const JobAlertsSettings = () => {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserAlerts();
  }, []);

  const handleSaveAlert = async (alertData) => {
    if (editingAlert) {
      await updateAlert(editingAlert._id, alertData);
    } else {
      await createAlert(alertData);
    }
    fetchUserAlerts();
    setShowForm(false);
  };

  return (
    <div className="job-alerts-settings">
      <header>
        <h1>Job Alerts</h1>
        <button onClick={() => setShowForm(true)}>
          Create New Alert
        </button>
      </header>
      {showForm && (
        <AlertPreferenceForm
          initialData={editingAlert}
          onSave={handleSaveAlert}
          onCancel={() => setShowForm(false)}
        />
      )}
      <AlertsList
        alerts={alerts}
        onEdit={setEditingAlert}
        onDelete={handleDeleteAlert}
        onToggle={handleToggleAlert}
      />
    </div>
  );
};
```

**AlertPreferenceForm Component**

```javascript
interface AlertPreference {
  _id?: string;
  userId: string;
  name: string;
  keywords: string[];
  locations: string[];
  salaryRange: { min: number, max: number };
  experienceLevels: string[];
  companySizes: string[];
  jobTypes: string[];
  frequency: 'immediate' | 'daily' | 'weekly';
  isActive: boolean;
}

const AlertPreferenceForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || defaultAlertData);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateAlertData(formData);
    if (Object.keys(validationErrors).length === 0) {
      onSave(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="alert-preference-form">
      <input
        type="text"
        name="name"
        placeholder="Alert name"
        value={formData.name}
        onChange={handleInputChange}
        aria-label="Alert name"
      />
      <TagInput
        label="Keywords"
        value={formData.keywords}
        onChange={(keywords) => setFormData({ ...formData, keywords })}
      />
      <SalaryRangeSlider
        value={formData.salaryRange}
        onChange={(range) => setFormData({ ...formData, salaryRange: range })}
      />
      {/* Additional form fields */}
      <div className="form-actions">
        <button type="submit">Save Alert</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};
```

**Background Job Processor**

```javascript
// Server-side job scheduler
const cron = require('node-cron');
const JobAlert = require('./models/JobAlert');
const Job = require('./models/Job');
const emailService = require('./services/emailService');

// Run every hour to check for new matching jobs
cron.schedule('0 * * * *', async () => {
  const activeAlerts = await JobAlert.find({ isActive: true });
  
  for (const alert of activeAlerts) {
    const lastChecked = alert.lastChecked || new Date(0);
    const matchingJobs = await Job.find({
      createdAt: { $gt: lastChecked },
      ...buildFilterQuery(alert)
    });

    if (matchingJobs.length > 0) {
      await emailService.sendJobAlertEmail(alert.userId, matchingJobs);
      alert.lastChecked = new Date();
      await alert.save();
    }
  }
});
```

**API Endpoints**

```
POST /api/job-alerts
Body: AlertPreference
Response: { alert: AlertPreference }

GET /api/job-alerts
Response: { alerts: AlertPreference[] }

PUT /api/job-alerts/:alertId
Body: Partial<AlertPreference>
Response: { alert: AlertPreference }

DELETE /api/job-alerts/:alertId
Response: { success: boolean }

PATCH /api/job-alerts/:alertId/toggle
Response: { alert: AlertPreference }
```

### 4. Job Comparison Feature

**ComparisonContext**

```javascript
// Context for managing comparison state
const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const MAX_COMPARISON = 5;

  const addJob = (job) => {
    if (selectedJobs.length < MAX_COMPARISON) {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

  const removeJob = (jobId) => {
    setSelectedJobs(selectedJobs.filter(j => j._id !== jobId));
  };

  const clearAll = () => {
    setSelectedJobs([]);
  };

  const isSelected = (jobId) => {
    return selectedJobs.some(j => j._id === jobId);
  };

  return (
    <ComparisonContext.Provider value={{
      selectedJobs,
      addJob,
      removeJob,
      clearAll,
      isSelected,
      count: selectedJobs.length,
      maxReached: selectedJobs.length >= MAX_COMPARISON
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};
```

**ComparisonPage Component**

```javascript
const ComparisonPage = () => {
  const { selectedJobs, removeJob, clearAll } = useComparison();
  const navigate = useNavigate();

  if (selectedJobs.length === 0) {
    return (
      <div className="comparison-empty">
        <p>No jobs selected for comparison</p>
        <button onClick={() => navigate('/jobs')}>
          Browse Jobs
        </button>
      </div>
    );
  }

  const attributes = [
    { key: 'title', label: 'Job Title' },
    { key: 'company.name', label: 'Company' },
    { key: 'location', label: 'Location' },
    { key: 'salaryRange', label: 'Salary', format: formatSalary },
    { key: 'experienceLevel', label: 'Experience Level' },
    { key: 'jobType', label: 'Job Type' },
    { key: 'benefits', label: 'Benefits', format: formatList },
    { key: 'skills', label: 'Required Skills', format: formatList }
  ];

  return (
    <div className="comparison-page">
      <header>
        <h1>Compare Jobs</h1>
        <button onClick={clearAll}>Clear All</button>
      </header>
      <ComparisonTable
        jobs={selectedJobs}
        attributes={attributes}
        onRemove={removeJob}
      />
    </div>
  );
};
```

**ComparisonTable Component**

```javascript
const ComparisonTable = ({ jobs, attributes, onRemove }) => {
  return (
    <div className="comparison-table-container">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Attribute</th>
            {jobs.map(job => (
              <th key={job._id}>
                <button
                  onClick={() => onRemove(job._id)}
                  aria-label={`Remove ${job.title}`}
                  className="remove-btn"
                >
                  ×
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map(attr => (
            <ComparisonRow
              key={attr.key}
              attribute={attr}
              jobs={jobs}
            />
          ))}
          <tr className="actions-row">
            <td>Actions</td>
            {jobs.map(job => (
              <td key={job._id}>
                <ComparisonActions job={job} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
```

### 5. Company Profile Pages

**CompanyProfilePage Component**

```javascript
const CompanyProfilePage = ({ companyId }) => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCompanyData();
    fetchCompanyJobs();
    checkFollowStatus();
  }, [companyId]);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowCompany(companyId);
    } else {
      await followCompany(companyId);
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="company-profile-page">
      <CompanyHeader
        company={company}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
      />
      <div className="company-content">
        <CompanyAbout description={company.description} mission={company.mission} />
        <CompanyCulture
          values={company.values}
          benefits={company.benefits}
          workEnvironment={company.workEnvironment}
        />
        <CompanyJobs jobs={jobs} companyName={company.name} />
      </div>
    </div>
  );
};
```

**API Endpoints**

```
GET /api/companies/:companyId
Response: {
  _id: string,
  name: string,
  logo: string,
  industry: string,
  size: string,
  location: string,
  description: string,
  mission: string,
  values: string[],
  benefits: string[],
  workEnvironment: string,
  socialLinks: {
    website: string,
    linkedin: string,
    twitter: string
  },
  activeJobCount: number
}

GET /api/companies/:companyId/jobs
Response: { jobs: Job[] }

POST /api/companies/:companyId/follow
Response: { success: boolean, isFollowing: boolean }

DELETE /api/companies/:companyId/follow
Response: { success: boolean, isFollowing: boolean }
```

## Data Models

### Extended Job Schema

```javascript
const jobSchema = new mongoose.Schema({
  // Existing fields
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: { type: String, required: true },
    logo: String
  },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
  
  // Enhanced fields
  salaryRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive']
  },
  requirements: [String],
  qualifications: [String],
  benefits: [String],
  skills: [String],
  applicationDeadline: Date,
  
  // Metadata
  postedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for filtering performance
jobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ 'company._id': 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ isActive: 1, postedDate: -1 });
```

### Company Schema

```javascript
const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: String,
  industry: String,
  size: {
    type: String,
    enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
  },
  location: String,
  description: String,
  mission: String,
  values: [String],
  benefits: [String],
  workEnvironment: String,
  socialLinks: {
    website: String,
    linkedin: String,
    twitter: String,
    facebook: String
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ size: 1 });
```

### JobAlert Schema

```javascript
const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  keywords: [String],
  locations: [String],
  salaryRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  experienceLevels: [{
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive']
  }],
  companySizes: [{
    type: String,
    enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
  }],
  jobTypes: [{
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  }],
  frequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: { type: Boolean, default: true },
  lastChecked: Date,
  emailsSent: { type: Number, default: 0 }
}, {
  timestamps: true
});

jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ lastChecked: 1 });
```

### Extended User Schema

```javascript
// Add to existing User schema
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // New fields for enhanced features
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  followedCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  emailVerified: { type: Boolean, default: false },
  emailPreferences: {
    jobAlerts: { type: Boolean, default: true },
    companyUpdates: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  }
});
```

