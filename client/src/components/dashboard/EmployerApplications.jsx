import React, { useEffect, useState, useRef } from 'react';
import { applications as applicationService } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './EmployerApplications.css';

const EmployerApplications = () => {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState('');
  const [apps, setApps] = useState([]);

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, rounds, chat

  // Action State
  const [newMessage, setNewMessage] = useState('');
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('');

  const chatEndRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await applicationService.getEmployerApplications();
      setApps(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load applications');
      toast.error(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedApp?.messages, activeTab]);

  const updateStatus = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      toast.success('Status updated');
      setApps(prev => prev.map(a => (a._id === appId ? { ...a, status } : a)));
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedApp) return;

    try {
      const res = await applicationService.addMessage(selectedApp._id, newMessage);
      const updatedMessages = res.data?.data || [];

      // Update local state
      const updatedApp = { ...selectedApp, messages: updatedMessages };
      setSelectedApp(updatedApp);
      setApps(prev => prev.map(a => (a._id === selectedApp._id ? updatedApp : a)));
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    if (!newRoundName.trim() || !selectedApp) return;

    try {
      const res = await applicationService.addRound(selectedApp._id, {
        name: newRoundName,
        scheduledDate: newRoundDate || null
      });

      const updatedRounds = res.data?.data || [];
      const updatedApp = { ...selectedApp, rounds: updatedRounds };
      setSelectedApp(updatedApp);
      setApps(prev => prev.map(a => (a._id === selectedApp._id ? updatedApp : a)));

      setNewRoundName('');
      setNewRoundDate('');
      toast.success('Round added successfully');
    } catch (err) {
      toast.error('Failed to add round');
    }
  };

  const updateRoundStatus = async (roundId, status) => {
    try {
      const res = await applicationService.updateRound(selectedApp._id, roundId, { status });
      const updatedRounds = res.data?.data || [];
      const updatedApp = { ...selectedApp, rounds: updatedRounds };
      setSelectedApp(updatedApp);
      setApps(prev => prev.map(a => (a._id === selectedApp._id ? updatedApp : a)));
      toast.success(`Round marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update round');
    }
  };

  if (isLoading) {
    return (
      <div className="content-card">
        <div className="card-content"><div className="empty-state"><p>Loading applications...</p></div></div>
      </div>
    );
  }

  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Job Applications</h3>
          <button className="btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="card-content">
          {apps.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No active applications</p>
              <p className="empty-state-subtext">Applications from candidates will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {apps.map(a => (
                <div key={a._id} className="app-list-item" style={{
                  padding: '1.5rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'var(--primary-gradient)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {a.applicant?.profile?.name?.charAt(0) || a.applicant?.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{a.job?.title || 'Unknown Job'}</div>
                      <div style={{ color: '#94a3b8' }}>
                        {a.applicant?.profile?.name || 'Candidate'} • {a.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={() => setSelectedApp(a)}>Manage Application</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <div className="process-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null); }}>
          <div className="process-modal">
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedApp.applicant?.profile?.name || selectedApp.applicant?.email}</h2>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Applying for: {selectedApp.job?.title}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-sidebar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab('details')}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', textAlign: 'left',
                      background: activeTab === 'details' ? 'var(--primary-color)' : 'transparent',
                      color: activeTab === 'details' ? 'white' : '#cbd5e1',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    Candidate Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('rounds')}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', textAlign: 'left',
                      background: activeTab === 'rounds' ? 'var(--primary-color)' : 'transparent',
                      color: activeTab === 'rounds' ? 'white' : '#cbd5e1',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    Interview Rounds
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', textAlign: 'left',
                      background: activeTab === 'chat' ? 'var(--primary-color)' : 'transparent',
                      color: activeTab === 'chat' ? 'white' : '#cbd5e1',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    Messages
                  </button>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <label className="info-label">Application Status</label>
                  <select
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px', marginTop: '0.5rem' }}
                    value={selectedApp.status}
                    onChange={(e) => updateStatus(selectedApp._id, e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Invited">Invited</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer Received">Offer Received</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>

              <div className="modal-main">
                {activeTab === 'details' && (
                  <div className="fade-in">
                    <div className="info-group">
                      <div className="info-label">Contact Information</div>
                      <div className="info-value">{selectedApp.applicant?.email}</div>
                      <div className="info-value">{selectedApp.applicant?.profile?.phone || 'No phone provided'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Headline</div>
                      <div className="info-value">{selectedApp.applicant?.profile?.headline || '—'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Cover Letter</div>
                      <div className="info-value" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {selectedApp.coverLetter || 'No cover letter submitted.'}
                      </div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Skills</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {selectedApp.applicant?.profile?.skills?.map((s, i) => (
                          <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.85rem' }}>{s}</span>
                        )) || <span className="info-value">No skills listed</span>}
                      </div>
                    </div>

                    {/* View Full Profile could link to a profile page if we had one */}
                  </div>
                )}

                {activeTab === 'rounds' && (
                  <div className="fade-in">
                    <h3 className="section-title">Interview Process</h3>

                    {!selectedApp.rounds || selectedApp.rounds.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No interview rounds scheduled yet.
                      </div>
                    ) : (
                      <div>
                        {selectedApp.rounds.map((round) => (
                          <div key={round._id} className="round-card">
                            <div className="round-header">
                              <span style={{ fontWeight: 600 }}>{round.name}</span>
                              <span className={`round-status status-${(round.status || 'pending').toLowerCase()}`}>{round.status || 'Pending'}</span>
                            </div>
                            {round.scheduledDate && (
                              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                Scheduled: {new Date(round.scheduledDate).toLocaleString()}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button onClick={() => updateRoundStatus(round._id, 'Passed')} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pass</button>
                              <button onClick={() => updateRoundStatus(round._id, 'Failed')} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Fail</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddRound} className="add-round-form">
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Schedule New Round</h4>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <input
                          type="text"
                          placeholder="Round Name (e.g. Technical Interview)"
                          value={newRoundName}
                          onChange={(e) => setNewRoundName(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
                          required
                        />
                        <input
                          type="datetime-local"
                          value={newRoundDate}
                          onChange={(e) => setNewRoundDate(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Round</button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="chat-container" style={{ flex: 1, height: '100%' }}>
                      <div className="chat-messages">
                        {!selectedApp.messages || selectedApp.messages.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Start a conversation with the candidate.</div>
                        ) : (
                          selectedApp.messages.map((msg, i) => {
                            const isMe = msg.sender?._id === user._id || msg.sender === user._id; // Check both populated and unpopulated
                            return (
                              <div key={i} className={`message ${isMe ? 'sent' : 'received'}`}>
                                <div>{msg.content}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendMessage} className="chat-input">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" disabled={!newMessage.trim()}>Send</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerApplications;

