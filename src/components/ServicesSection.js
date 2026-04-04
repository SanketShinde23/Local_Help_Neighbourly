// src/components/ServicesSection.js — image-card category grid
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { SERVICE_CATEGORIES } from '../config/serviceCategories';
import './ServicesSection.css';

function ServicesSection() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/services`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (cancelled || !Array.isArray(rows)) return;
        const byCat = {};
        rows.forEach((s) => {
          const c = s.category;
          if (!c) return;
          byCat[c] = (byCat[c] || 0) + 1;
        });
        setCounts(byCat);
      })
      .catch(() => { if (!cancelled) setCounts({}); });
    return () => { cancelled = true; };
  }, []);

  const handleCardClick = (slug) => {
    navigate(`/services/category/${slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <section className="services-section">
      <div className="container">
        <p className="section-eyebrow">What we offer</p>
        <h2 className="section-title">Popular service categories</h2>
        <p className="section-subtitle">
          Browse verified provider listings — from home repairs to tutoring, find help for anything.
        </p>

        <div className="svc-image-grid">
          {SERVICE_CATEGORIES.map((cat) => {
            const n = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                className="svc-image-card"
                onClick={() => handleCardClick(cat.id)}
                aria-label={`Browse ${cat.name}`}
              >
                {/* background image */}
                <div
                  className="svc-img"
                  style={{ backgroundImage: `url(${cat.image})` }}
                  aria-hidden
                />
                {/* dark gradient overlay */}
                <div className="svc-overlay" aria-hidden />

                {/* content on top */}
                <div className="svc-content">
                  <span className="svc-icon-bubble" style={{ background: cat.color }}>
                    {cat.icon}
                  </span>
                  <div className="svc-text">
                    <h3 className="svc-name">{cat.name}</h3>
                    <p className="svc-desc">{cat.description}</p>
                  </div>
                  <div className="svc-footer">
                    <span className="svc-count">
                      {n === 0 ? 'No listings yet' : `${n} listing${n === 1 ? '' : 's'}`}
                    </span>
                    <span className="svc-cta">Browse →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="view-all-container">
          <button type="button" className="view-all-btn" onClick={() => navigate('/services')}>
            View all categories
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
