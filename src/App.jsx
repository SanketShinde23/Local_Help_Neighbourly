// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceCategoryList from './pages/ServiceCategoryList';
import Jobs from './pages/Jobs';
import BecomeProvider from './pages/BecomeProvider';
import ServiceDetail from './pages/ServiceDetail';
import Login from './components/Login';
import Signup from './components/Signup';
import Footer from './components/Footer';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import EmailVerification from './pages/EmailVerification';
import Profile from './pages/Profile'; // <-- IMPORT Profile
import AdminServices from './pages/AdminServices';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services/category/:categoryId" element={<ServiceCategoryList />} />
              <Route path="/services" element={<Services />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/become-provider" element={<BecomeProvider />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminServices />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;