import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Mail, Key, ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-grid">
      <div className="auth-glow" />
      <div className="auth-box animate-slide-up" style={{ maxWidth: '420px' }}>
        <div className="glass-card">
          <Link to="/login" className="back-link">
            <ArrowLeft size={18} /> Back to Login
          </Link>

          <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
            {step === 1 && <Mail size={24} color="#fff" />}
            {step === 2 && <ShieldCheck size={24} color="#fff" />}
            {step === 3 && <Key size={24} color="#fff" />}
          </div>

          <h2 className="auth-title">
            {step === 1 && 'Reset your password'}
            {step === 2 && 'Check your email'}
            {step === 3 && 'Set a new password'}
          </h2>
          <p className="auth-sub">
            {step === 1 && "We'll send a 6-digit code to your inbox"}
            {step === 2 && `We've sent an OTP to ${email}`}
            {step === 3 && 'Choose a strong password to stay secure'}
          </p>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {message && !error && step === 3 && (
            <div className="alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} /> {message}
            </div>
          )}

          <form className="auth-form">
            {step === 1 && (
              <div className="form-field">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <div className="input-icon"><Mail size={18} /></div>
                  <input
                    type="email"
                    required
                    className="input-field with-icon"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button 
                  disabled={loading} 
                  onClick={handleRequestOTP}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Code'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-field">
                <label className="form-label">Verification Code (OTP)</label>
                <div className="input-group">
                  <div className="input-icon"><ShieldCheck size={18} /></div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="input-field with-icon"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>
                <button 
                  disabled={loading} 
                  onClick={handleVerifyOTP}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--slate-500)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Entered wrong email? Change it
                </button>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="form-field">
                  <label className="form-label">New Password</label>
                  <div className="input-group">
                    <div className="input-icon"><Key size={18} /></div>
                    <input
                      type="password"
                      required
                      className="input-field with-icon"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-group">
                    <div className="input-icon"><ShieldCheck size={18} /></div>
                    <input
                      type="password"
                      required
                      className="input-field with-icon"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  onClick={handleResetPassword}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--slate-500);
          text-decoration: none;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--primary-600);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
