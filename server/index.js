const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

if (!process.env.JWT_SECRET || !String(process.env.JWT_SECRET).trim()) {
  console.error('FATAL: JWT_SECRET is missing');
  process.exit(1);
}

const emailViaApi = Boolean(process.env.BREVO_API_KEY);
const emailViaSmtp = Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_FROM
);

if (!emailViaApi && !emailViaSmtp) {
  console.warn(
    'WARNING: No email delivery configured. Set BREVO_API_KEY + EMAIL_FROM (recommended on Render) ' +
      'or EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM for SMTP.'
  );
} else if (!emailViaApi && emailViaSmtp) {
  console.warn(
    'WARNING: Using SMTP only. Render free tier blocks outbound ports 587/465/25 — ' +
      'emails will not send until you set BREVO_API_KEY or upgrade to a paid Render instance.'
  );
} else {
  console.log('Email delivery: Brevo HTTP API (BREVO_API_KEY set)');
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });