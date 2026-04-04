// src/pages/Contact.js

import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Pages.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const teamMembers = [
    {
      name: 'Darshan Gadhe',
      role: 'CEO',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      education: 'BE in Computer Science, Logmieer College (Savitribai Phule Pune University)'
    },
    {
      name: 'Atharv Vaidya',
      role: 'MD (Managing Director)',
      avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      education: 'BE in Computer Science, Logmieer College (Savitribai Phule Pune University)'
    },
    {
      name: 'Sanket Shinde',
      role: 'VMD (Vice Managing Director)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      education: 'BE in Computer Science, Logmieer College (Savitribai Phule Pune University)'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    console.log('Contact form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Please fill out the form below or reach out to us directly.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-form-section">
          <h3>Send us a Message</h3>
          <form onSubmit={handleSubmit} className="provider-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
        
        <div className="contact-info-section">
          <h3>Contact Information</h3>
          <div className="contact-info-item">
            <FaMapMarkerAlt className="contact-icon" />
            <div>
              <h4>Our Office</h4>
              <p>123 Service Lane, Community City, 411041</p>
            </div>
          </div>
          <div className="contact-info-item">
            <FaEnvelope className="contact-icon" />
            <div>
              <h4>Email Us</h4>
              <p>contact@localhelp.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <FaPhone className="contact-icon" />
            <div>
              <h4>Call Us</h4>
              <p>+91 123 456 7890</p>
            </div>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h2 className="section-title">Meet The Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-card">
              <img src={member.avatar} alt={member.name} className="team-avatar" />
              <div className="team-member-info">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-education">{member.education}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;