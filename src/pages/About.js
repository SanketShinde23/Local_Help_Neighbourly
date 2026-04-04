// src/pages/About.js

import React from 'react';
import './Pages.css';

function About() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>About LocalHelp</h1>
        <p>Connecting Communities, One Task at a Time.</p>
      </div>

      <div className="page-content text-content">
        <h2>Our Mission</h2>
        <p>
          At LocalHelp, our mission is simple: to build stronger, more connected communities by making it easy for people to find trusted local help for their everyday needs. We believe that everyone has a skill to share, and everyone sometimes needs a helping hand. Our platform is the bridge that brings them together.
        </p>
        
        <h2>Our Story</h2>
        <p>
          Founded in 2023, LocalHelp started as a small idea to help neighbors connect for small jobs like gardening, tutoring, and minor home repairs. We saw that local talent was often overlooked, and finding reliable help was a challenge. We wanted to create a safe, simple, and effective platform where trust is paramount.
        </p>
        
        <h2>Why Choose Us?</h2>
        <p>
          We are more than just a service marketplace. We are a community-focused platform dedicated to safety, reliability, and mutual respect. Every provider is vetted, and our secure payment system ensures peace of mind for both clients and professionals. Whether you're looking for work or seeking help, you're joining a network of neighbors helping neighbors.
        </p>
      </div>
    </div>
  );
}

export default About;