import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applications as applicationService, messages as messageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import '../components/dashboard/Applications.css'; // Reuse styles

const ApplicationMessages = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    console.log('ApplicationMessages loaded. Params ID:', applicationId);
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [applicationId]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchData = async () => {
        console.group('ApplicationMessages Fetch Debug');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Application ID from URL:', applicationId);

        try {
            setIsLoading(true);
            // Fetch messages
            console.log('Fetching messages...');
            const msgRes = await messageService.getApplicationMessages(applicationId);
            console.log('Messages fetched:', msgRes.data?.data?.length || 0);
            setMessages(msgRes.data?.data || []);

            // Try to fetch specific application first (more robust)
            let app;
            console.log('Fetching application details...');
            try {
                const appByIdRes = await applicationService.getById(applicationId);
                app = appByIdRes.data?.data;
                console.log('SUCCESS: Fetched application by ID:', app);
            } catch (fetchErr) {
                console.warn('Direct fetch failed, falling back to list:', fetchErr);
                // Fallback to list
                const appRes = await applicationService.getMyApplications();
                console.log('All applications fetched:', appRes.data?.data?.length);
                app = appRes.data?.data?.find(a => a._id === applicationId);
                console.log('Found in list:', !!app);
            }

            console.log('Final application object:', app);
            setApplication(app);

        } catch (err) {
            console.error('CRITICAL ERROR in fetchData:', err);
            toast.error('Failed to load chat');
        } finally {
            setIsLoading(false);
            console.groupEnd();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await applicationService.addMessage(applicationId, newMessage);
            setMessages(res.data?.data || []);
            setNewMessage('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to send message');
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading chat...</div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="dashboard-page">
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
                    Application not found. <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-content" style={{ paddingTop: '2rem' }}>
                <div className="dashboard-wrapper">
                    <div className="content-card" style={{ maxWidth: '800px', margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="card-title">Message {application.job?.company || 'Company'}</h3>
                                <p style={{ color: '#94a3b8', margin: 0 }}>{application.job?.title || 'Job'}</p>
                            </div>
                            <button className="btn-secondary" onClick={() => navigate('/')}>Back</button>
                        </div>

                        <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                            <div className="chat-container">
                                <div className="chat-messages">
                                    {messages.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>Start a conversation with the employer.</div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationMessages;
