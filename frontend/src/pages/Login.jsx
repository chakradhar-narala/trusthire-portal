import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'Candidate') {
        navigate('/');
      } else if (user.role === 'Recruiter') {
        if (user.subscriptionStatus !== 'active') {
          navigate('/subscribe');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      // The useEffect will handle the redirection automatically based on user state change.
      // But just as a backup here:
      if (userData.role === 'Candidate') {
        navigate('/');
      } else if (userData.role === 'Recruiter') {
         if (userData.subscriptionStatus !== 'active') {
           navigate('/subscribe');
         } else {
           navigate('/dashboard');
         }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="auth-page bg-grid">
      <div className="auth-glow" />
      <div className="auth-box animate-slide-up">
        <div className="glass-card">
          <div className="auth-icon">
            <Lock size={28} color="#fff" />
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Access your TrustHire account securely</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert-error">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Email</label>
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
            </div>

            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <div className="input-icon"><Lock size={18} /></div>
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

            <div className="auth-submit" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem' }}>
                Sign In
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
             Don't have an account? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
