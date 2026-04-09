import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const Subscribe = () => {
  const { user, token, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');
  const hasVerified = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId && token && !hasVerified.current) {
      hasVerified.current = true;
      verifyStripePayment(sessionId);
    }
  }, [location, token]);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'Recruiter') navigate('/dashboard');
    else if (user.subscriptionStatus === 'active' && !verifying) navigate('/dashboard');
  }, [user, navigate, verifying]);

  const verifyStripePayment = async (sessionId) => {
    setVerifying(true);
    setError('');
    try {
      await api.post('/payments/subscribe/verify', { session_id: sessionId });
      await fetchUser();
      setVerifying(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
      setVerifying(false);
    }
  };

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const { data: orderData } = await api.post('/payments/subscribe/order', {});
      
      if (orderData.checkoutUrl) {
          window.location.href = orderData.checkoutUrl;
      } else {
          throw new Error("No checkout URL returned");
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize checkout.');
      setLoading(false);
    }
  };

  if (!user || user.role !== 'Recruiter') return null;

  if (isSuccess) {
    return (
      <div className="sub-page bg-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card animate-slide-up" style={{ textAlign: 'center', maxWidth: '30rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--green-50)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid var(--green-200)' }}>
            <CheckCircle2 size={48} color="var(--green-600)" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--slate-500)', marginBottom: '2rem' }}>Your recruiter account is now verified. Welcome to TrustHire.</p>
          <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto', borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--indigo-600)' }} />
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--slate-400)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="sub-page bg-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="spinner" />
        <h2 style={{ fontWeight: 700, color: 'var(--slate-800)' }}>Verifying Payment...</h2>
        <p style={{ color: 'var(--slate-500)' }}>Please wait while Stripe confirms your subscription securely.</p>
      </div>
    );
  }

  const benefits = [
    'Secure Checkout powered by Stripe',
    'Post up to 5 ultra-premium job listings',
    'Access the escrow-based applicant management suite',
    'Receive a +30 TrustScore boost instantly',
  ];

  return (
    <div className="sub-page bg-grid" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'env(safe-area-inset-top)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '60rem', width: '100%', alignItems: 'center' }} className="sub-grid-resp">
        {/* Left column */}
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div className="badge badge-indigo animate-float" style={{ marginBottom: '1.25rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <ShieldCheck size={16} /> Recruiter Verification Required
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', lineHeight: 1.2 }}>
              Unlock the Power of <span style={{ background: 'linear-gradient(135deg, var(--indigo-600), #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>TrustHire</span>
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>
              To maintain the highest quality of hiring, all recruiters must demonstrate commitment through a verified subscription.
            </p>
            {infoMessage && (
              <div className="alert-error" style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
                {infoMessage}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-xl)', padding: '0.875rem 1.25rem', backdropFilter: 'blur(8px)' }}>
                <CheckCircle2 size={20} color="var(--indigo-600)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--slate-700)', fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — pricing card */}
        <div className="glass-card animate-slide-up" style={{ border: '2px solid var(--indigo-100)', transition: 'transform 0.3s' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>Recruiter Access Pass</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>One-time test subscription fee</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--slate-900)' }}>₹999</span>
              <span style={{ fontSize: '1rem', color: 'var(--slate-500)', fontWeight: 500 }}>/lifetime</span>
            </div>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Pay Securely with Stripe <ChevronRight size={18} /></>}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
            Powered by Stripe (Test Mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
