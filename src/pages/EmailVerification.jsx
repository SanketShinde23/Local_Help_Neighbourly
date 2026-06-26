// src/pages/EmailVerification.js

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './Pages.css';

function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- THIS IS THE FIX ---
  // The hook is now at the top level of the component.
  // The logic inside the hook will handle the redirect.
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Verification failed');
      
      setLoading(false);
      
      alert('Verification successful! You can now log in.');
      
      navigate('/login', { state: { email: email } });

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // If there's no email, we render nothing while useEffect redirects
  if (!email) {
    return null;
  }

  // Otherwise, render the full page
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Verify Your Email</h1>
        <p>An OTP has been sent to <strong>{email}</strong>. Please enter it below.</p>
      </div>

      <div className="verification-card">
        <form onSubmit={handleSubmit} className="provider-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>One-Time Password (OTP)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailVerification;