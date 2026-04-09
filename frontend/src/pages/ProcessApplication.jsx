import { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ProcessApplication = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');
    if (!sessionId || !paymentId) { setStatus('error'); setErrorMsg('Invalid return URL parameters.'); return; }

    const verifyPayment = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;
      try {
        await api.post('/payments/verify', { session_id: sessionId, payment_id: paymentId });
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || err.message || 'Payment verification failed. Please contact support.');
      }
    };
    if (token) verifyPayment();
  }, [searchParams, token, navigate]);

  return (
    <div className="proc-page">
      <div className="glass-card proc-card">
        {status === 'processing' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="proc-icon-wrap loading">
              <Loader2 size={36} color="var(--primary-600)" className="animate-spin" />
            </div>
            <h2 className="proc-title">Verifying Escrow</h2>
            <p className="proc-sub">Securing your refundable deposit and registering your application...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="proc-icon-wrap success">
              <CheckCircle2 size={36} color="var(--green-600)" />
            </div>
            <h2 className="proc-title">Application Successful!</h2>
            <p className="proc-sub">Your escrow has been secured. Redirecting to your dashboard...</p>
            <div style={{ width: '100%', background: 'var(--slate-100)', height: '6px', borderRadius: '9999px', overflow: 'hidden', marginTop: '1.5rem' }}>
              <div style={{ height: '100%', background: 'var(--green-600)', animation: 'progress 2s ease-in-out forwards', width: '0%' }} />
            </div>
            <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="proc-icon-wrap error">
              <AlertCircle size={36} color="var(--red-600)" />
            </div>
            <h2 className="proc-title">Verification Failed</h2>
            <p className="proc-sub">{errorMsg}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ width: '100%', marginTop: '1.5rem' }}>
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessApplication;
