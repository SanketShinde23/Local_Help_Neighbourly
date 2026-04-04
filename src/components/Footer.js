// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a className="footer-logo" href="/" onClick={handleLinkClick}>
              <span className="footer-logo-icon">🤝</span>
              LocalHelp
            </a>
            <p className="footer-tagline">Connecting communities with trusted, verified service providers across India.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">fb</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">tw</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>For Clients</h4>
            <ul>
              <li><Link to="/services" onClick={handleLinkClick}>Find Services</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>How It Works</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Pricing</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Safety Tips</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>For Providers</h4>
            <ul>
              <li><Link to="/become-provider" onClick={handleLinkClick}>Become a Provider</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Guidelines</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Success Stories</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Resources</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about" onClick={handleLinkClick}>About Us</Link></li>
              <li><Link to="/careers" onClick={handleLinkClick}>Careers</Link></li>
              <li><Link to="/" onClick={handleLinkClick}>Press</Link></li>
              {/* --- LINK UPDATED --- */}
              <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Local Help. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/" onClick={handleLinkClick}>Privacy Policy</Link>
            <Link to="/" onClick={handleLinkClick}>Terms of Service</Link>
            <Link to="/" onClick={handleLinkClick}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;