import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Briefcase, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Candidate' });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payloadData = new FormData();
      Object.keys(formData).forEach(key => payloadData.append(key, formData[key]));
      
      if (formData.role === 'Candidate' && resumeFile) {
        payloadData.append('resumeFile', resumeFile);
      }

      const userData = await register(payloadData);
      if (userData.role === 'Recruiter' && userData.subscriptionStatus !== 'active') {
        navigate('/subscribe');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="auth-page bg-grid">
      <div className="auth-glow" />
      <div className="auth-box animate-slide-up">
        <div className="glass-card">
          <div className="auth-icon">
            <User size={28} color="#fff" />
          </div>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-sub">Join the Trust-Driven premium hiring platform</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert-error">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <div className="input-icon"><User size={18} /></div>
                <input type="text" name="name" required className="input-field with-icon" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Email</label>
              <div className="input-group">
                <div className="input-icon"><Mail size={18} /></div>
                <input type="email" name="email" required className="input-field with-icon" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="input-group">
                <div className="input-icon"><Lock size={18} /></div>
                <input type="password" name="password" required minLength="6" className="input-field with-icon" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">I am a...</label>
              <div className="role-grid">
                <label className={`role-option ${formData.role === 'Candidate' ? 'selected' : ''}`}>
                  <input type="radio" name="role" value="Candidate" checked={formData.role === 'Candidate'} onChange={handleChange} style={{ display: 'none' }} />
                  <User size={22} color={formData.role === 'Candidate' ? 'var(--primary-600)' : 'var(--slate-400)'} />
                  <span className="role-label">Candidate</span>
                </label>
                <label className={`role-option ${formData.role === 'Recruiter' ? 'selected' : ''}`}>
                  <input type="radio" name="role" value="Recruiter" checked={formData.role === 'Recruiter'} onChange={handleChange} style={{ display: 'none' }} />
                  <Briefcase size={22} color={formData.role === 'Recruiter' ? 'var(--primary-600)' : 'var(--slate-400)'} />
                  <span className="role-label">Recruiter</span>
                </label>
              </div>
            </div>

            {formData.role === 'Candidate' && (
              <div className="form-field animate-fade-in">
                <label className="form-label">Resume / Portfolio (PDF)</label>
                <div className="input-group">
                  <div className="input-icon"><Briefcase size={18} /></div>
                  <input
                    type="file"
                    name="resumeFile"
                    accept=".pdf,.doc,.docx"
                    className="input-field with-icon"
                    onChange={handleFileChange}
                    required={formData.role === 'Candidate'}
                  />
                </div>
              </div>
            )}

            <div className="auth-submit">
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem' }}>
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
