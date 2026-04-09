import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, MapPin, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'TrustHire | Trust-Driven Hiring Platform';
    api.get('/jobs')
      .then(r => setJobs(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page bg-grid">
      <div className="home-inner">

        {/* Hero */}
        <div className="hero animate-fade-in">
          <div className="hero-chip animate-float">
            <Sparkles size={16} /> Welcome to the future of hiring
          </div>
          <h1 className="hero-h1">
            The <span className="hero-gradient">Trust-Driven</span><br />Hiring Platform
          </h1>
          <p className="hero-sub">
            Apply to premium jobs with a fully refundable challenge fee. Show your
            true commitment, and get hired faster.
          </p>
          <div className="hero-actions">
            <Link to="/jobs" className="btn-primary btn-lg">Find Jobs</Link>
          </div>
        </div>

        {/* Jobs Grid */}
        <div id="jobs" style={{ scrollMarginTop: '6rem' }}>
          <div className="section-head">
            <h2 className="section-title">
              <Briefcase size={22} color="var(--primary-600)" /> Latest Opportunities
            </h2>
            <span className="jobs-count-pill">{jobs.length} jobs available</span>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="grid-3">
              {jobs.map((job, i) => (
                <div
                  key={job._id}
                  className="card job-card animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms`, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <div className="job-card-title">{job.title}</div>
                      <div className="job-card-company">
                        <Briefcase size={14} color="var(--slate-400)" />
                        {job.recruiterId?.name || 'Top Company'}
                      </div>
                    </div>
                    <div className="trust-icon" title="Trust Verified">
                      <ShieldCheck size={22} />
                    </div>
                  </div>

                  <div className="job-meta">
                    <span className="job-meta-item">
                      <MapPin size={14} color="var(--slate-400)" /> {job.location}
                    </span>
                  </div>

                  <div className="skills-list">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="badge badge-primary">{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <div>
                      <span className="fee-label">Challenge Fee</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="fee-amount">₹{job.challengeFee}</span>
                        <span className="fee-refund">Refundable</span>
                      </div>
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                      Apply
                    </Link>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon"><Briefcase size={28} /></div>
                  <h3 style={{ fontWeight: 600, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>No Active Jobs</h3>
                  <p style={{ color: 'var(--slate-500)' }}>Check back later for new premium opportunities!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
