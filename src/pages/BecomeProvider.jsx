import React, { useState } from 'react';
import './Pages.css';

function BecomeProvider() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    experience: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Application submitted! We will contact you soon.');
    // Here you would typically send the data to your backend
    console.log('Provider application:', formData);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Become a Service Provider</h1>
        <p>Join our community of trusted professionals</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="provider-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Select a service</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="tutoring">Tutoring</option>
              <option value="moving">Moving</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Service Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the services you offer..."
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">Submit Application</button>
        </form>

        <div className="benefits-section">
          <h3>Why Join Us?</h3>
          <div className="benefits-list">
            <div className="benefit">
              <h4>📱 Reach More Clients</h4>
              <p>Connect with people in your community looking for your services</p>
            </div>
            <div className="benefit">
              <h4>💼 Build Your Business</h4>
              <p>Grow your customer base and increase your earnings</p>
            </div>
            <div className="benefit">
              <h4>⭐ Build Reviews</h4>
              <p>Collect reviews and build your reputation</p>
            </div>
            <div className="benefit">
              <h4>🔒 Secure Payments</h4>
              <p>Get paid securely through our platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BecomeProvider;