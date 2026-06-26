const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

if (!process.env.JWT_SECRET || !String(process.env.JWT_SECRET).trim()) {
  console.error('FATAL: JWT_SECRET is missing');
  process.exit(1);
}

const { getEmailConfigStatus } = require('./utils/sendEmail');
const emailStatus = getEmailConfigStatus();
console.log('Email config at startup:', emailStatus);
if (emailStatus.hint) {
  console.warn('EMAIL SETUP:', emailStatus.hint);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.get('/api/health/email', (req, res) => {
  res.json(getEmailConfigStatus());
});
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