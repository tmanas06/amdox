import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = ({ tabs = [], activeTab, onTabChange, showTabs = true }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isJobSeeker = user?.role === 'job_seeker';
    const isEmployer = user?.role === 'employer';

    return (
        <nav className="dashboard-nav">
            <div className="nav-container">
                <div className="nav-brand" onClick={() => navigate('/')}>
                    <div className="nav-logo">
                        <img src="/logo/logo.png" alt="Amdox Jobs" className="nav-logo-img" />
                    </div>
                    <div className="nav-brand-text">
                        <h1 className="nav-title">Amdox Jobs</h1>
                        <span className="nav-subtitle">Tech Hiring Platform</span>
                    </div>
                </div>

                {showTabs && tabs.length > 0 && (
                    <div className="nav-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                            >
                                <span className="nav-tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="nav-user">
                    {user ? (
                        <>
                            <div className="nav-user-info">
                                {user?.profile?.photoURL && (
                                    <img
                                        src={user.profile.photoURL}
                                        alt={user.profile.name || user.email}
                                        className="nav-user-avatar"
                                    />
                                )}
                                <div className="nav-user-details">
                                    <span className="nav-user-name">{user?.profile?.name || user?.email}</span>
                                    <span className="nav-user-role">
                                        {isJobSeeker ? 'Job Seeker' : isEmployer ? 'Employer' : 'User'}
                                    </span>
                                </div>
                            </div>
                            <div className="nav-actions">
                                <ThemeToggle />
                                <button onClick={logout} className="nav-logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="nav-actions">
                            <ThemeToggle />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
