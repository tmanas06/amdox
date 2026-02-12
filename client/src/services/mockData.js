/**
 * Mock Data for Development/Testing
 * This file contains sample job postings and applications
 */

export const mockJobs = [
  {
    id: '1',
    jobId: 'job-001',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    logo: 'https://via.placeholder.com/80/6366f1/ffffff?text=TC',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    isRemote: true,
    posted: '2 days ago',
    description: 'We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building modern, responsive web applications using React and related technologies.',
    skills: ['React', 'TypeScript', 'Redux', 'CSS3', 'REST APIs', 'Git', 'Agile'],
    benefits: ['Health Insurance', '401(k) Matching', 'Remote Work', 'Flexible Hours', 'Learning Budget']
  },
  {
    id: '2',
    jobId: 'job-002',
    title: 'Full Stack Engineer',
    company: 'StartupHub Inc',
    logo: 'https://via.placeholder.com/80/8b5cf6/ffffff?text=SH',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$130k - $170k',
    isRemote: false,
    posted: '1 week ago',
    description: 'Join our fast-growing startup as a Full Stack Engineer. Work on cutting-edge projects using modern technologies and help shape the future of our platform.',
    skills: ['Node.js', 'React', 'MongoDB', 'Express', 'AWS', 'Docker', 'GraphQL'],
    benefits: ['Equity Options', 'Health Insurance', 'Gym Membership', 'Catered Meals', 'Team Events']
  },
  {
    id: '3',
    jobId: 'job-003',
    title: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    logo: 'https://via.placeholder.com/80/ec4899/ffffff?text=DS',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$90k - $120k',
    isRemote: true,
    posted: '3 days ago',
    description: 'We need a creative UI/UX Designer to craft beautiful and intuitive user experiences. You will work closely with developers and product managers to bring designs to life.',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'Design Systems'],
    benefits: ['Remote Work', 'Health Insurance', 'Design Tools Budget', 'Conference Tickets', 'Flexible Schedule']
  },
  {
    id: '4',
    jobId: 'job-004',
    title: 'Backend Developer',
    company: 'CloudTech Systems',
    logo: 'https://via.placeholder.com/80/10b981/ffffff?text=CT',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$110k - $150k',
    isRemote: true,
    posted: '5 days ago',
    description: 'Looking for a skilled Backend Developer to build scalable APIs and microservices. Experience with cloud platforms and distributed systems is a plus.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS', 'Microservices'],
    benefits: ['Remote Work', '401(k)', 'Health Insurance', 'Stock Options', 'Learning Budget', 'Home Office Setup']
  },
  {
    id: '5',
    jobId: 'job-005',
    title: 'DevOps Engineer',
    company: 'InfraCloud Ltd',
    logo: 'https://via.placeholder.com/80/f59e0b/ffffff?text=IC',
    location: 'Boston, MA',
    type: 'Full-time',
    salary: '$125k - $165k',
    isRemote: false,
    posted: '1 day ago',
    description: 'Join our DevOps team to automate infrastructure, improve deployment pipelines, and ensure system reliability. Experience with CI/CD and cloud platforms required.',
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Linux', 'Python', 'Monitoring'],
    benefits: ['Health Insurance', 'Dental & Vision', '401(k) Matching', 'Paid Time Off', 'Professional Development']
  },
  {
    id: '6',
    jobId: 'job-006',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    logo: 'https://via.placeholder.com/80/3b82f6/ffffff?text=AW',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    salary: '$115k - $145k',
    isRemote: true,
    posted: '4 days ago',
    description: 'We are seeking a talented Mobile App Developer to create amazing iOS and Android applications. Experience with React Native or Flutter is highly valued.',
    skills: ['React Native', 'iOS', 'Android', 'JavaScript', 'Firebase', 'REST APIs', 'Git'],
    benefits: ['Remote Work', 'Health Insurance', 'Equipment Budget', 'Flexible Hours', 'Team Retreats']
  },
  {
    id: '7',
    jobId: 'job-007',
    title: 'Data Scientist',
    company: 'DataMinds Analytics',
    logo: 'https://via.placeholder.com/80/ef4444/ffffff?text=DM',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$130k - $180k',
    isRemote: true,
    posted: '1 week ago',
    description: 'Join our data science team to analyze complex datasets, build predictive models, and drive data-driven decision making across the organization.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Data Visualization', 'Pandas'],
    benefits: ['Remote Work', 'Health Insurance', 'Learning Budget', 'Conference Attendance', 'Stock Options']
  },
  {
    id: '8',
    jobId: 'job-008',
    title: 'Product Manager',
    company: 'ProductFirst Co',
    logo: 'https://via.placeholder.com/80/14b8a6/ffffff?text=PF',
    location: 'Denver, CO',
    type: 'Full-time',
    salary: '$140k - $180k',
    isRemote: false,
    posted: '6 days ago',
    description: 'Lead product strategy and execution for our flagship products. Work with cross-functional teams to deliver exceptional user experiences and drive business growth.',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmapping', 'Stakeholder Management'],
    benefits: ['Health Insurance', 'Equity', 'Unlimited PTO', 'Professional Development', 'Team Building']
  },
  {
    id: '9',
    jobId: 'job-009',
    title: 'QA Engineer',
    company: 'QualityFirst Labs',
    logo: 'https://via.placeholder.com/80/a855f7/ffffff?text=QF',
    location: 'Portland, OR',
    type: 'Full-time',
    salary: '$95k - $125k',
    isRemote: true,
    posted: '3 days ago',
    description: 'Ensure product quality through comprehensive testing strategies. Develop automated tests and work closely with development teams to catch issues early.',
    skills: ['Test Automation', 'Selenium', 'Jest', 'Cypress', 'API Testing', 'CI/CD', 'Bug Tracking'],
    benefits: ['Remote Work', 'Health Insurance', 'Flexible Schedule', 'Learning Budget', 'Home Office Stipend']
  },
  {
    id: '10',
    jobId: 'job-010',
    title: 'Security Engineer',
    company: 'SecureNet Systems',
    logo: 'https://via.placeholder.com/80/f97316/ffffff?text=SN',
    location: 'Washington, DC',
    type: 'Full-time',
    salary: '$135k - $175k',
    isRemote: false,
    posted: '2 days ago',
    description: 'Protect our infrastructure and applications from security threats. Conduct security audits, implement best practices, and respond to security incidents.',
    skills: ['Security', 'Penetration Testing', 'Network Security', 'Compliance', 'Incident Response', 'SIEM'],
    benefits: ['Health Insurance', 'Security Clearance Support', '401(k)', 'Professional Certifications', 'Bonuses']
  },
  {
    id: '11',
    jobId: 'job-011',
    title: 'Frontend Developer (Junior)',
    company: 'WebDev Academy',
    logo: 'https://via.placeholder.com/80/06b6d4/ffffff?text=WA',
    location: 'Remote',
    type: 'Full-time',
    salary: '$70k - $90k',
    isRemote: true,
    posted: '1 day ago',
    description: 'Perfect opportunity for junior developers to grow their skills. Work on real projects with mentorship from senior developers.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive Design'],
    benefits: ['Remote Work', 'Mentorship Program', 'Health Insurance', 'Learning Resources', 'Career Growth']
  },
  {
    id: '12',
    jobId: 'job-012',
    title: 'Machine Learning Engineer',
    company: 'AI Innovations',
    logo: 'https://via.placeholder.com/80/84cc16/ffffff?text=AI',
    location: 'San Jose, CA',
    type: 'Full-time',
    salary: '$150k - $200k',
    isRemote: true,
    posted: '4 days ago',
    description: 'Build and deploy machine learning models at scale. Work on cutting-edge AI projects and contribute to our ML infrastructure.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Deep Learning', 'NLP', 'Computer Vision'],
    benefits: ['Remote Work', 'Stock Options', 'Health Insurance', 'GPU Budget', 'Conference Travel', 'Research Time']
  }
];

export const mockApplications = [
  {
    id: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    appliedDate: '2024-01-15',
    status: 'under_review',
    coverLetter: 'I am excited to apply for this position...'
  },
  {
    id: 'app-002',
    jobId: 'job-003',
    jobTitle: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    appliedDate: '2024-01-10',
    status: 'interview_scheduled',
    coverLetter: 'With 5 years of experience in UI/UX design...'
  }
];

// Helper function to filter jobs based on search criteria
export const filterJobs = (jobs, filters = {}) => {
  let filtered = [...jobs];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
      job.description.toLowerCase().includes(searchLower)
    );
  }

  if (filters.type) {
    filtered = filtered.filter(job => job.type === filters.type);
  }

  if (filters.location) {
    if (filters.location.toLowerCase() === 'remote') {
      filtered = filtered.filter(job => job.isRemote);
    } else {
      filtered = filtered.filter(job => job.location.includes(filters.location));
    }
  }

  return filtered;
};

// Helper function to paginate results
export const paginateJobs = (jobs, page = 1, limit = 5) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: jobs.slice(startIndex, endIndex),
    total: jobs.length,
    page: parseInt(page),
    totalPages: Math.ceil(jobs.length / limit)
  };
};
