// server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  userType: { type: String, enum: ['user', 'provider', 'admin'], required: true },
  date: { type: Date, default: Date.now },
  
  // --- UPDATED FIELDS FOR EMAIL OTP VERIFICATION ---
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOtp: {
    type: String,
  },
  emailVerificationOtpExpire: {
    type: Date,
  },
});

module.exports = mongoose.model('User', UserSchema);