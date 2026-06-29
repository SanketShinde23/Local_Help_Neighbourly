import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authHeaders } from '../config/api';
import './Pages.css';
import './AdminServices.css';

function AdminServices() {
  const { user, token, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/pending`, { headers: authHeaders(token) });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.status === 403) {
        setError('You do not have admin access.');
        setPending([]);
        return;
      }
      if (!res.ok) throw new Error((await res.json()).msg || 'Failed to load');
      setPending(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings?limit=200`, { headers: authHeaders(token) });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.status === 403) {
        setBookings([]);
        return;
      }
      if (!res.ok) throw new Error((await res.json()).msg || 'Failed to load bookings');
      setBookings(await res.json());
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.userType === 'admin' && token) loadBookings();
  }, [user, token, loadBookings]);

  if (!user || user.userType !== 'admin') {
    return (
      <div className="page-container">
        <p>Admin access required. <Link to="/login">Sign in</Link> as an administrator.</p>
      </div>
    );
  }

  const act = async (id, action) => {
    const reason =
      action === 'reject'
        ? window.prompt('Optional rejection note (shown to the provider):') || ''
        : undefined;
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || 'Action failed');
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="page-container admin-services-page">
      <div className="page-header">
        <h1>Admin</h1>
        <p>
          Approve new service listings before they go live. Seekers and providers do not see each other&apos;s phone or
          email — use the booking list below to reach either party when needed.
        </p>
      </div>

      <p className="admin-back-link">
        <Link to="/profile">← Profile</Link>
      </p>

      {error && <div className="error-message">{error}</div>}

      <h2 className="admin-subheading">Pending service listings</h2>
      {loading ? (
        <div className="dashboard-loading">
          <FaSpinner className="spin" /> Loading…
        </div>
      ) : pending.length === 0 ? (
        <p className="no-history">No pending listings.</p>
      ) : (
        <ul className="admin-pending-list">
          {pending.map((s) => (
            <li key={s._id} className="admin-pending-card">
              <div className="admin-pending-body">
                <h2>{s.name}</h2>
                <p className="muted">
                  Category: <strong>{s.category}</strong> · Provider: <strong>{s.providerName}</strong> · ₹{s.price}/hr
                </p>
                <p className="admin-provider-contact">
                  Provider account (admin only):{' '}
                  {s.provider?.email}
                  {s.provider?.phone ? ` · ${s.provider.phone}` : ''}
                </p>
                <p>{s.description?.slice(0, 200)}{s.description?.length > 200 ? '…' : ''}</p>
              </div>
              <div className="admin-pending-actions">
                <button
                  type="button"
                  className="action-btn primary"
                  disabled={actionId === s._id}
                  onClick={() => act(s._id, 'approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="action-btn secondary"
                  disabled={actionId === s._id}
                  onClick={() => act(s._id, 'reject')}
                >
                  Reject
                </button>
                <Link to={`/service/${s._id}`} className="action-btn secondary small-btn">
                  Preview
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="admin-subheading admin-subheading-spaced">Service bookings (contact mediation)</h2>
      <p className="admin-section-lead">
        Phone and email are hidden from the seeker and provider dashboards. Use these details only to coordinate appointments
        or resolve issues.
      </p>
      {bookingsLoading ? (
        <div className="dashboard-loading">
          <FaSpinner className="spin" /> Loading bookings…
        </div>
      ) : bookings.length === 0 ? (
        <p className="no-history">No bookings yet.</p>
      ) : (
        <ul className="admin-bookings-list">
          {bookings.map((b) => (
            <li key={b._id} className="admin-booking-card">
              <div className="admin-booking-body">
                <p className="admin-booking-title">
                  <strong>{b.service?.name || 'Service'}</strong>
                  <span className={`status-badge status-${(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
                </p>
                <p className="muted">
                  {new Date(b.scheduledDate).toLocaleString()} · {b.timeSlot}
                </p>
                {b.serviceLocation?.trim() ? (
                  <p className="admin-booking-location">
                    <strong>Service location</strong> {b.serviceLocation.trim()}
                  </p>
                ) : null}
                <div className="admin-booking-parties">
                  <div>
                    <strong>Seeker</strong> {b.seeker?.name || '—'}
                    <br />
                    <span className="admin-contact-line">{b.seeker?.email || '—'}</span>
                    {b.seeker?.phone ? (
                      <>
                        <br />
                        <span className="admin-contact-line">{b.seeker.phone}</span>
                      </>
                    ) : null}
                  </div>
                  <div>
                    <strong>Provider</strong> {b.provider?.name || '—'}
                    <br />
                    <span className="admin-contact-line">{b.provider?.email || '—'}</span>
                    {b.provider?.phone ? (
                      <>
                        <br />
                        <span className="admin-contact-line">{b.provider.phone}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              {b.service?._id ? (
                <div className="admin-booking-actions">
                  <Link to={`/service/${b.service._id}`} className="action-btn secondary small-btn">
                    Service page
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminServices;
