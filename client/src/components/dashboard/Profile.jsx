import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, uploadResume } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    newSkill: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.profile?.name || user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        headline: user.profile?.headline || '',
        summary: user.profile?.summary || '',
        experience: user.profile?.experience?.length > 0
          ? user.profile.experience
          : [{ id: Date.now(), title: '', company: '', from: '', to: '', current: false, description: '' }],
        education: user.profile?.education?.length > 0
          ? user.profile.education
          : [{ id: Date.now() + 1, school: '', degree: '', field: '', from: '', to: '' }],
        skills: user.profile?.skills || [],
        newSkill: ''
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const handleEduChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now(), title: '', company: '', from: '', to: '', current: false, description: '' }
      ]
    }));
  };

  const removeExperience = (id) => {
    if (formData.experience.length > 1) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      }));
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, formData.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
      toast.error('Please upload a PDF or text resume');
      return;
    }

    setIsParsingResume(true);
    const loadingToast = toast.loading('Reading your resume and autofilling details...');

    try {
      const parsed = await uploadResume(file);

      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        phone: parsed.phone || prev.phone,
        headline: parsed.headline || prev.headline,
        summary: parsed.summary || prev.summary,
        skills: parsed.skills?.length ? [...new Set([...prev.skills, ...parsed.skills])] : prev.skills,
        experience: parsed.experience?.length ? parsed.experience : prev.experience,
        education: parsed.education?.length ? parsed.education : prev.education,
      }));

      setIsEditing(true);
      toast.update(loadingToast, {
        render: 'Resume parsed! Review and save your updated profile.',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Failed to parse resume',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsParsingResume(false);
      e.target.value = '';
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.name) score += 15;
    if (formData.headline) score += 15;
    if (formData.summary) score += 20;
    if (formData.experience.some(e => e.company)) score += 20;
    if (formData.education.some(e => e.school)) score += 15;
    if (formData.skills.length > 3) score += 15;
    return Math.min(score, 100);
  };

  const completionPercentage = calculateCompletion();

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h2>Profile Settings</h2>
          <p>Optimize your profile to get 3x more recruiter attention</p>
        </div>
        <div className="profile-completion">
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completionPercentage}%` }}></div>
          </div>
          <span>{completionPercentage}% PROFILE STRENGTH</span>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Resume & Career Info</h3>
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="resume-upload-section">
          {isParsingResume ? (
            <div className="parsing-loader">
              <div className="loading-spinner"></div>
              <span>AI is analyzing your resume...</span>
            </div>
          ) : (
            <>
              <p>Want to save time? Upload your resume and we'll autofill your profile.</p>
              <label className="resume-upload-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload Resume (PDF)
                <input type="file" accept=".pdf,text/plain" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </label>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="e.g. San Francisco, CA" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Professional Branding</h4>
            <div className="form-group">
              <label>Headline</label>
              <input type="text" name="headline" value={formData.headline} onChange={handleChange} disabled={!isEditing} placeholder="Short bio summarizing your role" />
            </div>
            <div className="form-group">
              <label>Summary</label>
              <textarea name="summary" value={formData.summary} onChange={handleChange} disabled={!isEditing} rows="5" placeholder="Highlight your key achievements..."></textarea>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>Work Experience</h4>
              {isEditing && <button type="button" className="btn-add" onClick={addExperience}>+ Add Role</button>}
            </div>
            {formData.experience.map((exp) => (
              <div key={exp.id} className="experience-item">
                {isEditing && formData.experience.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeExperience(exp.id)}>×</button>
                )}
                <div className="form-grid">
                  <div className="form-group"><label>Job Title</label><input type="text" value={exp.title} onChange={(e) => handleExpChange(exp.id, 'title', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Company</label><input type="text" value={exp.company} onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>From</label><input type="text" value={exp.from} onChange={(e) => handleExpChange(exp.id, 'from', e.target.value)} disabled={!isEditing} placeholder="Month Year" /></div>
                  <div className="form-group"><label>To</label><input type="text" value={exp.to} onChange={(e) => handleExpChange(exp.id, 'to', e.target.value)} disabled={!isEditing || exp.current} placeholder="Present / Month Year" /></div>
                </div>
                <div className="form-group">
                  <label>Role Description</label>
                  <textarea value={exp.description} onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} disabled={!isEditing} rows="3"></textarea>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <h4>Skills & Expertise</h4>
            <div className="form-group">
              <div className="skills-input-container">
                <input type="text" value={formData.newSkill} onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))} disabled={!isEditing} placeholder="e.g. Kubernetes" onKeyDown={(e) => e.key === 'Enter' && addSkill(e)} />
                <button type="button" className="btn-add-skill" onClick={addSkill} disabled={!isEditing}>Add</button>
              </div>
              <div className="skills-tags">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    {isEditing && <button type="button" className="remove-skill" onClick={() => removeSkill(skill)}>×</button>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
