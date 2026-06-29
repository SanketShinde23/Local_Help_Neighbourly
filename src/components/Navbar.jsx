// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo(0, 0);
  };
  
  const handleLogoClick = () => {
    setIsMenuOpen(false);
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      {isMenuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <div>
            <span className="logo-icon">🛠️</span> 
            <span className="logo-text">LocalHelp</span>
          </div>
        </div>
        
        {/* --- UPDATED: Mobile Menu Links --- */}
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/services" onClick={() => handleLinkClick('/services')}>Find Services</Link>
          <Link to="/jobs" onClick={() => handleLinkClick('/jobs')}>Find Jobs</Link>
          <Link to="/become-provider" onClick={() => handleLinkClick('/become-provider')}>Become a Provider</Link>
          {user?.userType === 'admin' && (
            <Link to="/admin" onClick={() => handleLinkClick('/admin')}>Admin</Link>
          )}

          {/* --- NEW: Show auth links inside mobile menu --- */}
          <div className="navbar-links-mobile-auth">
            {user ? (
              <>
                {user.userType === 'admin' && (
                  <Link to="/admin" className="login-btn" onClick={() => handleLinkClick('/admin')}>Admin</Link>
                )}
                <Link to="/profile" className="login-btn" onClick={() => handleLinkClick('/profile')}>Dashboard</Link>
                <button onClick={handleLogout} className="signup-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-btn" onClick={() => handleLinkClick('/login')}>Login</Link>
                <Link to="/signup" className="signup-btn" onClick={() => handleLinkClick('/signup')}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* --- UPDATED: Desktop User/Auth Section --- */}
        <div className="navbar-user">
          {user ? (
            <div className="user-info">
              <Link to="/profile" className="user-profile-link" title="Dashboard">
                <img 
                  src={user.avatar} 
                  alt="User Avatar" 
                  className="user-avatar" 
                />
                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
          
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <span className="theme-toggle-icon">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>

          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;