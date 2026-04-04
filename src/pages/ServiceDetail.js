// src/pages/ServiceDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authHeaders } from '../config/api';
import './Pages.css';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/api/services/${id}`, {
          headers: authHeaders(token),
        });
        if (!response.ok) throw new Error('Service not found in the database.');
        const data = await response.json();
        setService(data);
        const images = data.images && data.images.length > 0 ? data.images : [data.image];
        setMainImage(images[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id, token]);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return alert('Please select a date and time.');
    const loc = String(serviceLocation || '').trim();
    if (loc.length < 8) {
      return alert('Please enter the full address or area where you need the service (at least 8 characters).');
    }
    if (!user) {
      navigate('/login', { state: { from: `/service/${id}` } });
      return;
    }
    if (user.userType !== 'user') {
      alert('Bookings are for seeker accounts. Sign up as “I need services” to book.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}/book`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          scheduledDate: selectedDate,
          timeSlot: selectedTime,
          notes: '',
          serviceLocation: loc,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || 'Booking failed');
      alert('Request sent. Track it in your dashboard.');
      navigate('/profile');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="page-container" style={{textAlign: 'center'}}>Loading service details...</div>;
  if (error) return <div className="page-container error-message" style={{textAlign: 'center'}}>Error: {error}</div>;
  if (!service) return <div className="page-container" style={{textAlign: 'center'}}>Service not found.</div>;
  
  const serviceFeatures = service.features || ['No specific features listed.'];
  const serviceImages = (service.images && service.images.length > 0) ? service.images : [service.image];

  const providerId = service.provider?._id || service.provider;
  const isOwner = user && providerId && String(providerId) === String(user.id);
  const listingStatus = service.listingStatus;
  const isApproved = !listingStatus || listingStatus === 'approved';
  const canBook = user?.userType === 'user' && isApproved && !isOwner;

  return (
    <div className="page-container">
      {listingStatus === 'pending' && isOwner && (
        <div className="info-banner" style={{ marginBottom: 16 }} role="status">
          This listing is <strong>pending admin review</strong>. It is not visible to the public until approved.
        </div>
      )}
      {listingStatus === 'rejected' && isOwner && (
        <div className="error-message" style={{ marginBottom: 16 }} role="alert">
          <strong>Not approved.</strong> {service.rejectionReason || 'Update your listing and save to resubmit for review.'}
        </div>
      )}
      <div className="service-detail-grid">
        <div className="service-main-content">
          <div className="service-gallery-card">
            <img src={mainImage} alt={service.name} className="main-image" />
            <div className="thumbnail-grid">
              {serviceImages.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`${service.name} ${index + 1}`} 
                  className={mainImage === img ? 'active-thumbnail' : ''}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>
          
          <div className="detail-card">
            <span className="service-category-tag">{service.category}</span>
            <h1>{service.name}</h1>
            <div className="service-rating-info">
              <FaStar color="#f59e0b" /> 
              <span><strong>{service.rating}</strong> ({service.reviews || 0} reviews)</span>
            </div>
          </div>

          <div className="detail-card">
            <h3>Description</h3>
            <p>{service.description || 'No description available.'}</p>
          </div>

          <div className="detail-card">
            <h3>Services Offered</h3>
            <ul className="service-features-list">
              {serviceFeatures.map((item, index) => (
                <li key={index}><FaCheckCircle className="feature-icon" />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="service-sidebar">
          {canBook ? (
            <div className="booking-card">
              <div className="booking-price">
                <h2>₹{service.price.toLocaleString('en-IN')}</h2>
                <span>/hour</span>
              </div>
              <form onSubmit={handleBooking} className="booking-form">
                <div className="form-group">
                  <label><FaCalendarAlt /> Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label><FaClock /> Select Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">Choose a time slot</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><FaMapMarkerAlt /> Service location</label>
                  <textarea
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    placeholder="Full address, landmark, flat no., area — shown to the provider only after they confirm your booking"
                    rows={3}
                    required
                    minLength={8}
                    className="booking-location-input"
                  />
                  <p className="booking-location-hint">
                    This is shared with the provider only after they accept. Admins can see it for support.
                  </p>
                </div>
                <button type="submit" className="book-now-btn">Book Now</button>
              </form>
            </div>
          ) : (
            <div className="booking-card">
              {!isApproved && !isOwner ? (
                <p className="muted">This service is not available for booking.</p>
              ) : isOwner ? (
                <p className="muted">You cannot book your own service.</p>
              ) : (
                <p className="muted">Sign in as a service seeker to book this listing.</p>
              )}
            </div>
          )}

          <div className="provider-card provider-card-minimal">
            <h3 className="provider-card-heading">Provider</h3>
            <p className="provider-name-public">{service.providerName}</p>
            <p className="provider-privacy-note">
              Only the provider&apos;s name is shown before you book. After they <strong>confirm</strong> your request,
              they receive your phone, email, and the service location you enter — so you can coordinate the visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;