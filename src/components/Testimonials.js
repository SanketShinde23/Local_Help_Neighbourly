import React from 'react';
import './Testimonials.css';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Darshan Gadhe',
      role: 'Homeowner',
      content: 'Found an amazing plumber within hours! The platform made it so easy to compare prices and read reviews.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      id: 2,
      name: 'Athrv Vaidya',
      role: 'Service Provider',
      content: 'Since joining Local Help, my business has grown by 40%. The platform connects me with serious clients.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      id: 3,
      name: 'Sanket Shinde',
      role: 'Student',
      content: 'Perfect for finding part-time work between classes. The verification process made me feel safe meeting clients.',
      rating: 4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    }
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <section className="testimonials">
      <div className="container">
        <p className="section-eyebrow">Testimonials</p>
        <h2 className="section-title">Loved by our community</h2>
        <p className="section-subtitle">Real stories from real people who found help through LocalHelp.</p>
        
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{testimonial.content}"</p>
              </div>
              <div className="testimonial-rating">
                {renderStars(testimonial.rating)}
              </div>
              <div className="testimonial-author">
                <img src={testimonial.avatar} alt={testimonial.name} />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 