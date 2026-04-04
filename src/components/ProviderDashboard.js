import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaPlus,
  FaRupeeSign,
  FaSpinner,
  FaTrash,
  FaUserFriends,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authHeaders } from '../config/api';
import { SERVICE_CATEGORIES } from '../config/serviceCategories';
import '../pages/Pages.css';

const JOB_CATEGORIES = [
  { id: 'delivery', name: 'Delivery' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'education', name: 'Education' },
  { id: 'pets', name: 'Pet Care' },
  { id: 'moving', name: 'Moving' },
  { id: 'outdoor', name: 'Outdoor' },
];

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1513161455013-75b1a3102130?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80';

function ServiceListingStatus({ service }) {
  const st = service.listingStatus || 'approved';
  const reason = (service.rejectionReason || '').trim();
  if (st === 'approved') {
    return (
      <span className="listing-status-pill listing-approved" title="Listed publicly — seekers can book">
        Live
      </span>
    );
  }
  if (st === 'pending') {
    return (
      <span
        className="listing-status-pill listing-pending"
        title="Waiting for an administrator to approve before it appears under Find Services"
      >
        Pending admin review
      </span>
    );
  }
  return (
    <span
      className="listing-status-pill listing-rejected"
      title={reason || 'Edit the listing and save to resubmit for review'}
    >
      Rejected
    </span>
  );
}

/** Match server rules: do not rely only on seeker.email (some accounts may omit it in responses). */
function providerSeesSeekerPrivate(booking) {
  if (booking.seekerDetailsUnlocked === true) return true;
  const st = String(booking.status || '')
    .toLowerCase()
    .trim();
  if (st === 'confirmed' || st === 'completed') return true;
  return Boolean(booking.seeker?.email);
}

/** Seeker contact + service location — API only includes these after the provider confirms the booking. */
function ProviderBookingSeekerBody({ booking }) {
  const showPrivate = providerSeesSeekerPrivate(booking);
  return (
    <>
      <p>
        <strong>Seeker</strong> {booking.seeker?.name || '—'}
      </p>
      {!showPrivate ? (
        <p className="booking-privacy-hint">
          {booking.status === 'pending' ? (
            <>
              After you <strong>accept</strong> this booking, their phone, email, and service address will appear here.
            </>
          ) : (
            <>Contact details and address were not shared (declined or cancelled before confirmation).</>
          )}
        </p>
      ) : (
        <>
          <p>
            <strong>Email</strong>{' '}
            {booking.seeker?.email ? (
              <a href={`mailto:${booking.seeker.email}`} className="dashboard-text-link">
                {booking.seeker.email}
              </a>
            ) : (
              '—'
            )}
          </p>
          {booking.seeker.phone ? (
            <p>
              <strong>Phone</strong>{' '}
              <a href={`tel:${booking.seeker.phone.replace(/\s/g, '')}`} className="dashboard-text-link">
                {booking.seeker.phone}
              </a>
            </p>
          ) : (
            <p>
              <strong>Phone</strong> —{' '}
            </p>
          )}
          <p>
            <strong>Service location</strong> {booking.serviceLocation?.trim() || '—'}
          </p>
        </>
      )}
      <p>
        <strong>When</strong> {new Date(booking.scheduledDate).toLocaleString()} · {booking.timeSlot}
      </p>
      <p>
        <strong>Notes</strong> {booking.notes?.trim() || '—'}
      </p>
    </>
  );
}

function ProviderDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [incomingApps, setIncomingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: 'cleaning',
    pay: '',
    location: '',
    companyName: '',
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'home',
    price: '',
    image: DEFAULT_IMAGE,
    description: '',
    features: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sRes, jRes, bRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/services/mine`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/jobs/my/listings`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/bookings/provider`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/api/jobs/my/incoming-applications`, { headers: authHeaders(token) }),
      ]);
      if (sRes.status === 401 || jRes.status === 401 || bRes.status === 401 || aRes.status === 401) {
        logout();
        navigate('/login', { replace: true, state: { sessionExpired: true, from: '/profile' } });
        return;
      }
      if (!sRes.ok) throw new Error((await sRes.json()).msg || 'Failed to load services');
      if (!jRes.ok) throw new Error((await jRes.json()).msg || 'Failed to load jobs');
      if (!bRes.ok) throw new Error((await bRes.json()).msg || 'Failed to load bookings');
      if (!aRes.ok) throw new Error((await aRes.json()).msg || 'Failed to load applications');
      setServices(await sRes.json());
      setJobs(await jRes.json());
      setBookings(await bRes.json());
      setIncomingApps(await aRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingBookingRequests = bookings.filter((b) => b.status === 'pending');
  const bookedActiveBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastCompletedBookings = bookings.filter((b) => b.status === 'completed');
  const serviceHistorySorted = [...bookings].sort(
    (a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)
  );

  const totalEarnings = pastCompletedBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const submitJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.pay.trim() || !jobForm.location.trim()) {
      alert('Please fill title, pay, and location.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          ...jobForm,
          companyName: jobForm.companyName.trim() || user?.name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || 'Could not create job');
      setJobForm({
        title: '',
        description: '',
        category: 'cleaning',
        pay: '',
        location: '',
        companyName: '',
      });
      await load();
      setTab('jobs');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price) {
      alert('Name and price are required.');
      return;
    }
    setSaving(true);
    try {
      const features = serviceForm.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      const res = await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          category: serviceForm.category,
          price: Number(serviceForm.price),
          image: serviceForm.image.trim() || DEFAULT_IMAGE,
          description: serviceForm.description.trim(),
          features,
          images: [serviceForm.image.trim() || DEFAULT_IMAGE],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || 'Could not create service');
      alert(
        'Listing submitted for admin review. It will appear in its category only after approval.'
      );
      setServiceForm({
        name: '',
        category: 'home',
        price: '',
        image: DEFAULT_IMAGE,
        description: '',
        features: '',
      });
      await load();
      setTab('services');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error((await res.json()).msg || 'Delete failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error((await res.json()).msg || 'Delete failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications/${applicationId}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).msg || 'Update failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).msg || 'Update failed');
      if (status === 'confirmed') setTab('booked');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading && !services.length && !jobs.length) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="spin" /> Loading provider dashboard…
      </div>
    );
  }

  const providerNav = [
    { id: 'services', label: 'Post services', count: services.length },
    { id: 'pendingRequests', label: 'Pending requests', count: pendingBookingRequests.length },
    { id: 'booked', label: 'Booked', count: bookedActiveBookings.length },
    { id: 'pastCompleted', label: 'Past completed', count: pastCompletedBookings.length },
    { id: 'serviceHistory', label: 'Service history', count: bookings.length },
    { id: 'jobs', label: 'Job posts', count: jobs.length },
    { id: 'applicants', label: 'Applicants', count: incomingApps.length },
  ];

  return (
    <div className="dashboard-content">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Dashboard sections">
          <div className="dashboard-sidebar-title">Provider menu</div>
          <nav className="dashboard-sidebar-nav">
            {providerNav.map((item) => (
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
          <div className="dashboard-role-intro">
            <h2>Service provider dashboard</h2>
            <p>
              <strong>New service listings</strong> (including your first listing after sign-up) are sent to{' '}
              <strong>admin review</strong>. They stay private until approved, then they appear under Find Services and can be
              booked. <strong>Pending requests</strong> are booking asks to accept or decline. <strong>Booked</strong> means
              confirmed — mark complete after the visit.
            </p>
          </div>

          {error && <div className="error-message dashboard-error">{error}</div>}

          <div className="summary-grid summary-grid--compact">
            <div className="summary-card">
              <FaCalendarAlt className="summary-icon" style={{ color: '#f97316' }} />
              <div className="summary-info">
                <p>Pending requests</p>
                <h3>{pendingBookingRequests.length}</h3>
              </div>
            </div>
            <div className="summary-card">
              <FaBriefcase className="summary-icon" style={{ color: '#3b82f6' }} />
              <div className="summary-info">
                <p>Booked (confirmed)</p>
                <h3>{bookedActiveBookings.length}</h3>
              </div>
            </div>
            <div className="summary-card">
              <FaRupeeSign className="summary-icon" style={{ color: '#22c55e' }} />
              <div className="summary-info">
                <p>Past completed / revenue</p>
                <h3>
                  {pastCompletedBookings.length} · ₹{totalEarnings.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>
            <div className="summary-card">
              <FaUserFriends className="summary-icon" style={{ color: '#8b5cf6' }} />
              <div className="summary-info">
                <p>Listings · job applicants</p>
                <h3>
                  {services.length} · {incomingApps.filter((a) => a.status === 'pending').length}
                </h3>
              </div>
            </div>
          </div>

          {tab === 'services' && (
        <div className="dashboard-split">
          <form className="dashboard-form-card" onSubmit={submitService}>
            <h3>
              <FaPlus /> Post a service listing
            </h3>
            <p className="dashboard-form-notice">
              Your submission is queued for an administrator. You will see <strong>Pending admin review</strong> on your
              listing until it is approved or rejected.
            </p>
            <div className="form-group">
              <label>Service name</label>
              <input
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="e.g. Weekend home cleaning"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price (₹ / hr)</label>
              <input
                type="number"
                min="0"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                value={serviceForm.image}
                onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={3}
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Features (comma-separated)</label>
              <input
                value={serviceForm.features}
                onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                placeholder="Insured, Same-day, Eco products"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Submit for review'}
            </button>
          </form>

          <div className="dashboard-list-card">
            <h3>Your services</h3>
            {services.length === 0 ? (
              <p className="no-history">No services yet. Add your first listing.</p>
            ) : (
              <ul className="dashboard-entity-list">
                {services.map((s) => (
                  <li key={s._id}>
                    <div className="dashboard-service-line">
                      <div>
                        <strong>{s.name}</strong>
                        <span className="muted">₹{s.price}/hr · {s.category}</span>
                        <ServiceListingStatus service={s} />
                      </div>
                      {s.listingStatus === 'rejected' && (s.rejectionReason || '').trim() ? (
                        <p className="listing-rejection-note">Admin note: {(s.rejectionReason || '').trim()}</p>
                      ) : null}
                    </div>
                    <div className="dashboard-entity-actions">
                      <Link to={`/service/${s._id}`} className="action-btn secondary small-btn">View</Link>
                      <button type="button" className="action-btn secondary small-btn icon-danger" onClick={() => deleteService(s._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="dashboard-split">
          <form className="dashboard-form-card" onSubmit={submitJob}>
            <h3>
              <FaPlus /> Post a job
            </h3>
            <div className="form-group">
              <label>Job title</label>
              <input
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={jobForm.category}
                onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Pay</label>
              <input
                value={jobForm.pay}
                onChange={(e) => setJobForm({ ...jobForm, pay: e.target.value })}
                placeholder="₹20/hr or ₹500/day"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Company / team name (optional)</label>
              <input
                value={jobForm.companyName}
                onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                placeholder={user?.name || 'Your brand'}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish job'}
            </button>
          </form>

          <div className="dashboard-list-card">
            <h3>Your job posts</h3>
            {jobs.length === 0 ? (
              <p className="no-history">No jobs posted yet.</p>
            ) : (
              <ul className="dashboard-entity-list">
                {jobs.map((j) => (
                  <li key={j._id}>
                    <div>
                      <strong>{j.title}</strong>
                      <span className="muted">{j.pay} · {j.location} · {j.status}</span>
                    </div>
                    <div className="dashboard-entity-actions">
                      <button type="button" className="action-btn secondary small-btn icon-danger" onClick={() => deleteJob(j._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'pendingRequests' && (
        <div className="history-list">
          <p className="booking-section-hint">
            New booking requests awaiting your response. <strong>Accept</strong> moves them to the <strong>Booked</strong> tab for
            the seeker; after the appointment, mark <strong>completed</strong> there.
          </p>
          {pendingBookingRequests.length === 0 ? (
            <p className="no-history">No pending requests right now.</p>
          ) : (
            pendingBookingRequests.map((b) => (
              <div key={b._id} className="history-card">
                <div className="history-card-header">
                  <h3>{b.service?.name || 'Service'}</h3>
                  <span className="status-badge status-pending">pending</span>
                </div>
                <div className="history-card-body">
                  <ProviderBookingSeekerBody booking={b} />
                </div>
                <div className="history-card-actions">
                  <button type="button" className="action-btn primary" onClick={() => updateBookingStatus(b._id, 'confirmed')}>
                    Accept booking
                  </button>
                  <button type="button" className="action-btn secondary" onClick={() => updateBookingStatus(b._id, 'cancelled')}>
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'booked' && (
        <div className="history-list">
          <p className="booking-section-hint">
            You confirmed these bookings. After you deliver the service at the scheduled time, mark each as{' '}
            <strong>completed</strong> — they will appear under <strong>Past completed</strong> for both you and the seeker.
          </p>
          {bookedActiveBookings.length === 0 ? (
            <p className="no-history">No confirmed bookings yet. Accepted requests move here from Pending requests.</p>
          ) : (
            bookedActiveBookings.map((b) => (
              <div key={b._id} className="history-card">
                <div className="history-card-header">
                  <h3>{b.service?.name || 'Service'}</h3>
                  <span className="status-badge status-confirmed">confirmed</span>
                </div>
                <div className="history-card-body">
                  <ProviderBookingSeekerBody booking={b} />
                </div>
                <div className="history-card-actions">
                  <button type="button" className="action-btn primary" onClick={() => updateBookingStatus(b._id, 'completed')}>
                    Mark completed
                  </button>
                  <button type="button" className="action-btn secondary" onClick={() => updateBookingStatus(b._id, 'cancelled')}>
                    Cancel booking
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'pastCompleted' && (
        <div className="history-list">
          <p className="booking-section-hint">Jobs you finished — seeker sees these under <strong>Past taken</strong>.</p>
          {pastCompletedBookings.length === 0 ? (
            <p className="no-history">No completed services yet.</p>
          ) : (
            pastCompletedBookings.map((b) => (
              <div key={b._id} className="history-card">
                <div className="history-card-header">
                  <h3>{b.service?.name || 'Service'}</h3>
                  <span className="status-badge status-completed">completed</span>
                </div>
                <div className="history-card-body">
                  <ProviderBookingSeekerBody booking={b} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'serviceHistory' && (
        <div className="history-list">
          <p className="booking-section-hint">
            Full timeline of all service bookings (newest first). Use the other tabs to take action on pending or confirmed
            work.
          </p>
          {serviceHistorySorted.length === 0 ? (
            <p className="no-history">No booking history yet.</p>
          ) : (
            serviceHistorySorted.map((b) => (
              <div key={b._id} className="history-card history-card-readonly">
                <div className="history-card-header">
                  <h3>{b.service?.name || 'Service'}</h3>
                  <span className={`status-badge status-${(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
                </div>
                <div className="history-card-body">
                  <ProviderBookingSeekerBody booking={b} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'applicants' && (
        <div className="history-list">
          {incomingApps.length === 0 ? (
            <p className="no-history">No applications to your jobs yet.</p>
          ) : (
            incomingApps.map((a) => (
              <div key={a._id} className="history-card">
                <div className="history-card-header">
                  <h3>{a.job?.title}</h3>
                  <span className={`status-badge status-${(a.status || 'pending').toLowerCase()}`}>{a.status}</span>
                </div>
                <div className="history-card-body">
                  <p><strong>Applicant</strong> {a.seeker?.name}</p>
                  <p><strong>Message</strong> {a.message || '—'}</p>
                </div>
                <div className="history-card-actions">
                  <select
                    className="dashboard-select"
                    value={a.status}
                    onChange={(e) => updateApplicationStatus(a._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
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

export default ProviderDashboard;
