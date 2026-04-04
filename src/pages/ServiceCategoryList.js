import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { API_BASE } from '../config/api';
import { getCategoryMeta, SERVICE_CATEGORIES } from '../config/serviceCategories';
import './Pages.css';

function ServiceCategoryList() {
  const { categoryId } = useParams();
  const location       = useLocation();
  const isAll          = categoryId === 'all';

  const meta = isAll
    ? {
        name: 'All Services',
        description: 'Every category in one list',
        icon: '📋',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
        color: '#4f46e5',
      }
    : getCategoryMeta(categoryId);

  const [services,      setServices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [offlineNotice, setOffline]       = useState('');
  const [searchTerm,    setSearchTerm]    = useState(location.state?.search || '');

  useEffect(() => {
    if (location.state?.search != null) setSearchTerm(location.state.search);
  }, [location.state?.search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setOffline('');
      const url = isAll
        ? `${API_BASE}/api/services`
        : `${API_BASE}/api/services?category=${encodeURIComponent(categoryId)}`;
      try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setServices(data.map((s) => ({ ...s, id: s._id, providerName: s.providerName })));
      } catch (err) {
        setServices([]);
        const isNetwork =
          err.message === 'Failed to fetch' ||
          err.name === 'TypeError' ||
          err.message.includes('NetworkError');
        setOffline(
          isNetwork
            ? `Cannot reach the API at ${API_BASE}. Start the backend to load listings.`
            : `Could not load listings (${err.message}).`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, isAll]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.providerName && s.providerName.toLowerCase().includes(q))
    );
  }, [services, searchTerm]);

  const labelForCategory = (id) => getCategoryMeta(id).name;

  return (
    <div className="scl-page">
      {/* ── Hero banner ── */}
      <div
        className="scl-hero"
        style={{ backgroundImage: `url(${meta.image})` }}
      >
        <div className="scl-hero-overlay" />
        <div className="scl-hero-content">
          <nav className="scl-breadcrumb" aria-label="Breadcrumb">
            <Link to="/services">Services</Link>
            <span>/</span>
            <span>{meta.name}</span>
          </nav>
          <div className="scl-hero-icon">{meta.icon}</div>
          <h1 className="scl-hero-title">{meta.name}</h1>
          <p className="scl-hero-subtitle">{meta.description}</p>
          <span className="scl-hero-badge" style={{ background: meta.color }}>
            {loading ? '…' : `${services.length} provider${services.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div className="page-container scl-content">
        {offlineNotice && (
          <div className="info-banner" role="status">{offlineNotice}</div>
        )}

        {/* ── search bar ── */}
        <div className="scl-search-wrap">
          <div className="scl-search-box">
            <span className="scl-search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${isAll ? 'all services' : meta.name + ' listings'}…`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="scl-clear-btn" onClick={() => setSearchTerm('')} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
          {!loading && (
            <span className="scl-result-count">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── listings ── */}
        {loading ? (
          <div className="scl-loading">Loading listings…</div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No services found</h3>
            <p>
              {searchTerm
                ? `No listings match "${searchTerm}". Try a different keyword.`
                : isAll
                  ? 'No listings yet. Check back when providers publish services.'
                  : `No ${meta.name} listings yet. Providers can list here from their dashboard.`}
            </p>
            <Link to="/services" className="scl-back-btn">← Back to categories</Link>
          </div>
        ) : (
          <div className="scl-grid">
            {filtered.map((s) => (
              <Link key={s.id} to={`/service/${s.id}`} className="scl-card">
                {/* image */}
                <div className="scl-card-img-wrap">
                  <img
                    src={s.image || getCategoryMeta(s.category).image}
                    alt={s.name}
                    className="scl-card-img"
                    onError={(e) => {
                      e.currentTarget.src = getCategoryMeta(s.category).image;
                    }}
                  />
                  {s.rating != null && (
                    <span className="scl-card-rating">
                      <FaStar style={{ color: '#f59e0b' }} />
                      {Number(s.rating).toFixed(1)}
                    </span>
                  )}
                  <span className="scl-card-category-pill">
                    {labelForCategory(s.category)}
                  </span>
                </div>

                {/* body */}
                <div className="scl-card-body">
                  <h3 className="scl-card-name">{s.name}</h3>
                  <p className="scl-card-provider">
                    by <strong>{s.providerName || 'Provider'}</strong>
                  </p>
                  {s.description && (
                    <p className="scl-card-desc">
                      {s.description.length > 90 ? s.description.slice(0, 90) + '…' : s.description}
                    </p>
                  )}

                  <div className="scl-card-meta">
                    {s.location && (
                      <span className="scl-card-meta-item">
                        <FaMapMarkerAlt /> {s.location}
                      </span>
                    )}
                    {s.availability && (
                      <span className="scl-card-meta-item">
                        <FaClock /> {s.availability}
                      </span>
                    )}
                  </div>
                </div>

                {/* footer */}
                <div className="scl-card-foot">
                  <span className="scl-card-price">
                    ₹{Number(s.price).toLocaleString('en-IN')}
                    <span className="scl-card-price-unit">/hr</span>
                  </span>
                  <span className="scl-card-book">View & Book</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── related categories ── */}
        {!loading && (
          <div className="scl-related">
            <h3 className="scl-related-title">Other categories</h3>
            <div className="scl-related-grid">
              {SERVICE_CATEGORIES.filter((c) => c.id !== categoryId).map((c) => (
                <Link
                  key={c.id}
                  to={`/services/category/${c.id}`}
                  className="scl-related-card"
                  style={{ '--cat-color': c.color }}
                >
                  <div
                    className="scl-related-img"
                    style={{ backgroundImage: `url(${c.image})` }}
                  />
                  <div className="scl-related-overlay" />
                  <span className="scl-related-label">
                    <span>{c.icon}</span> {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceCategoryList;
