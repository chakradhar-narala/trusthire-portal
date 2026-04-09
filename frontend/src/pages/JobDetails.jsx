import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, MapPin, Building2, Tag, ChevronLeft, CheckCircle2, ShieldCheck, Loader2, AlertCircle, FileText } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState('');

  const fetchJobDetails = () => {
    setLoading(true);
    api.get(`/jobs/${id}`)
      .then(r => {
        setJob(r.data);
        if (user && user.role === 'Candidate') {
          api.get('/applications/my')
          .then(appRes => {
            const applied = appRes.data.some(app => app.jobId?._id === r.data._id || app.jobId === r.data._id);
            setHasApplied(applied);
          }).catch(console.error);
        }
      })
      .catch(() => setError('Job not found or has been closed.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setError(''); setProcessing(true);
    try {
      const res = await api.post('/payments/create-order', { jobId: job._id });
      
      if (res.data.checkoutUrl === 'stripe_bypass_success') {
        // Stripe disabled / bypass mode — go straight to ProcessApplication
        navigate(`/apply/${job._id}?session_id=stripe_bypass_success&payment_id=${res.data.paymentId}`);
      } else if (res.data.checkoutUrl) {
        // Real Stripe — redirect to Stripe hosted page
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }


    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize application escrow.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: 'calc(100vh - 5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>Job Unavailable</h2>
          <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/jobs" className="btn-outline">Back to Jobs</Link>
            <button onClick={fetchJobDetails} className="btn-primary">Retry Fetch</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 5rem)', background: 'var(--slate-50)', paddingBottom: '5rem' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #0f172a, #1e1b4b)', padding: '3rem 0 8rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(99,102,241,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <Link to="/jobs" className="back-link" style={{ color: 'rgba(165,180,252,0.9)', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ChevronLeft size={16} /> Back to listings
          </Link>
          <div className="animate-fade-in">
            <span className="badge badge-green" style={{ marginBottom: '1rem', fontSize: '0.7rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
              <CheckCircle2 size={11} /> Active
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{job.title}</h1>
            <div style={{ display: 'flex', gap: '1.25rem', color: 'rgba(165,180,252,0.9)', fontSize: '0.95rem', fontWeight: 500, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 size={16} /> {job.recruiterId?.name || 'Company Name'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={16} /> {job.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginTop: '-5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }} className="job-detail-grid">
          {/* Description */}
          <div className="glass-card animate-slide-up" style={{ background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--indigo-600)" /> Job Description
            </h3>
            <p style={{ color: 'var(--slate-600)', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{job.description}</p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: '2rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={18} color="var(--indigo-600)" /> Required Skills
            </h3>
            <div className="skills-list">
              {job.skills.map((sk, i) => (
                <span key={i} className="badge badge-slate">{sk}</span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="glass-card animate-slide-up" style={{ border: '2px solid var(--indigo-100)', animationDelay: '100ms', background: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '3rem', height: '3rem', background: 'var(--indigo-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', color: 'var(--indigo-600)' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--slate-900)' }}>Escrow Required</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.375rem', lineHeight: 1.5 }}>Refunded if rejected or hired. Forfeited only on no-show.</p>
            </div>

            <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-xl)', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--slate-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Challenge Fee</span>
                <span style={{ fontWeight: 700 }}>₹{job.challengeFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)' }}>
                <span style={{ color: 'var(--slate-500)' }}>Platform Fee</span>
                <span style={{ fontWeight: 700 }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 700 }}>Total Deposit</span>
                <span style={{ fontWeight: 800, color: 'var(--indigo-700)', fontSize: '1.1rem' }}>₹{job.challengeFee}</span>
              </div>
            </div>

            {error && <div className="alert-error" style={{ marginBottom: '1rem', justifyContent: 'flex-start', fontSize: '0.8rem' }}><AlertCircle size={16} /> {error}</div>}

            {user?.role === 'Recruiter' ? (
              <div style={{ textAlign: 'center', padding: '0.875rem', background: 'var(--slate-100)', borderRadius: 'var(--radius-xl)', color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500 }}>
                Viewing as Recruiter
              </div>
            ) : hasApplied ? (
              <button disabled className="btn-success" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: 0.9, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> Applied
              </button>
            ) : (
              <button onClick={handleApply} disabled={processing} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: processing ? 0.75 : 1, cursor: processing ? 'not-allowed' : 'pointer' }}>
                {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `Apply with ₹${job.challengeFee} (Refundable)`}
              </button>
            )}
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Protected by Stripe Escrow</p>
          </div>
        </div>
      </div>
      <style>{`.job-detail-grid { @media (max-width: 700px) { grid-template-columns: 1fr; } }`}</style>
    </div>
  );
};

export default JobDetails;
