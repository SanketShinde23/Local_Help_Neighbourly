// src/pages/AadhaarVerification.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function AadhaarVerification() {
  const [step, setStep] = useState('enterAadhaar'); // 'enterAadhaar' or 'enterOtp'
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation for Aadhaar number
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      setLoading(false);
      return;
    }

    // --- In the future, we will call the backend API here to send the OTP ---
    console.log(`Sending OTP for Aadhaar: ${aadhaarNumber}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setStep('enterOtp'); // Move to the next step
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- In the future, we will call the backend API here to verify the OTP ---
    console.log(`Verifying OTP: ${otp}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // On successful verification:
    setLoading(false);
    alert('Verification successful! Please log in to continue.');
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Identity Verification</h1>
        <p>Please complete this one-time verification to secure your account.</p>
      </div>

      <div className="verification-card">
        {step === 'enterAadhaar' && (
          <form onSubmit={handleSendOtp} className="provider-form">
            <h3>Step 1: Enter Aadhaar Number</h3>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>12-Digit Aadhaar Number</label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                maxLength="12"
                placeholder="XXXX XXXX XXXX"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'enterOtp' && (
          <form onSubmit={handleVerifyOtp} className="provider-form">
            <h3>Step 2: Enter OTP</h3>
            <p className="otp-info">An OTP has been sent to the mobile number linked with your Aadhaar.</p>
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
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AadhaarVerification;