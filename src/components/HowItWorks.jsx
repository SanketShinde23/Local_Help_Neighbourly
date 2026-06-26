// src/components/HowItWorks.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure this is imported
import { FaSearch, FaComments, FaHandshake, FaStar } from 'react-icons/fa';
import './HowItWorks.css';

function HowItWorks() {
  const navigate = useNavigate(); // Initialize the navigate function

  const steps = [
    {
      id: 1,
      icon: <FaSearch />,
      title: 'Search Services',
      description: 'Find the service you need or browse our extensive categories to get started.'
    },
    {
      id: 2,
      icon: <FaComments />,
      title: 'Contact Providers',
      description: 'Message providers directly to discuss your specific needs and get a quote.'
    },
    {
      id: 3,
      icon: <FaHandshake />,
      title: 'Book & Pay Securely',
      description: 'Schedule appointments and pay with confidence through our secure platform.'
    },
    {
      id: 4,
      icon: <FaStar />,
      title: 'Rate & Review',
      description: 'Share your experience to help build a trustworthy community for everyone.'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <p className="section-eyebrow">Simple Process</p>
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Getting help has never been easier. Follow these four simple steps.</p>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={step.id} className="step" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="cta-container">
          <h3>Ready to Find Help?</h3>
          <p>Join thousands of satisfied users in your community today.</p>
          <div className="cta-buttons">
            {/* --- ADDED onClick HANDLER --- */}
            <button className="cta-btn primary" onClick={() => navigate('/services')}>
              Find Services
            </button>
            {/* --- ADDED onClick HANDLER --- */}
            <button className="cta-btn secondary" onClick={() => navigate('/become-provider')}>
              Become a Provider
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;