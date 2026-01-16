import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    headline: user?.profile?.headline || '',
    summary: user?.profile?.summary || '',
    experience: user?.profile?.experience || [
      { id: 1, title: '', company: '', from: '', to: '', current: false, description: '' }
    ],
    education: user?.profile?.education || [
      { id: 1, school: '', degree: '', field: '', from: '', to: '' }
    ],
    skills: user?.profile?.skills || [],
    newSkill: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle experience changes
  const handleExpChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };
  
  // Handle education changes
  const handleEduChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };
  
  // Add new experience
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now(), title: '', company: '', from: '', to: '', current: false, description: '' }
      ]
    }));
  };
  
  // Remove experience
  const removeExperience = (id) => {
    if (formData.experience.length > 1) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      }));
    }
  };
  
  // Add skill
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
  
  // Remove skill
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, this would make an API call to update the profile
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completedFields = 0;
    const totalFields = 7; // Adjust based on actual required fields
    
    if (formData.name) completedFields++;
    if (formData.email) completedFields++;
    if (formData.headline) completedFields++;
    if (formData.summary) completedFields++;
    if (formData.experience[0]?.company) completedFields++;
    if (formData.education[0]?.school) completedFields++;
    if (formData.skills.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };
  
  const completionPercentage = calculateCompletion();
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your personal information and preferences</p>
        </div>
        <div className="profile-completion">
          <div className="completion-bar">
            <div 
              className="completion-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span>{completionPercentage}% Complete</span>
        </div>
      </div>
      
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button 
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data here if needed
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h4>Professional Summary</h4>
            <div className="form-group">
              <label>Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            
            <div className="form-group">
              <label>Summary</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                placeholder="Tell us about yourself and your professional experience..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h4>Work Experience</h4>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={addExperience}
                >
                  + Add Experience
                </button>
              )}
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={exp.id} className="experience-item">
                {isEditing && formData.experience.length > 1 && (
                  <button 
                    type="button"
                    className="remove-btn"
                    onClick={() => removeExperience(exp.id)}
                  >
                    ×
                  </button>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleExpChange(exp.id, 'title', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>From</label>
                    <input
                      type="month"
                      value={exp.from}
                      onChange={(e) => handleExpChange(exp.id, 'from', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>To</label>
                    <input
                      type="month"
                      value={exp.current ? '' : exp.to}
                      onChange={(e) => handleExpChange(exp.id, 'to', e.target.value)}
                      disabled={!isEditing || exp.current}
                      required={!exp.current}
                    />
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onChange={(e) => handleExpChange(exp.id, 'current', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor={`current-${exp.id}`}>I currently work here</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)}
                    disabled={!isEditing}
                    rows="3"
                    placeholder="Describe your role and responsibilities..."
                  ></textarea>
                </div>
                
                {index < formData.experience.length - 1 && <hr />}
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <h4>Education</h4>
            
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="education-item">
                <div className="form-grid">
                  <div className="form-group">
                    <label>School/University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Bachelor's in Computer Science"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEduChange(edu.id, 'field', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Year of Graduation</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={edu.to}
                      onChange={(e) => handleEduChange(edu.id, 'to', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {index < formData.education.length - 1 && <hr />}
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <h4>Skills</h4>
            
            <div className="form-group">
              <label>Add Skills</label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={formData.newSkill}
                  onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                />
                <button 
                  type="button" 
                  className="btn-add-skill"
                  onClick={addSkill}
                  disabled={!isEditing}
                >
                  Add
                </button>
              </div>
              
              <div className="skills-tags">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    {isEditing && (
                      <button 
                        type="button" 
                        className="remove-skill"
                        onClick={() => removeSkill(skill)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
