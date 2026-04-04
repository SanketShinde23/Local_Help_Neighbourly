// server/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Service = require('../models/Service');
const sendEmail = require('../utils/sendEmail');

// @route   POST api/auth/register
// @desc    Register a user, send verification OTP, and create default service if provider
router.post('/register', async (req, res) => {
  const { name, email, password, userType, serviceCategory, phone } = req.body;

  try {
    if (userType === 'admin') {
      return res.status(400).json({ msg: 'Invalid account type' });
    }
    const phoneStr = phone != null ? String(phone).trim() : '';
    if (phoneStr.length < 10) {
      return res.status(400).json({ msg: 'A valid contact number (at least 10 digits) is required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      userType,
      phone: phoneStr,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    if (userType === 'provider') {
      const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
      const category = serviceCategory || 'home';
      
      // --- THIS IS THE ONLY CHANGE ---
      // Creates a clean service name like "Cleaning Service" or "Tech Service"
      const serviceName = `${capitalize(category)} Service`;

      const defaultService = new Service({
        name: serviceName,
        category: category,
        price: Math.floor(Math.random() * (150 - 50 + 1)) + 50,
        rating: Number((Math.random() * (4.9 - 4.2) + 4.2).toFixed(1)),
        image: 'https://images.unsplash.com/photo-1513161455013-75b1a3102130?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        description: `Professional ${category} services tailored to your needs. Contact me for availability and custom quotes.`,
        features: ['Flexible scheduling', 'Quality guaranteed', 'Local & reliable'],
        images: [
          'https://images.unsplash.com/photo-1513161455013-75b1a3102130?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        ],
        provider: user._id,
        providerName: name,
        listingStatus: 'pending',
      });
      await defaultService.save();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      const message = `
        <h1>Email Verification for LocalHelp</h1>
        <p>Thank you for registering! Your One-Time Password (OTP) is:</p>
        <h2 style="font-size: 24px; letter-spacing: 2px; margin: 20px 0;">${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `;

      await sendEmail({
        email: user.email,
        subject: 'LocalHelp - Your Verification Code',
        message,
      });

      res.status(201).json({ msg: 'User registered. An OTP has been sent to your email.' });

    } catch (err) {
      console.error('Email sending error:', err);
      return res.status(500).json({ msg: 'Email could not be sent. Please try again later.' });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- VERIFY OTP ROUTE (Unchanged) ---
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      emailVerificationOtp: otp,
      emailVerificationOtpExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid OTP or OTP has expired.' });
    }
    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;
    await user.save();
    res.json({ success: true, msg: 'Email verified successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- LOGIN ROUTE (Unchanged) ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ msg: 'Please verify your email address before logging in.' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ msg: 'Server configuration error' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        userType: user.userType,
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80',
      };
      res.json({ token, user: userResponse });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;