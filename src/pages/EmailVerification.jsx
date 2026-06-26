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
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  // --- THIS IS THE FIX ---
  // The hook is now at the top level of the component.
  // The logic inside the hook will handle the redirect.
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleResend = async () => {
    setError('');
    setNotice('');
    setResending(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = [data.reason, data.hint].filter(Boolean).join(' — ');
        throw new Error(detail || data.msg || 'Could not resend code');
      }
      setNotice(data.msg || 'Verification code sent. Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

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
          {notice && <div className="error-message" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#166534', borderColor: 'rgba(34, 197, 94, 0.35)' }}>{notice}</div>}
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
          <button
            type="button"
            className="submit-btn"
            style={{ marginTop: 12, background: 'transparent', color: 'inherit', border: '1px solid currentColor' }}
            onClick={handleResend}
            disabled={resending || loading}
          >
            {resending ? 'Sending...' : 'Resend verification code'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailVerification;