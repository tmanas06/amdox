import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });

      // Handle specific status codes
      if (error.response.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return error response
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      return Promise.reject({
        message: error.message || 'An error occurred while setting up the request',
      });
    }
  }
);

// API methods
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  firebaseLogin: (firebaseData) => api.post('/auth/firebase-login', firebaseData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const jobs = {
  // Get all jobs with optional filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();

    // Add optional parameters if they exist
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.type) queryParams.append('type', params.type);
    if (params.remote) queryParams.append('remote', params.remote);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return api.get(`/jobs?${queryParams.toString()}`);
  },

  // Get a single job by ID
  getById: (id) => api.get(`/jobs/${id}`),

  // Create a new job (employer only)
  create: (jobData) => api.post('/jobs', jobData),

  // Update a job (employer only)
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),

  // Delete a job (employer or admin only)
  delete: (id) => api.delete(`/jobs/${id}`),

  // Get jobs posted by current employer
  getEmployerJobs: () => api.get('/jobs/employer/my-jobs'),

  // Toggle job status (active/inactive)
  toggleStatus: (id) => api.patch(`/jobs/${id}/status`),

  // Apply to a job (job seeker only)
  apply: (jobId, applicationData = {}) =>
    api.post(`/jobs/${jobId}/apply`, applicationData),
};

export const applications = {
  // Get all applications for current user (job seeker)
  getMyApplications: () => api.get('/applications/me'),

  // Get all applications for employer jobs
  getEmployerApplications: () => api.get('/applications/employer'),

  // Update application status (employer only)
  updateStatus: (applicationId, status) =>
    api.patch(`/applications/${applicationId}/status`, { status }),

  // Invite candidate to apply
  invite: (data) => api.post('/applications/invite', data),

  // Rounds
  addRound: (appId, data) => api.post(`/applications/${appId}/rounds`, data),
  updateRound: (appId, roundId, data) => api.patch(`/applications/${appId}/rounds/${roundId}`, data),

  // Chat
  addMessage: (appId, content) => api.post(`/applications/${appId}/messages`, { content }),
};

export const user = {
  // Update user profile
  updateProfile: (userId, userData) =>
    api.put(`/users/${userId}/profile`, userData),

  // Upload profile picture
  uploadProfilePicture: (userId, file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.post(`/users/${userId}/profile/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload resume and get parsed profile suggestions
  uploadResume: (userId, file) => {
    const formData = new FormData();
    formData.append('resume', file);

    return api.post(`/users/${userId}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all job seekers (employer only)
  getJobSeekers: () => api.get('/users/job-seekers'),
};

const apiExports = {
  auth,
  jobs,
  applications,
  user,
};

export default apiExports;
