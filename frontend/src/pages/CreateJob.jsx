import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Briefcase, MapPin, Tag, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const CreateJob = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ companyName: '', title: '', description: '', skills: '', location: '', challengeFee: 500, employmentType: 'Full Time', salaryLPA: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'Recruiter' && user.role !== 'Admin') navigate('/dashboard');
    else if (user.subscriptionStatus !== 'active') navigate('/subscribe');
  }, [user, navigate]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/jobs', { ...formData, skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean) });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'Recruiter' && user.role !== 'Admin')) return null;

  return (
    <div className="create-job-page">
      <div className="create-job-header animate-fade-in" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="create-job-title">
          Post a <span style={{ background: 'linear-gradient(135deg, var(--indigo-600), #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Premium Job</span>
        </h1>
        <p className="create-job-sub">Attract highly committed candidates through TrustHire's escrow-driven application layer.</p>
      </div>

      <div className="glass-card animate-slide-up" style={{ border: '1px solid var(--indigo-100)' }}>
        {error && (
          <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="form-section">
          <div className="form-field">
            <label className="form-label">Job Title</label>
            <div className="input-group">
              <div className="input-icon"><Briefcase size={18} /></div>
              <input type="text" name="title" value={formData.title} onChange={onChange} className="input-field with-icon" placeholder="e.g. Senior Frontend Engineer" required />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Company Name</label>
            <div className="input-group">
              <div className="input-icon"><Briefcase size={18} /></div>
              <input type="text" name="companyName" value={formData.companyName} onChange={onChange} className="input-field with-icon" placeholder="e.g. Cybernetics Inc" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Employment Type</label>
              <div className="input-group">
                <select name="employmentType" value={formData.employmentType} onChange={onChange} className="input-field" style={{ paddingLeft: '1rem', background: '#fff', appearance: 'auto' }} required>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Salary Package (LPA)</label>
              <div className="input-group">
                <input type="number" name="salaryLPA" value={formData.salaryLPA} onChange={onChange} className="input-field" placeholder="e.g. 15" required style={{ paddingLeft: '1rem' }} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Location</label>
              <div className="input-group">
                <div className="input-icon"><MapPin size={18} /></div>
                <input type="text" name="location" value={formData.location} onChange={onChange} className="input-field with-icon" placeholder="Remote or City, State" required />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Challenge Fee (₹)</label>
              <div className="input-group">
                <div className="input-icon" style={{ fontWeight: 700, color: 'var(--slate-500)' }}>₹</div>
                <input type="number" name="challengeFee" value={formData.challengeFee} onChange={onChange} min="100" max="5000" className="input-field with-icon" required />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Required Skills (comma-separated)</label>
            <div className="input-group">
              <div className="input-icon"><Tag size={18} /></div>
              <input type="text" name="skills" value={formData.skills} onChange={onChange} className="input-field with-icon" placeholder="React, Node.js, Python" required />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Job Description & Requirements</label>
            <div className="input-group" style={{ alignItems: 'flex-start' }}>
              <div className="input-icon" style={{ top: '1rem', transform: 'none' }}><FileText size={18} /></div>
              <textarea name="description" value={formData.description} onChange={onChange} className="textarea-field with-icon" placeholder="Describe the role, responsibilities, and ideal candidate profile..." required style={{ paddingLeft: '3rem' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <><CheckCircle2 size={18} /> Publish Job to Network</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
