import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Users, FileText, CheckCircle, XCircle, Clock, ArrowLeft, Shield, Video, Award, ExternalLink } from 'lucide-react';

const Applicants = () => {
  const { id: jobId } = useParams();
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Recruiter' || user?.role === 'Admin') fetchApplications();
  }, [user, jobId]);

  const handleStatus = async (appId, newStatus) => {
    await api.put(`/applications/${appId}/status`, { status: newStatus });
    fetchApplications();
  };

  const handleStart = async (appId) => {
    await api.put(`/applications/${appId}/interview-start`);
    fetchApplications();
  };

  const handleEnd = async (appId, endStatus) => {
    await api.put(`/applications/${appId}/interview-end`, { status: endStatus });
    fetchApplications();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 5rem)' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="applicants-page">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="applicants-header">
        <div>
          <h1 className="applicants-title">
            <Users size={30} color="var(--primary-600)" /> Applicant Tracking
          </h1>
          <p style={{ color: 'var(--slate-500)', marginTop: '0.375rem' }}>Manage escrowed applications</p>
        </div>
        <div className="stats-pill">
          <div className="stats-pill-item">
            <span className="stats-pill-label">Total Applicants</span>
            <span className="stats-pill-value" style={{ color: 'var(--slate-800)' }}>{applications.length}</span>
          </div>
          <div className="stats-pill-divider" />
          <div className="stats-pill-item">
            <span className="stats-pill-label">Locked Escrow</span>
            <span className="stats-pill-value" style={{ color: 'var(--green-600)' }}>₹{applications.length * 500}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {applications.length === 0 ? (
          <div className="applicant-card">
            <div className="applicant-card-inner" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
              <div className="empty-icon"><Users size={28} /></div>
              <h3 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.375rem' }}>No Applications Yet</h3>
              <p style={{ color: 'var(--slate-500)', textAlign: 'center', maxWidth: '28rem' }}>
                Once candidates apply with locked escrow, their profiles will appear here.
              </p>
            </div>
          </div>
        ) : (
          applications.map(app => (
            <div key={app._id} className="applicant-card animate-slide-up">
              <div className="applicant-card-inner">
                {/* Candidate Info */}
                <div className="applicant-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="applicant-avatar">
                      {app.candidateId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="applicant-name">{app.candidateId?.name}</div>
                      <div className="applicant-meta">
                        <Clock size={14} color="var(--slate-400)" />
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                        <span className="escrow-badge">
                          <Shield size={12} /> ₹500 Locked
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="trust-score-box">
                      <div className="trust-score-icon"><Award size={16} /></div>
                      <div>
                        <div className="trust-score-label">Trust Score</div>
                        <div className="trust-score-val">{app.candidateId?.trustScore} pts</div>
                      </div>
                    </div>
                    {app.candidateId?.resumeUrl && (
                      <a href={`http://localhost:5000${app.candidateId.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="resume-link">
                        <FileText size={15} /> Download Resume
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="actions-panel">
                  <div>
                    <div className="stage-label">Application Stage</div>
                    <div className="stage-value">
                      <span className={`live-dot ${app.status === 'Applied' ? 'amber' : 'green'}`} />
                      {app.status}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Applied Stage */}
                  {app.status === 'Applied' && (
                    <div className="btn-row">
                      <button onClick={() => handleStatus(app._id, 'Rejected')} className="btn-danger">
                        <XCircle size={15} /> Reject & Refund
                      </button>
                      <button onClick={() => handleStatus(app._id, 'Shortlisted')} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}>
                        <CheckCircle size={15} /> Shortlist
                      </button>
                    </div>
                  )}

                  {/* Shortlisted / Pending Interview */}
                  {app.status === 'Shortlisted' && app.interviewStatus === 'Pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <span className="interview-badge">
                        <Shield size={15} /> Shortlisted for Interview
                      </span>
                      <button onClick={() => handleStart(app._id)} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}>
                        <Video size={15} /> Start Interview
                      </button>
                    </div>
                  )}

                  {/* Interview In Progress */}
                  {app.status === 'Shortlisted' && app.interviewStatus === 'Started' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <span className="interview-badge animate-pulse">
                        <Video size={15} /> Interview In Progress
                      </span>
                      {app.meetingLink && (
                        <a 
                          href={app.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-primary" 
                          style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', background: '#1a73e8', color: 'white', width: '100%', justifyContent: 'center' }}
                        >
                          <Video size={15} /> Join Google Meet <ExternalLink size={14} />
                        </a>
                      )}
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', maxWidth: '16rem', textAlign: 'right' }}>
                        Resolution permanently impacts Candidate TrustScore.
                      </p>
                      <div className="btn-row">
                        <button onClick={() => handleEnd(app._id, 'No-Show')} className="btn-danger">
                          <XCircle size={15} /> No-Show
                        </button>
                        <button onClick={() => handleEnd(app._id, 'Completed')} className="btn-success">
                          <CheckCircle size={15} /> Completed
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Final / Interview done */}
                  {app.status === 'Shortlisted' && (app.interviewStatus === 'Completed' || app.interviewStatus === 'No-Show') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      {app.interviewStatus === 'Completed' ? (
                        <div style={{ width: '100%' }}>
                          <div className="result-box success" style={{ marginBottom: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Interview Finished</span>
                            <span className="result-tag success">Refunded</span>
                          </div>
                          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                            <button onClick={() => handleStatus(app._id, 'Rejected')} className="btn-outline" style={{ fontSize: '0.875rem' }}>
                              Reject Candidate
                            </button>
                            <button onClick={() => handleStatus(app._id, 'Hired')} className="btn-success" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}>
                              <Award size={15} /> Hire Candidate (+10 Trust)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="result-box fail">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle size={18} /> Escrow Default</span>
                          <span className="result-tag fail">Forfeited</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejected */}
                  {app.status === 'Rejected' && (
                    <div style={{ background: 'var(--slate-100)', borderRadius: 'var(--radius-xl)', padding: '0.75rem 1.25rem', color: 'var(--slate-500)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center', border: '1px solid var(--slate-200)', marginTop: '0.5rem' }}>
                      Candidate Rejected
                    </div>
                  )}

                  {/* Hired */}
                  {app.status === 'Hired' && (
                    <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-xl)', padding: '0.875rem 1.25rem', color: 'var(--green-700)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', border: '1px solid var(--green-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <Award size={18} /> Candidate Hired!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Applicants;
