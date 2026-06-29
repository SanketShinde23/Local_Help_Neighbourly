// src/pages/Profile.js

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SeekerDashboard from '../components/SeekerDashboard';
import ProviderDashboard from '../components/ProviderDashboard';
import './Pages.css';
import './AdminServices.css';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div className="page-container">Loading profile...</div>;
  }

  const isProvider = user.userType === 'provider';

  if (user.userType === 'admin') {
    return (
      <div className="page-container profile-dashboard-page admin-profile-page">
        <div className="page-header page-header--compact">
          <h1>Admin</h1>
          <p>Review new provider listings and use the booking list to see seeker and provider contact when mediating.</p>
        </div>
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={user.avatar} alt={user.name} />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <span className="user-role-badge">Administrator</span>
          </div>
          <div className="profile-actions">
            <Link to="/admin" className="logout-btn-profile">
              Admin panel
            </Link>
            <button type="button" onClick={handleLogout} className="logout-btn-profile">
              Logout
            </button>
          </div>
        </div>
        <p className="admin-profile-cta">
          <Link to="/admin" className="view-details-btn">
            Open pending listings
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page-container profile-dashboard-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <p>
          {isProvider
            ? 'Post services, handle pending requests, booked jobs, past completed work, and full history.'
            : 'Pending bookings, confirmed bookings, past taken services, and job applications — all in one place.'}
        </p>
      </div>
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <p className="profile-phone-private">
            <strong>Your contact (not shared with the other party)</strong> {user.phone || '—'}
          </p>
          <span className="user-role-badge">{isProvider ? 'Service provider' : 'Service seeker'}</span>
        </div>
        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-btn-profile">Logout</button>
        </div>
      </div>

      <p className="contact-mediation-note">
        Before a provider <strong>confirms</strong> a booking, they only see your name. After they confirm, they receive
        your phone, email, and the service location you entered. Admins can still see booking details for support.
      </p>

      {user.userType === 'provider' ? <ProviderDashboard /> : <SeekerDashboard />}
    </div>
  );
}

export default Profile;