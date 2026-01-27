import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword, verifyOTP, resetPassword } from '../services/authService';
import Navbar from '../components/Navbar';
import './LoginPage.css'; // Reusing some base styles

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        if (!email) return toast.error('Please enter your email');

        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyOTP(email, otp);
            toast.success('OTP verified');
            setStep(3);
        } catch (err) {
            toast.error(err.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success('Password reset successful. Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="amdox-page">
            <Navbar showTabs={false} />

            <div className="amdox-container">
                <div className="auth-section-dark" style={{ width: '100%', maxWidth: '450px', margin: '40px auto' }}>
                    <div className="auth-card-dark">
                        <h3 className="auth-title-dark">
                            {step === 1 && 'Forgot Password'}
                            {step === 2 && 'Verify OTP'}
                            {step === 3 && 'Reset Password'}
                        </h3>
                        <p className="auth-subtitle-dark">
                            {step === 1 && 'Enter your email to receive a 6-digit OTP'}
                            {step === 2 && `Enter the 6-digit code sent to ${email}`}
                            {step === 3 && 'Choose a strong new password'}
                        </p>

                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="email-form-dark">
                                <div className="form-group-dark">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@gmail.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="submit-btn-dark">
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                                <Link to="/login" className="cancel-btn-dark" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                                    Back to Login
                                </Link>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="email-form-dark">
                                <div className="form-group-dark">
                                    <label htmlFor="otp">6-Digit OTP</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        required
                                        disabled={loading}
                                        style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px' }}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="submit-btn-dark">
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <div className="otp-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="resend-btn-dark"
                                        disabled={loading}
                                        style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #4F46E5', color: '#4F46E5', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Resend OTP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="cancel-btn-dark"
                                        disabled={loading}
                                        style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #4B5563', color: '#9CA3AF', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="email-form-dark">
                                <div className="form-group-dark">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group-dark">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="submit-btn-dark">
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
