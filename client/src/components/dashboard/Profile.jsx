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
    newSkill: '',
    projects: [],
    certifications: [],
    linkedin: '',
    github: '',
    portfolio: '',
    resumeURL: '',
    cvURL: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);

  const resetForm = () => {
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
        newSkill: '',
        projects: user.profile?.projects || [],
        certifications: user.profile?.certifications || [],
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        portfolio: user.profile?.portfolio || '',
        resumeURL: user.profile?.resumeURL || '',
        cvURL: user.profile?.cvURL || ''
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resetForm();
  }, [user]);

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => (exp.id === id || exp._id === id) ? { ...exp, [field]: value } : exp)
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
        experience: prev.experience.filter(exp => (exp.id !== id && exp._id !== id))
      }));
    }
  };

  const handleEduChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => (edu.id === id || edu._id === id) ? { ...edu, [field]: value } : edu)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now() + 1, school: '', degree: '', field: '', from: '', to: '' }]
    }));
  };

  const removeEducation = (id) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter(edu => (edu.id !== id && edu._id !== id))
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

  const handleProjectChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id || p._id === id) ? { ...p, [field]: value } : p)
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now(), title: '', description: '', link: '' }]
    }));
  };

  const removeProject = (id) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => (p.id !== id && p._id !== id))
    }));
  };

  const handleCertChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => (c.id === id || c._id === id) ? { ...c, [field]: value } : c)
    }));
  };

  const addCert = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: Date.now(), name: '', issuer: '', date: '' }]
    }));
  };

  const removeCert = (id) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => (c.id !== id && c._id !== id))
    }));
  };

  const handleDownloadFile = (type) => {
    const url = type === 'cv' ? formData.cvURL : formData.resumeURL;
    if (!url) {
      toast.error(`No ${type === 'cv' ? 'CV' : 'Resume'} uploaded yet`);
      return;
    }
    const downloadUrl = `/api/users/${user.id}/download/${type}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${type}_${formData.name || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
      toast.error(`Please upload a PDF or text ${type}`);
      return;
    }

    setIsParsingResume(true);
    const loadingToast = toast.loading(`Reading your ${type} and extracting details...`);

    try {
      const parsed = await uploadResume(file, type);

      const hasData = parsed.name || parsed.phone || parsed.skills?.length > 0 ||
        parsed.experience?.length > 0 || parsed.education?.length > 0 || parsed.projects?.length > 0;

      if (!hasData) {
        toast.update(loadingToast, {
          render: `Could not extract information from ${type}. File uploaded successfully anyway.`,
          type: 'info',
          isLoading: false,
          autoClose: 3000
        });
        return;
      }

      // Merge logic: prefer newly extracted data but keep basics if already filled
      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        phone: parsed.phone || prev.phone,
        headline: parsed.headline || prev.headline,
        summary: parsed.summary || prev.summary,
        skills: parsed.skills?.length ? [...new Set([...prev.skills, ...parsed.skills])] : prev.skills,
        // For lists, we append if small or replace if empty
        experience: parsed.experience?.length ?
          (prev.experience.some(e => e.title) ? [...prev.experience, ...parsed.experience.map(e => ({ ...e, id: Date.now() + Math.random() }))] : parsed.experience.map(e => ({ ...e, id: Date.now() + Math.random() })))
          : prev.experience,
        education: parsed.education?.length ?
          (prev.education.some(e => e.school) ? [...prev.education, ...parsed.education.map(e => ({ ...e, id: Date.now() + Math.random() }))] : parsed.education.map(e => ({ ...e, id: Date.now() + Math.random() })))
          : prev.education,
        projects: parsed.projects?.length ? [...prev.projects, ...parsed.projects.map(p => ({ ...p, id: Date.now() + Math.random() }))] : prev.projects,
        certifications: parsed.certifications?.length ? [...prev.certifications, ...parsed.certifications.map(c => ({ ...c, id: Date.now() + Math.random() }))] : prev.certifications,
        linkedin: parsed.linkedin || prev.linkedin,
        github: parsed.github || prev.github,
        portfolio: parsed.portfolio || prev.portfolio,
        resumeURL: parsed.resumeURL || prev.resumeURL,
        cvURL: parsed.cvURL || prev.cvURL
      }));

      setIsEditing(true);
      toast.update(loadingToast, {
        render: `${type === 'cv' ? 'CV' : 'Resume'} parsed! Review and save your updated profile.`,
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || `Failed to parse ${type}.`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsParsingResume(false);
      e.target.value = '';
    }
  };

  const handleClearProfile = () => {
    if (window.confirm('Are you sure you want to clear ALL your profile information? This will reset all fields, including your Resume and CV links. This action cannot be undone unless you cancel without saving.')) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        location: '',
        headline: '',
        summary: '',
        experience: [{ id: Date.now(), title: '', company: '', from: '', to: '', current: false, description: '' }],
        education: [{ id: Date.now() + 1, school: '', degree: '', field: '', from: '', to: '' }],
        skills: [],
        newSkill: '',
        projects: [],
        certifications: [],
        linkedin: '',
        github: '',
        portfolio: '',
        resumeURL: '',
        cvURL: ''
      });
      setIsEditing(true);
      toast.info('Profile fields cleared. Don\'t forget to Save Changes if you want to persist this.');
    }
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

  const calculateCompletion = () => {
    let score = 0;
    if (formData.name) score += 10;
    if (formData.headline) score += 10;
    if (formData.summary) score += 15;
    if (formData.experience.some(e => e.company)) score += 15;
    if (formData.education.some(e => e.school)) score += 10;
    if (formData.skills.length > 3) score += 10;
    if (formData.projects.length > 0) score += 10;
    if (formData.certifications.length > 0) score += 10;
    if (formData.linkedin || formData.github) score += 10;
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-edit" onClick={handleClearProfile} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Clear All Data</button>
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
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
              <span>AI is analyzing your documents...</span>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p>Upload your <strong>Resume</strong> and <strong>CV</strong> for better extraction and recruiter visibility.</p>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div className="upload-box">
                  <label className="resume-upload-label" style={{ backgroundColor: formData.resumeURL ? 'var(--bg-light)' : 'var(--primary)', color: formData.resumeURL ? 'var(--text-main)' : 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    {formData.resumeURL ? 'Update Resume' : 'Upload Resume'}
                    <input type="file" accept=".pdf,text/plain" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'resume')} />
                  </label>
                  {formData.resumeURL && (
                    <button type="button" className="btn-download-mini" onClick={() => handleDownloadFile('resume')}>
                      Download Resume
                    </button>
                  )}
                </div>

                <div className="upload-box">
                  <label className="resume-upload-label" style={{ backgroundColor: formData.cvURL ? 'var(--bg-light)' : 'var(--primary)', color: formData.cvURL ? 'var(--text-main)' : 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    {formData.cvURL ? 'Update CV' : 'Upload CV'}
                    <input type="file" accept=".pdf,text/plain" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'cv')} />
                  </label>
                  {formData.cvURL && (
                    <button type="button" className="btn-download-mini" onClick={() => handleDownloadFile('cv')}>
                      Download CV
                    </button>
                  )}
                </div>
              </div>
            </div>
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
            <div className="form-grid">
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} disabled={!isEditing} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input type="text" name="github" value={formData.github} onChange={handleChange} disabled={!isEditing} placeholder="https://github.com/username" />
              </div>
              <div className="form-group">
                <label>Portfolio / Website</label>
                <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} disabled={!isEditing} placeholder="https://yourportfolio.com" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>Work Experience</h4>
              {isEditing && <button type="button" className="btn-add" onClick={addExperience}>+ Add Role</button>}
            </div>
            {formData.experience.map((exp) => (
              <div key={exp.id || exp._id} className="experience-item">
                {isEditing && formData.experience.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeExperience(exp.id || exp._id)}>×</button>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input type="text" value={exp.title} onChange={(e) => handleExpChange(exp.id || exp._id, 'title', e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input type="text" value={exp.company} onChange={(e) => handleExpChange(exp.id || exp._id, 'company', e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>From</label>
                    <input type="text" value={exp.from} onChange={(e) => handleExpChange(exp.id || exp._id, 'from', e.target.value)} disabled={!isEditing} placeholder="Month Year" />
                  </div>
                  <div className="form-group">
                    <label>To</label>
                    <input type="text" value={exp.to} onChange={(e) => handleExpChange(exp.id || exp._id, 'to', e.target.value)} disabled={!isEditing || exp.current} placeholder="Present / Month Year" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Role Description</label>
                  <textarea value={exp.description} onChange={(e) => handleExpChange(exp.id || exp._id, 'description', e.target.value)} disabled={!isEditing} rows="3"></textarea>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>Education</h4>
              {isEditing && <button type="button" className="btn-add" onClick={addEducation}>+ Add Education</button>}
            </div>
            {formData.education.map((edu) => (
              <div key={edu.id || edu._id} className="experience-item">
                {isEditing && formData.education.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeEducation(edu.id || edu._id)}>×</button>
                )}
                <div className="form-grid">
                  <div className="form-group"><label>School/University</label><input type="text" value={edu.school} onChange={(e) => handleEduChange(edu.id || edu._id, 'school', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Degree</label><input type="text" value={edu.degree} onChange={(e) => handleEduChange(edu.id || edu._id, 'degree', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Field of Study</label><input type="text" value={edu.field} onChange={(e) => handleEduChange(edu.id || edu._id, 'field', e.target.value)} disabled={!isEditing} placeholder="e.g. Computer Science" /></div>
                  <div className="form-group"><label>From</label><input type="text" value={edu.from} onChange={(e) => handleEduChange(edu.id || edu._id, 'from', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>To</label><input type="text" value={edu.to} onChange={(e) => handleEduChange(edu.id || edu._id, 'to', e.target.value)} disabled={!isEditing} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>Key Projects</h4>
              {isEditing && <button type="button" className="btn-add" onClick={addProject}>+ Add Project</button>}
            </div>
            {formData.projects.map((proj) => (
              <div key={proj.id || proj._id} className="experience-item">
                {isEditing && (
                  <button type="button" className="remove-btn" onClick={() => removeProject(proj.id || proj._id)}>×</button>
                )}
                <div className="form-grid">
                  <div className="form-group"><label>Project Title</label><input type="text" value={proj.title} onChange={(e) => handleProjectChange(proj.id || proj._id, 'title', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Project Link</label><input type="text" value={proj.link} onChange={(e) => handleProjectChange(proj.id || proj._id, 'link', e.target.value)} disabled={!isEditing} placeholder="GitHub / Live Link" /></div>
                </div>
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea value={proj.description} onChange={(e) => handleProjectChange(proj.id || proj._id, 'description', e.target.value)} disabled={!isEditing} rows="2"></textarea>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>Certifications</h4>
              {isEditing && <button type="button" className="btn-add" onClick={addCert}>+ Add Certification</button>}
            </div>
            {formData.certifications.map((cert) => (
              <div key={cert.id || cert._id} className="experience-item">
                {isEditing && (
                  <button type="button" className="remove-btn" onClick={() => removeCert(cert.id || cert._id)}>×</button>
                )}
                <div className="form-grid">
                  <div className="form-group"><label>Certification Name</label><input type="text" value={cert.name} onChange={(e) => handleCertChange(cert.id || cert._id, 'name', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Issuer</label><input type="text" value={cert.issuer} onChange={(e) => handleCertChange(cert.id || cert._id, 'issuer', e.target.value)} disabled={!isEditing} /></div>
                  <div className="form-group"><label>Date Received</label><input type="text" value={cert.date} onChange={(e) => handleCertChange(cert.id || cert._id, 'date', e.target.value)} disabled={!isEditing} /></div>
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
