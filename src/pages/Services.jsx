// src/pages/Services.js — category hub
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { SERVICE_CATEGORIES } from '../config/serviceCategories';
import './Pages.css';

function Services() {
  const [apiRows, setApiRows]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [offlineNotice, setOffline] = useState('');

  useEffect(() => {
    (async () => {
      setOffline('');
      try {
        const res = await fetch(`${API_BASE}/api/services`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setApiRows(data.map((s) => ({ ...s, id: s._id })));
      } catch (err) {
        setApiRows([]);
        const isNetwork =
          err.message === 'Failed to fetch' ||
          err.name === 'TypeError' ||
          err.message.includes('NetworkError');
        setOffline(
          isNetwork
            ? `Cannot reach the API at ${API_BASE}. Start the backend server.`
            : `Could not load listings (${err.message}).`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countFor      = (id) => apiRows.filter((s) => s.category === id).length;
  const totalListings = useMemo(() => apiRows.length, [apiRows]);

  return (
    <div className="page-container services-hub-page">
      {/* ── page header ── */}
      <div className="page-header">
        <h1>Browse services</h1>
        <p>Choose a category to see verified provider listings near you.</p>
      </div>

      {offlineNotice && (
        <div className="info-banner" role="status">{offlineNotice}</div>
      )}

      {loading ? (
        <div className="hub-loading">Loading categories…</div>
      ) : (
        <>
          {/* ── category grid ── */}
          <div className="hub-grid">
            {SERVICE_CATEGORIES.map((cat) => {
              const n = countFor(cat.id);
              return (
                <Link
                  key={cat.id}
                  to={`/services/category/${cat.id}`}
                  className="hub-card"
                >
                  {/* image */}
                  <div
                    className="hub-card-img"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  {/* overlay */}
                  <div className="hub-card-overlay" />

                  {/* badge */}
                  <span className="hub-card-badge" style={{ background: cat.color }}>
                    {cat.icon} {cat.name}
                  </span>

                  {/* bottom content */}
                  <div className="hub-card-body">
                    <h2 className="hub-card-title">{cat.name}</h2>
                    <p className="hub-card-desc">{cat.description}</p>
                    <div className="hub-card-foot">
                      <span className="hub-card-count">
                        {n === 0 ? 'No listings yet' : `${n} listing${n === 1 ? '' : 's'}`}
                      </span>
                      <span className="hub-card-cta">Browse →</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* all-services card */}
            <Link to="/services/category/all" className="hub-card hub-card-all">
              <div className="hub-card-img hub-card-img-all" />
              <div className="hub-card-overlay" />
              <div className="hub-card-body">
                <h2 className="hub-card-title">All services</h2>
                <p className="hub-card-desc">Every provider listing in one searchable list</p>
                <div className="hub-card-foot">
                  <span className="hub-card-count">{totalListings} total listings</span>
                  <span className="hub-card-cta">View all →</span>
                </div>
              </div>
            </Link>
          </div>

          {totalListings === 0 && !offlineNotice && (
            <p className="services-hub-footnote muted">
              No approved listings yet. Run <code>npm run seed</code> inside the{' '}
              <code>server</code> folder to add demo services.
            </p>
          )}
          {totalListings > 0 && (
            <p className="services-hub-footnote">
              {totalListings} approved listing{totalListings === 1 ? '' : 's'} from the database.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Services;
