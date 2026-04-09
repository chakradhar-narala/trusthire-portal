import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, User, Mail, Shield, Calendar, ShieldCheck, LogOut, FileText, Upload } from 'lucide-react';

const Profile = () => {
  const { user, logout, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      await api.put('/auth/profile/resume', formData);
      await fetchUser();
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="profile-page bg-grid">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {getInitial(user.name)}
            </div>
            <h1 className="profile-name">{user.name}</h1>
            <div className="profile-role-badge">{user.role}</div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">
                <Mail size={12} style={{ marginRight: '4px' }} /> Email Address
              </span>
              <span className="profile-info-value">{user.email}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">
                <Shield size={12} style={{ marginRight: '4px' }} /> Account Role
              </span>
              <span className="profile-info-value">{user.role}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Trust Score
              </span>
              <span className="profile-info-value" style={{ color: 'var(--primary-600)', fontWeight: '800', fontSize: '1.2rem' }}>
                {user.trustScore}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">
                <Calendar size={12} style={{ marginRight: '4px' }} /> Member Since
              </span>
              <span className="profile-info-value">{formatDate(user.createdAt)}</span>
            </div>
            
            <div className="profile-info-item">
              <span className="profile-info-label">
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Subscription
              </span>
              <span className="profile-info-value">
                {user.subscriptionStatus === 'active' ? (
                  <span className="badge badge-green">Premium Plan</span>
                ) : (
                  <span className="badge badge-slate">Free Plan</span>
                )}
              </span>
            </div>
            
            {user.role === 'Candidate' && (
              <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                <span className="profile-info-label">
                  <FileText size={12} style={{ marginRight: '4px' }} /> Resume / Portfolio Document
                </span>
                <span className="profile-info-value">
                  {user.resumeUrl ? (
                    <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-600)', textDecoration: 'underline' }}>
                      View Current Resume
                    </a>
                  ) : (
                    <span style={{ color: 'var(--slate-500)' }}>No Resume Uploaded</span>
                  )}
                  
                  <div style={{ marginTop: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>Update Resume (PDF)</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        style={{ fontSize: '0.85rem' }} 
                      />
                      <button 
                        onClick={handleUpload} 
                        disabled={!resumeFile || uploading}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', opacity: (!resumeFile || uploading) ? 0.5 : 1 }}
                      >
                        <Upload size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </span>
              </div>
            )}
          </div>

          <div className="profile-footer">
            <button onClick={() => navigate(-1)} className="btn-back">
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={handleLogout} className="profile-logout-btn">
              <LogOut size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
