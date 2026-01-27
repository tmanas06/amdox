import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messages as messageService } from '../services/api';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = ({ tabs = [], activeTab, onTabChange, showTabs = true }) => {
    const { user, logout } = useAuth();
    // const navigate = useNavigate();
    // const [unreadCount, setUnreadCount] = useState(0); // unreadCount unused since icon removed

    const isJobSeeker = user?.role === 'job_seeker';
    const isEmployer = user?.role === 'employer';

    /*
    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user) return;

            try {
                // const res = await messageService.getUnreadCount();
                // setUnreadCount(res.data?.count || 0);
            } catch (err) {
                console.error('Failed to fetch unread count:', err);
            }
        };

        fetchUnreadCount();

        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [user]);
    */

    // Message count effect removed as feature is hidden in navbar

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
                                {/* Message Notification Icon */}
                                {/* Message icon removed as requested */}

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
