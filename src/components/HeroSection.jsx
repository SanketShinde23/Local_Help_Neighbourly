import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // This function now defaults to searching services if the user types and hits search
  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/services/category/all', { state: { search: searchQuery } });
  };

  return (
    <div className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Trusted by 2,000+ users across India
          </div>
          <h1 className="hero-title">Find <span className="highlight">Local Help</span><br/>Near You</h1>
          <p className="hero-subtitle">Connect with verified, skilled professionals in your community — fast, safe, and affordable.</p>
          
          <div className="search-tabs">
            {/* --- THIS IS THE FIX --- */}
            {/* The onClick now navigates directly to the page */}
            <button 
              className="tab active" // Always looks active
              onClick={() => navigate('/services')}
            >
              🔧 Find Services
            </button>
            <button 
              className="tab"
              onClick={() => navigate('/jobs')}
            >
              💼 Find Jobs
            </button>
          </div>

          <form className="search-container" onSubmit={handleSearch}>
            <div className="search-input-group">
              <input 
                type="text" 
                placeholder="What service do you need? (e.g., plumbing, electrician)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <input 
                type="text" 
                placeholder="Enter your location" 
                className="location-input"
              />
              <button type="submit" className="search-btn">
                <span className="search-icon">🔍</span>
                Search
              </button>
            </div>
          </form>

          <div className="popular-searches">
            <p>Popular:</p>
            <div className="search-tags">
              <button className="tag" onClick={() => navigate('/services/category/plumbing')}>
                Plumbing
              </button>
              <button
                className="tag"
                onClick={() => navigate('/services/category/home', { state: { search: 'Electrical' } })}
              >
                Electrical
              </button>
              <button className="tag" onClick={() => navigate('/services/category/cleaning')}>
                Cleaning
              </button>
              <button className="tag" onClick={() => navigate('/jobs', { state: { search: 'Delivery' } })}>
                Delivery
              </button>
            </div>
          </div>

          <div className="hero-cta">
            <p className="cta-text">Join our community of helpers</p>
            <div className="cta-buttons">
              <button 
                onClick={() => navigate('/signup')}
                className="cta-primary-btn"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="cta-secondary-btn"
              >
                Already a Member?
              </button>
            </div>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-number">500+</span>
              <span className="trust-label">Verified Providers</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">2K+</span>
              <span className="trust-label">Happy Clients</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">4.8★</span>
              <span className="trust-label">Average Rating</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">10+</span>
              <span className="trust-label">Service Categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;