import React from 'react';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';

function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <HowItWorks />
      <Testimonials />
    </div>
  );
}

export default Home;