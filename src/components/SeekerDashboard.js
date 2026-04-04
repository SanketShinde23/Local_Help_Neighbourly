import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authHeaders } from '../config/api';
import '../pages/Pages.css';

function SeekerDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, bookRes] = await Promise.all([
        fetch(`${API_BASE}/api/jobs/my/applications`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/bookings/seeker`, { headers: authHeaders(token) }),
      ]);
      if (appRes.status === 401 || bookRes.status === 401) {
        logout();
        navigate('/login', { replace: true, state: { sessionExpired: true, from: '/profile' } });
        return;
      }
      if (!appRes.ok) throw new Error((await appRes.json()).msg || 'Failed to load applications');
      if (!bookRes.ok) throw new Error((await bookRes.json()).msg || 'Failed to load bookings');
      const apps = await appRes.json();
      const books = await bookRes.json();
      setApplications(apps);
      setBookings(books);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(), 30000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const bookedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastTakenBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalSpent = pastTakenBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error((await res.json()).msg || 'Could not cancel');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const renderServiceBookingCard = (b, { allowCancel }) => (
    <div key={b._id} className="history-card">
      <div className="history-card-header">
        <h3>{b.service?.name || 'Service'}</h3>
        <span className={`status-badge status-${(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
      </div>
      <div className="history-card-body">
        <p>
          <strong>Provider</strong> {b.provider?.name || b.service?.providerName}
        </p>
        <p>
          <strong>Date</strong> {new Date(b.scheduledDate).toLocaleString()}
        </p>
        <p>
          <strong>Time</strong> {b.timeSlot}
        </p>
        <p>
          <strong>Service location</strong> {b.serviceLocation?.trim() || '—'}
        </p>
        {b.notes?.trim() ? (
          <p>
            <strong>Notes</strong> {b.notes}
          </p>
        ) : null}
        <p>
          <strong>Price</strong> ₹{b.service?.price != null ? Number(b.service.price).toLocaleString('en-IN') : '—'}/hr
        </p>
      </div>
      <div className="history-card-actions">
        {allowCancel && (b.status === 'pending' || b.status === 'confirmed') && (
          <button type="button" className="action-btn secondary" onClick={() => cancelBooking(b._id)}>
            Cancel booking
          </button>
        )}
        <Link to={`/service/${b.service?._id || b.service}`} className="action-btn primary">
          View service
        </Link>
      </div>
    </div>
  );

  const emptyList = (message, linkText, linkTo) => (
    <p className="no-history inline">
      {message}{' '}
      <Link to={linkTo}>{linkText}</Link>
    </p>
  );

  if (loading && !applications.length && !bookings.length) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="spin" /> Loading your dashboard…
      </div>
    );
  }

  const seekerNav = [
    { id: 'pending', label: 'Pending', count: pendingBookings.length },
    { id: 'booked', label: 'Booked', count: bookedBookings.length },
    { id: 'past', label: 'Past taken', count: pastTakenBookings.length },
    { id: 'applications', label: 'Job applications', count: applications.length },
  ];

  const panelIntro = {
    pending: {
      title: 'Pending requests',
      body: 'These bookings are waiting for the provider to confirm. When they accept, they move to Booked.',
    },
    booked: {
      title: 'Confirmed bookings',
      body: 'The provider accepted these requests — they can see your contact details and service address to arrange the visit. After the visit they mark complete; then it appears under Past taken.',
    },
    past: {
      title: 'Past taken & cancelled',
      body: 'Completed services and any bookings that were cancelled.',
    },
    applications: {
      title: 'Your job applications',
      body: 'Roles you applied for on the jobs board. Each card shows the latest status from the employer.',
    },
  };
  const activeIntro = panelIntro[tab] || panelIntro.pending;

  return (
    <div className="dashboard-content">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Dashboard sections">
          <div className="dashboard-sidebar-title">Seeker menu</div>
          <nav className="dashboard-sidebar-nav">
            {seekerNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dashboard-nav-item ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <span className="dashboard-nav-label">{item.label}</span>
                <span className="dashboard-nav-badge">{item.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-section-head">
            <p className="dashboard-section-kicker">Service seeker</p>
            <h2>{activeIntro.title}</h2>
            <p className="dashboard-section-lead">{activeIntro.body}</p>
            <p className="dashboard-section-services-link">
              <Link to="/services">Browse services</Link>
              {' · '}
              <Link to="/jobs">Browse jobs</Link>
            </p>
          </header>

          {error && <div className="error-message dashboard-error">{error}</div>}

          {tab === 'pending' && (
            <div className="history-list dashboard-active-panel">
              {pendingBookings.length === 0
                ? emptyList('Nothing waiting on a provider right now.', 'Browse services', '/services')
                : pendingBookings.map((b) => renderServiceBookingCard(b, { allowCancel: true }))}
            </div>
          )}

          {tab === 'booked' && (
            <div className="history-list dashboard-active-panel">
              {bookedBookings.length === 0
                ? emptyList('No confirmed bookings yet. Check Pending for requests awaiting the provider.', 'Browse services', '/services')
                : bookedBookings.map((b) => renderServiceBookingCard(b, { allowCancel: true }))}
            </div>
          )}

          {tab === 'past' && (
            <div className="history-list seeker-bookings-sections dashboard-active-panel">
              <div className="booking-section">
                <h3 className="booking-section-title">Completed</h3>
                <p className="booking-section-hint">Services the provider marked complete after your appointment.</p>
                {pastTakenBookings.length === 0 ? (
                  <p className="no-history inline">No completed services yet.</p>
                ) : (
                  pastTakenBookings.map((b) => renderServiceBookingCard(b, { allowCancel: false }))
                )}
              </div>
              <div className="booking-section">
                <h3 className="booking-section-title">Cancelled</h3>
                <p className="booking-section-hint">
                  {cancelledBookings.length === 0
                    ? 'No cancelled bookings.'
                    : 'Bookings you or the provider cancelled.'}
                </p>
                {cancelledBookings.length === 0 ? null : (
                  cancelledBookings.map((b) => renderServiceBookingCard(b, { allowCancel: false }))
                )}
              </div>
              <p className="dashboard-footnote-muted dashboard-spend-footnote">
                Estimated spend from completed services:{' '}
                <strong>₹{totalSpent.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          )}

          {tab === 'applications' && (
            <div className="history-list dashboard-active-panel">
              {applications.length === 0 ? (
                emptyList('You have not applied to any jobs yet.', 'Browse jobs', '/jobs')
              ) : (
                applications.map((a) => (
                  <div key={a._id} className="history-card">
                    <div className="history-card-header">
                      <h3>{a.job?.title || 'Job'}</h3>
                      <span className={`status-badge status-${(a.status || 'pending').toLowerCase()}`}>{a.status}</span>
                    </div>
                    <div className="history-card-body">
                      <p>
                        <strong>Company</strong> {a.job?.companyName || '—'}
                      </p>
                      <p>
                        <strong>Location</strong> {a.job?.location}
                      </p>
                      <p>
                        <strong>Pay</strong> {a.job?.pay}
                      </p>
                      {a.message ? (
                        <p>
                          <strong>Note</strong> {a.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="history-card-actions">
                      <Link to="/jobs" className="action-btn secondary">
                        Browse more jobs
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeekerDashboard;
