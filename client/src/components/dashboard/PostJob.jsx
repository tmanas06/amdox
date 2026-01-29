import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../Navbar';
import { jobs as jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    skills: '',
    experience: '',
    isRemote: false,
    companySize: '',
    industry: '',
    benefits: ''
  });

  // Auto-populate company details from user profile
  useEffect(() => {
    if (user?.profile) {
      setFormData(prev => ({
        ...prev,
        company: user.profile.company || '',
        location: user.profile.location || '',
        companySize: user.profile.companySize || '',
        industry: user.profile.industry || ''
      }));
    }
  }, [user]);

  // Fetch job details if in edit mode
  useEffect(() => {
    const fetchJob = async () => {
      if (isEdit) {
        try {
          setIsLoading(true);
          const res = await jobService.getById(id);
          if (res.data && res.data.success) {
            const job = res.data.data;
            setFormData({
              title: job.title || '',
              company: job.company || '',
              location: job.location || '',
              type: job.type || 'Full-time',
              salary: job.salary || '',
              description: job.description || '',
              skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
              experience: job.experience || '',
              isRemote: job.isRemote || false,
              companySize: job.companySize || '',
              industry: job.industry || '',
              benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : ''
            });
          }
        } catch (err) {
          console.error('Error fetching job details:', err);
          toast.error('Failed to load job details');
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchJob();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Job title is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.company.trim()) {
        toast.error('Company name is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.location.trim()) {
        toast.error('Location is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Job description is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.skills.trim()) {
        toast.error('Required skills are needed');
        setIsSubmitting(false);
        return;
      }
      if (!formData.salary.trim()) {
        toast.error('Salary range is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.experience.trim()) {
        toast.error('Experience requirement is required');
        setIsSubmitting(false);
        return;
      }

      // Format skills and benefits as arrays
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit)
      };

      console.log('Submitting job data:', jobData);

      let response;
      if (isEdit) {
        response = await jobService.update(id, jobData);
      } else {
        response = await jobService.create(jobData);
      }

      console.log('API Response:', response);
      console.log('API Response Data:', response.data);

      if (response.data && response.data.success) {
        toast.success(isEdit ? 'Job updated successfully!' : 'Job posted successfully!');
        // Navigate to dashboard instead of home to avoid full refresh
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        const errMsg = response.data?.message || `Failed to ${isEdit ? 'update' : 'post'} job`;
        console.error('Server error response:', errMsg);
        toast.error(errMsg);
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error keys:', Object.keys(error));

      let errorMsg = 'Failed to post job';

      if (error.data?.errors && Array.isArray(error.data.errors)) {
        // Handle validation errors
        errorMsg = error.data.errors[0].msg || error.data.errors[0].message || errorMsg;
      } else if (error.data?.message) {
        errorMsg = error.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error('Final error message:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="post-job-container">
        <Navbar showTabs={false} />
        <div className="post-job-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-container">
      <Navbar showTabs={false} />
      <div className="post-job-card">
        <h2>{isEdit ? 'Edit Job Posting' : 'Post a New Job'}</h2>
        <p className="subtitle">{isEdit ? 'Update your job listing details' : 'Create a compelling job posting to attract top talent'}</p>
        <p className="form-hint">Fields marked with <span className="required">*</span> are required</p>

        <form onSubmit={handleSubmit} className="job-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Job Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Full Stack Developer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name <span className="required">*</span></label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g. Tech Corp India"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Bangalore"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Job Type <span className="required">*</span></label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation Section */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary">Salary Range <span className="required">*</span></label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  placeholder="e.g. ₹15-25 LPA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience Required <span className="required">*</span></label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 3-5 years"
                />
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="description">Job Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Enter detailed job description, responsibilities, and requirements..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Required Skills (comma separated) <span className="required">*</span></label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                placeholder="e.g. React, Node.js, MongoDB"
              />
            </div>
          </div>

          {/* Company Details Section */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companySize">Company Size</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001-5000">1001-5000 employees</option>
                  <option value="5000+">5000+ employees</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Information Technology"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits (comma separated)</label>
              <input
                type="text"
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                placeholder="e.g. Health Insurance, Flexible Hours, WFH Options"
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isRemote"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleChange}
              />
              <label htmlFor="isRemote">This is a remote position</label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
