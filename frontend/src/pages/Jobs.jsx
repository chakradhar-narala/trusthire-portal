import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, Briefcase, RefreshCcw, User, Star, Building2, AlignLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Jobs = () => {
  const { token, user } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(false);

  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  
  // Array of selected employment types
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  // Selected minimum salary (e.g. 10, 20)
  const [selectedSalary, setSelectedSalary] = useState('');


  const fetchJobs = () => {
    setLoadingJobs(true);
    setJobsError(false);
    
    const params = new URLSearchParams();
    if (searchText) params.append('search', searchText);
    if (selectedTypes.length > 0) params.append('employmentType', selectedTypes.join(','));
    if (selectedSalary) params.append('minSalary', selectedSalary);

    api.get(`/jobs?${params.toString()}`)
      .then(r => setJobs(r.data))
      .catch(e => {
        console.error("Jobs Fetch Error", e);
        setJobsError(true);
      })
      .finally(() => setLoadingJobs(false));
  };

  useEffect(() => {
    // Fetch initial jobs without filters
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update jobs when filters change automatically
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypes, selectedSalary]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const renderStars = (trustScore) => {
    // Map trustScore (0-100) to 1-5 rating roughly.
    const rating = Math.max(1, Math.ceil((trustScore || 50) / 20));
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
         {rating} <Star size={14} fill="#f59e0b" />
      </div>
    );
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 5rem)', paddingBottom: '4rem' }}>
      
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '2rem 1.5rem', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Discover Your Next Career Move</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Browse top opportunities curated by trusted recruiters</p>
      </div>

      <div style={{ maxWidth: '85rem', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }} className="jobs-layout-grid">
        
        {/* Left Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Card */}
          <div className="glass-card" style={{ background: '#fff', padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
                {user ? user.name.charAt(0).toUpperCase() : <User size={24} />}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                {user ? user.name : "Guest User"}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                {user ? `${user.role} profile active` : 'Sign in to explore matched jobs'}
              </p>
            </div>
          </div>

          {/* Filters Card */}
          <div className="glass-card" style={{ background: '#fff', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Type of Employment</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Full Time', 'Part Time', 'Freelance', 'Internship'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', color: '#334155' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#4f46e5' }}
                  />
                  {type}
                </label>
              ))}
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Salary Range</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Any Salary', val: '' },
                { label: '10 LPA and above', val: '10' },
                { label: '20 LPA and above', val: '20' },
                { label: '30 LPA and above', val: '30' },
                { label: '40 LPA and above', val: '40' }
              ].map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', color: '#334155' }}>
                  <input 
                    type="radio" 
                    name="salary"
                    value={opt.val}
                    checked={selectedSalary === opt.val}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#4f46e5' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="glass-card" style={{ background: '#fff', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, padding: '0 0.5rem' }}>
              <Search size={20} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search job titles, skills, or companies..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', color: '#0f172a' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.75rem' }}>Search</button>
          </form>

          {/* Job List */}
          {loadingJobs ? (
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '14rem', background: '#fff' }}>
              <div className="spinner" />
            </div>
          ) : jobsError ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '14rem', gap: '1rem', background: '#fff' }}>
               <p style={{ color: '#ef4444' }}>Failed to load jobs.</p>
               <button onClick={fetchJobs} className="btn-primary"><RefreshCcw size={16} /> Retry</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card empty-state animate-fade-in" style={{ background: '#fff' }}>
              <div className="empty-icon"><Briefcase size={32} /></div>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>No Jobs Found</h2>
              <p style={{ color: '#64748b' }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job, i) => (
                <Link 
                  key={job._id} 
                  to={`/jobs/${job._id}`}
                  className="glass-card job-feed-card animate-slide-up"
                  style={{ textDecoration: 'none', display: 'block', background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.2s', animationDelay: `${i * 30}ms` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                    
                    {/* Logo Placeholder */}
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '0.75rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e2e8f0', color: '#64748b' }}>
                        <Building2 size={28} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{job.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{job.companyName || 'Top Company'}</span>
                                    {renderStars(job.recruiterId?.trustScore)}
                                </div>
                            </div>
                        </div>

                        {/* Badges / Meta */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#f1f5f9', color: '#475569', padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                <MapPin size={14} /> {job.location}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#e0e7ff', color: '#4338ca', padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Briefcase size={14} /> {job.employmentType || 'Full Time'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                ₹{job.salaryLPA || '0'} LPA
                            </span>
                        </div>

                        {/* Description Preview */}
                        <div style={{ display: 'flex', gap: '0.5rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            <AlignLeft size={18} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#94a3b8' }} />
                            <p style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {job.description}
                            </p>
                        </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .jobs-layout-grid {
            @media (max-width: 900px) {
                grid-template-columns: 1fr !important;
            }
        }
        .job-feed-card:hover {
            border-color: #cbd5e1 !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
            transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Jobs;
