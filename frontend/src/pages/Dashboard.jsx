import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Briefcase, CreditCard, Clock, Calendar, CheckCircle2, TrendingUp, AlertCircle, Video, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'Recruiter' && user.subscriptionStatus !== 'active') {
      navigate('/subscribe', { state: { message: 'Your subscription has expired. Please renew to continue.' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setFetchError('');
      try {
        if (user.role === 'Candidate') {
          const res = await api.get('/applications/my');
          setApplications(res.data);
        } else if (user.role === 'Recruiter') {
          const res = await api.get('/jobs');
          const myJobs = res.data.filter(j => j.recruiterId?._id === user._id || j.recruiterId === user._id);
          setRecruiterJobs(myJobs);
          const counts = {};
          await Promise.all(myJobs.map(async (job) => {
            try {
              const appRes = await api.get(`/applications/job/${job._id}`);
              counts[job._id] = appRes.data.length;
            } catch { counts[job._id] = 0; }
          }));
          setApplicantCounts(counts);
        } else if (user.role.toLowerCase() === 'admin') {
          const res = await api.get('/applications/admin/disputes');
          setDisputes(res.data);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setFetchError(error.response?.data?.message || error.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    if (user && token) fetchData();
  }, [user, token]);

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--slate-500)' }}>
          Please log in to view your dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Hero Banner */}
      <div className="dash-hero">
        <div className="dash-hero-inner">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div className="animate-fade-in">
              <h1 className="dash-greeting">Welcome back, {user.name}</h1>
              <p className="dash-role">{user.role} — Ready to manage your {user.role === 'Candidate' ? 'applications' : 'postings'}?</p>
            </div>
            <div className="dash-stat animate-slide-up">
              <div className="dash-stat-label">Trust Score</div>
              <div className="dash-stat-value" style={{ color: '#a5b4fc' }}>{user.trustScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="dash-body">
        {loading ? (
          <div className="panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '14rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>

            {/* Candidate Section */}
            {user.role === 'Candidate' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <span className="panel-icon"><Briefcase size={22} /></span>
                    Your Applications
                  </h2>
                  <span className="badge badge-primary">{applications.length} Active</span>
                </div>

                {fetchError ? (
                  <div className="alert-error" style={{ justifyContent: 'flex-start' }}>
                    <AlertCircle size={18} /> {fetchError}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Briefcase size={28} /></div>
                    <h3 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>No Applications Yet</h3>
                    <p style={{ color: 'var(--slate-500)' }}>Browse the job board and apply to premium opportunities!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {applications.map((app) => (
                      <div key={app._id} className="app-card" style={{ border: app.status === 'Hired' ? '2px solid var(--green-600)' : undefined }}>
                        <div>
                          <div className="app-card-title">{app.jobId?.title || 'Unknown Job'}</div>
                          <div className="app-card-meta">
                            <span className={`status-dot status-${app.status?.toLowerCase()}`} />
                            {app.status} · Interview: {app.interviewStatus}
                          </div>
                          {app.status === 'Hired' && (
                            <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-600)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.875rem', fontSize: '0.8rem', fontWeight: 700 }}>
                              <CheckCircle2 size={14} /> Congratulations! You've been Hired!
                            </div>
                          )}
                          {app.interviewStatus === 'Started' && app.meetingLink && (
                            <div style={{ marginTop: '0.75rem' }}>
                              <a 
                                href={app.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-primary" 
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#1a73e8', color: 'white', display: 'inline-flex', gap: '0.5rem' }}
                              >
                                <Video size={14} /> Join Google Meet <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                            ₹{app.paymentId?.amount || 500}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: app.refundStatus === 'Pending' ? 'var(--amber-500)' : 'var(--green-600)' }}>
                            {app.refundStatus}
                          </span>
                          {app.status !== 'Disputed' && app.status !== 'Resolved' && app.status !== 'Hired' && app.refundStatus === 'Pending' && (
                            <button
                              className="btn-outline"
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                              onClick={() => {
                                const reason = prompt("Describe your dispute evidence/reason:");
                                if (reason) {
                                  api.post(`/applications/${app._id}/dispute`, { reason })
                                    .then(() => window.location.reload());
                                }
                              }}
                            >
                              Raise Dispute
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recruiter Section */}
            {user.role === 'Recruiter' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <span className="panel-icon"><Briefcase size={22} /></span>
                    Your Posted Jobs
                  </h2>
                  <Link to="/create-job" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                    Post New Job
                  </Link>
                </div>

                {recruiterJobs.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Briefcase size={28} /></div>
                    <h3 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>No Jobs Posted</h3>
                    <p style={{ color: 'var(--slate-500)' }}>Start hiring top committed talent!</p>
                  </div>
                ) : (
                  <div className="grid-2">
                    {recruiterJobs.map((job) => (
                      <div key={job._id} className="rec-job-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <div className="rec-job-title">{job.title}</div>
                            <div className="rec-job-meta"><Clock size={14} /> {job.location}</div>
                          </div>
                          <span className="badge badge-green">{job.status}</span>
                        </div>
                        <div className="rec-job-footer">
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '2px' }}>Applicants</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>{applicantCounts[job._id] ?? 0}</span>
                          </div>
                          <Link to={`/jobs/${job._id}/applicants`} className="btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
                            View Applicants
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Admin Section */}
            {user.role.toLowerCase() === 'admin' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <span className="panel-icon"><AlertCircle size={22} color="var(--amber-500)" /></span>
                    Dispute Management System
                  </h2>
                  <span className="badge badge-amber">{disputes.length} Active Disputes</span>
                </div>

                {disputes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><CheckCircle2 size={28} color="var(--green-500)" /></div>
                    <h3 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>No Active Disputes</h3>
                    <p style={{ color: 'var(--slate-500)' }}>The hiring ecosystem is stable and peaceful.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {disputes.map((app) => (
                      <div key={app._id} className="app-card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
                        <div>
                          <div className="app-card-title">{app.jobId?.title || 'Unknown Job'}</div>
                          <div className="app-card-meta">
                            Candidate: {app.candidateId?.name} | Score: {app.candidateId?.trustScore}
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-600)', background: 'var(--slate-50)', padding: '0.5rem', borderRadius: '4px' }}>
                            <strong>Evidence:</strong> {app.disputeEvidence}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--green-500)', color: 'var(--green-600)' }}
                            onClick={() => {
                               api.post(`/applications/${app._id}/resolve`, { resolution: 'Refund' })
                               .then(() => window.location.reload());
                            }}
                          >
                            Refund (Punish Recruiter)
                          </button>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--rose-500)' }}
                            onClick={() => {
                               api.post(`/applications/${app._id}/resolve`, { resolution: 'Forfeit' })
                               .then(() => window.location.reload());
                            }}
                          >
                            Forfeit Escrow
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
