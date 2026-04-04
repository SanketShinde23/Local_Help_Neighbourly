import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authHeaders } from '../config/api';
import './Pages.css';

function formatPosted(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

function Jobs() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineNotice, setOfflineNotice] = useState('');
  const [applyJob, setApplyJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  const jobTypes = [
    { id: 'all', name: 'All Jobs' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'education', name: 'Education' },
    { id: 'pets', name: 'Pet Care' },
    { id: 'moving', name: 'Moving' },
    { id: 'outdoor', name: 'Outdoor' },
  ];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    setOfflineNotice('');
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== 'all') params.set('category', selectedType);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`${API_BASE}/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error((await res.json()).msg || 'Failed to load jobs');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      const network =
        e.message === 'Failed to fetch' ||
        e.name === 'TypeError' ||
        (typeof e.message === 'string' && e.message.includes('NetworkError'));
      if (network) {
        setOfflineNotice(
          `Can't reach ${API_BASE}. Start the backend to see live job posts.`
        );
        setError('');
      } else {
        setError(e.message);
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchTerm]);

  useEffect(() => {
    if (location.state?.search != null) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  useEffect(() => {
    const t = setTimeout(() => fetchJobs(), searchTerm ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs, searchTerm]);

  const openApply = (job) => {
    if (!user) {
      navigate('/login', { state: { from: '/jobs' } });
      return;
    }
    if (user.userType !== 'user') {
      alert('Only seeker accounts can apply to jobs. Switch to a seeker account or browse as a guest.');
      return;
    }
    setApplyJob(job);
    setApplyMessage('');
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!applyJob) return;
    setApplyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${applyJob._id}/apply`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ message: applyMessage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || 'Application failed');
      setApplyJob(null);
      alert('Your application was submitted.');
      navigate('/profile');
    } catch (err) {
      alert(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Local jobs</h1>
        <p>Providers post openings here—apply in one click with your seeker account.</p>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" aria-label="Search">🔍</button>
        </div>
        <div className="category-filters">
          {jobTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={selectedType === type.id ? 'active' : ''}
              onClick={() => setSelectedType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center' }}>Loading jobs…</div>}
      {offlineNotice && <div className="info-banner">{offlineNotice}</div>}
      {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}

      {!loading && !error && (
        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="no-results">
              <h3>No jobs match your filters</h3>
              <p>Providers can post roles from the dashboard. Try clearing search or check back soon.</p>
              <Link to="/signup" className="view-details-btn" style={{ display: 'inline-block', marginTop: '12px' }}>
                Join as provider to post
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p className="job-company">
                    {(job.companyName || job.employer?.name || 'Local employer')} · {job.location}
                  </p>
                  {job.description ? (
                    <p className="job-snippet">{job.description.slice(0, 160)}{job.description.length > 160 ? '…' : ''}</p>
                  ) : null}
                  <div className="job-meta">
                    <span className="job-pay">{job.pay}</span>
                    <span className="job-type">{job.category}</span>
                    <span className="job-posted">{formatPosted(job.createdAt)}</span>
                  </div>
                </div>
                <div className="job-actions">
                  <button type="button" className="apply-btn" onClick={() => openApply(job)}>
                    Apply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {applyJob && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="apply-title">
          <div className="modal-card">
            <h3 id="apply-title">Apply to {applyJob.title}</h3>
            <form onSubmit={submitApply}>
              <div className="form-group">
                <label htmlFor="apply-msg">Message (optional)</label>
                <textarea
                  id="apply-msg"
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Introduce yourself or share availability…"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="action-btn secondary" onClick={() => setApplyJob(null)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn primary" disabled={applyLoading}>
                  {applyLoading ? 'Sending…' : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
