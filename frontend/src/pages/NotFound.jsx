import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)' }}>
      <div className="glass-card animate-slide-up" style={{ textAlign: 'center', maxWidth: '30rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--amber-500)' }}>
          <AlertCircle size={48} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>404 Not Found</h1>
        <p style={{ color: 'var(--slate-500)', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem' }}>
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
