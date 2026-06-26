// src/components/Signup.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { SERVICE_CATEGORIES } from '../config/serviceCategories';
import './Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    serviceCategory: 'home',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const setRole = (userType) => {
    setFormData((prev) => ({ ...prev, userType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) return setError('Please fill in all fields');
    if (!formData.phone || String(formData.phone).replace(/\D/g, '').length < 10) {
      return setError('Please enter a valid contact number (at least 10 digits)');
    }
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      console.log('Signup: sending register request to', `${API_BASE}/api/auth/register`);
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Signup: register response', response.status, data);
      if (!response.ok) throw new Error(data.msg || 'Something went wrong');
      
      console.log('Signup: success — navigating to verify-email');
      navigate('/verify-email', { state: { email: formData.email } });

    } catch (err) {
      console.error('Signup: register failed', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Choose how you will use LocalHelp, then complete your details</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>I am signing up as</label>
            <div className="signup-role-grid" role="group" aria-label="Account type">
              <button
                type="button"
                className={`signup-role-card ${formData.userType === 'user' ? 'selected' : ''}`}
                onClick={() => setRole('user')}
              >
                <span className="signup-role-title">Service seeker</span>
                <span className="signup-role-desc">Book local services and track your bookings and their status</span>
              </button>
              <button
                type="button"
                className={`signup-role-card ${formData.userType === 'provider' ? 'selected' : ''}`}
                onClick={() => setRole('provider')}
              >
                <span className="signup-role-title">Service provider</span>
                <span className="signup-role-desc">
                  List services you offer. Each listing is reviewed by an admin before it appears publicly.
                </span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Contact number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10+ digit mobile number"
              required
              autoComplete="tel"
            />
          </div>

          {/* --- NEW: Conditionally show Service Category Dropdown --- */}
          {formData.userType === 'provider' && (
            <div className="form-group">
              <label>What service do you provide?</label>
              <select name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} required>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="signup-provider-hint">
                After you verify your email, we create a starter listing in this category. It stays off the public directory
                until an administrator approves it (same for any new listing you add later).
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
          </div>
          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Sending Verification Email...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link"> Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;