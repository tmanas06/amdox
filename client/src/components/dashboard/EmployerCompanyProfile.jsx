import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { user as userService } from '../../services/api';
import { toast } from 'react-toastify';
import './EmployerCompanyProfile.css';

const EmployerCompanyProfile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);

    const [formData, setFormData] = useState({
        name: '', // This might be the user's name, but for company profile we want company name. 
        // Wait, the User model has profile.company. 
        // Let's use profile.company as Company Name.
        company: '',
        bio: '',
        location: '',
        website: '',
        industry: '',
        companySize: '',
        photoURL: ''
    });

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                name: user.profile.name || '',
                company: user.profile.company || '',
                bio: user.profile.bio || '',
                location: user.profile.location || '',
                website: user.profile.website || '',
                industry: user.profile.industry || '',
                companySize: user.profile.companySize || '',
                photoURL: user.profile.photoURL || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Use existing uploadProfilePicture endpoint (it's a placeholder in backend but we can try)
        // Actually the userController says "Profile picture upload endpoint not fully implemented yet"
        // So maybe we skip actual implementation for now or implement a mock upload or use a data URL for now.
        // Let's use a Data URL for immediate feedback if backend doesn't support it yet.

        // In a real app we would upload to S3/Cloudinary.
        // Here we can try to use the api.user.uploadProfilePicture if it was working.
        // Since backend returns 200 but just a message, we can't really save it there unless we modify backend to store it (e.g. static file or base64 in DB).
        // Let's implemented a Base64 reader for now to simulate "upload" and save it to the profile.photoURL string in DB.
        // MongoDB limits apply (16MB), so small images only.

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setFormData(prev => ({ ...prev, photoURL: base64String }));

            // Auto save logo
            try {
                await userService.updateProfile(user._id, { ...formData, photoURL: base64String });
                updateUser({ ...user, profile: { ...user.profile, photoURL: base64String } });
                toast.success('Logo updated');
            } catch (err) {
                console.error(err);
                toast.error('Failed to update logo');
            }
        };
        if (file.size > 500000) { // 500KB limit for base64
            toast.error('Image too large (max 500KB for this demo)');
            return;
        }
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await userService.updateProfile(user._id, formData);
            if (res.data.success) {
                updateUser(res.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEnrich = async () => {
        setIsEnriching(true);
        try {
            const res = await userService.enrichCompany();
            if (res.data.success && res.data.data) {
                const enriched = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    company: enriched.company || prev.company,
                    industry: enriched.industry || prev.industry,
                    companySize: enriched.companySize || prev.companySize,
                    bio: enriched.bio || prev.bio,
                    location: enriched.location || prev.location,
                    website: enriched.website || prev.website,
                    photoURL: enriched.photoURL || prev.photoURL
                }));
                toast.success('Company info enriched ✨');
                if (!isEditing) setIsEditing(true); // Switch to edit mode to see results
            } else if (res.data.message) {
                toast.info(res.data.message);
            }
        } catch (err) {
            console.error('Enrichment failed:', err);
            toast.error('Failed to fetch company info');
        } finally {
            setIsEnriching(false);
        }
    };

    if (isEditing) {
        return (
            <div className="company-profile-container fade-in">
                <div className="card-header">
                    <h3 className="card-title">Edit Company Profile</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>

                <div className="section-card">
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    className="form-input"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="form-group">
                                <label>Industry</label>
                                <select name="industry" className="form-select" value={formData.industry} onChange={handleChange}>
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Company Size</label>
                                <select name="companySize" className="form-select" value={formData.companySize} onChange={handleChange}>
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                name="website"
                                className="form-input"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>About Company</label>
                            <textarea
                                name="bio"
                                className="form-textarea"
                                rows="5"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Describe your company culture, mission, and what you do..."
                            />
                        </div>

                        <div className="action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="company-profile-container fade-in">
            {/* Header Card */}
            <div className="company-header-card">
                <div className="company-header-content">
                    <div className="company-logo-upload">
                        {formData.photoURL ? (
                            <img src={formData.photoURL} alt="Company Logo" className="company-logo-img" />
                        ) : (
                            <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>🏢</div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            title="Upload Logo"
                        />
                    </div>

                    <div className="company-info-display" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2>{formData.company || 'Company Name'}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{formData.industry || 'Industry not set'}</p>
                            </div>
                            <div className="action-buttons-group" style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={handleEnrich}
                                    disabled={isEnriching}
                                    title="Auto-fill company info using AI based on your email domain"
                                >
                                    {isEnriching ? '✨ Thinking...' : '✨ Auto-fill with AI'}
                                </button>
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </div>
                        </div>

                        <div className="company-meta-row">
                            <div className="meta-item">
                                <span>📍</span> {formData.location || 'Location not set'}
                            </div>
                            <div className="meta-item">
                                <span>👥</span> {formData.companySize || 'Size not set'}
                            </div>
                            {formData.website && (
                                <div className="meta-item">
                                    <span>🔗</span> <a href={formData.website} target="_blank" rel="noopener noreferrer" className="website-link">{formData.website}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="company-details-grid">
                <div className="section-card">
                    <h3 className="section-title">About Us</h3>
                    <div style={{ lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {formData.bio || 'No company description added yet. Click "Edit Profile" to tell candidates about your company.'}
                    </div>
                </div>

                <div className="section-card">
                    <h3 className="section-title">Contact Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Email</label>
                            <div style={{ color: 'var(--text-primary)' }}>{user?.email}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Recruiter Name</label>
                            <div style={{ color: 'var(--text-primary)' }}>{formData.name || 'Not set'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerCompanyProfile;
