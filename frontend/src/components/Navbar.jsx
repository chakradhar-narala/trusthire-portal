import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (location.pathname === '/subscribe') {
    return null;
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <Briefcase color="#fff" size={20} />
          </div>
          <span className="navbar-title">TrustHire</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-score">
                Trust Score <span>{user.trustScore}</span>
              </span>
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/jobs" className="navbar-link">Jobs</Link>
              {user.role === 'Recruiter' && (
                <Link to="/create-job" className="navbar-link" style={{ fontWeight: 600, color: 'var(--brand-700)' }}>Post Job</Link>
              )}
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/profile" className="navbar-avatar" title="View Profile">
                {getInitial(user.name)}
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }} 
                className="btn-outline" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
