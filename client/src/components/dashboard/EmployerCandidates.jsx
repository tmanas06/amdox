import React, { useEffect, useState } from 'react';
import { user as userService, applications as applicationService, jobs as jobService } from '../../services/api';
import { toast } from 'react-toastify';

const EmployerCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [jobs, setJobs] = useState([]);

    // State for invite modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchCandidates();
        fetchJobs();
    }, []);

    const fetchCandidates = async () => {
        try {
            setIsLoading(true);
            setError('');
            const res = await userService.getJobSeekers();
            setCandidates(res.data?.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load candidates');
            toast.error(err.message || 'Failed to load candidates');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await jobService.getEmployerJobs();
            // Filter for active jobs only? Maybe allow all.
            setJobs(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load jobs for invite', err);
        }
    };

    const handleInviteClick = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleInviteSubmit = async (jobId) => {
        if (!jobId) return;

        try {
            setIsInviting(true);
            await applicationService.invite({
                applicantId: selectedCandidate._id,
                jobId: jobId
            });
            toast.success(`Invited ${selectedCandidate.profile?.name || selectedCandidate.email} to apply!`);
            setIsModalOpen(false);
            setSelectedCandidate(null);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to send invitation');
        } finally {
            setIsInviting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="content-card">
                <div className="card-header">
                    <h3 className="card-title">Candidates</h3>
                </div>
                <div className="card-content">
                    <div className="empty-state"><p>Loading candidates...</p></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-card">
                <div className="card-header">
                    <h3 className="card-title">Candidates</h3>
                    <button className="btn-secondary" onClick={fetchCandidates}>Retry</button>
                </div>
                <div className="card-content">
                    <div className="empty-state"><p>Error: {error}</p></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-card">
                <div className="card-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h3 className="card-title">Browse Candidates</h3>
                        <p className="card-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Find and invite talented professionals to your open roles
                        </p>
                    </div>
                    <button className="btn-secondary" onClick={fetchCandidates}>Refresh</button>
                </div>
                <div className="card-content">
                    {candidates.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-state-text">No job seekers found</p>
                            <p className="empty-state-subtext">Check back later for new candidates</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {candidates.map(candidate => (
                                <div key={candidate._id} style={{
                                    padding: '1.5rem',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {candidate.profile?.name ? candidate.profile.name.charAt(0).toUpperCase() : candidate.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                                {candidate.profile?.name || 'Unnamed Candidate'}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                {candidate.profile?.headline || candidate.email}
                                            </div>
                                            {candidate.profile?.skills && candidate.profile.skills.length > 0 && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                                    {candidate.profile.skills.slice(0, 5).map((skill, idx) => (
                                                        <span key={idx} style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.2rem 0.6rem',
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            color: 'var(--primary-color)',
                                                            borderRadius: '100px',
                                                            border: '1px solid rgba(99, 102, 241, 0.2)'
                                                        }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {candidate.profile.skills.length > 5 && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                                            +{candidate.profile.skills.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="btn-primary"
                                        onClick={() => handleInviteClick(candidate)}
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                    >
                                        Invite to Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
                            Invite {selectedCandidate?.profile?.name || 'Candidate'}
                        </h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                            Select a job position to invite this candidate to apply for. They will receive a notification and can accept the invitation instantly.
                        </p>

                        {jobs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem' }}>
                                {jobs.map(job => (
                                    <button
                                        key={job._id}
                                        onClick={() => handleInviteSubmit(job._id)}
                                        disabled={isInviting}
                                        style={{
                                            textAlign: 'left',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    >
                                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                            {job.location} • {job.type}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '2rem', color: '#f87171' }}>
                                You don't have any active job postings. Post a job first to invite candidates.
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => { setIsModalOpen(false); setSelectedCandidate(null); }}
                                disabled={isInviting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployerCandidates;
