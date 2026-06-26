// src/pages/Careers.js

import React from 'react';
import './Pages.css';

function Careers() {
  const jobOpenings = [
    {
      title: 'Senior Frontend Engineer (React)',
      location: 'Remote',
      description: 'Join our core development team to build and enhance the user-facing features of the LocalHelp platform. Strong experience with React, CSS, and modern web technologies is a must.'
    },
    {
      title: 'Community Marketing Manager',
      location: 'Mumbai, India',
      description: 'Lead our marketing efforts to grow the LocalHelp community. You will be responsible for social media campaigns, local outreach programs, and building our brand presence.'
    },
    {
      title: 'UX/UI Designer',
      location: 'Remote',
      description: 'Design intuitive, user-friendly, and beautiful interfaces for our web and mobile applications. A strong portfolio and a passion for user-centric design are required.'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Join Our Team</h1>
        <p>Help us build the future of local service communities.</p>
      </div>

      <div className="job-openings">
        {jobOpenings.map((job, index) => (
          <div key={index} className="job-opening-card">
            <h2>{job.title}</h2>
            <p className="job-location">{job.location}</p>
            <p className="job-description">{job.description}</p>
            <button className="apply-btn">Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Careers;