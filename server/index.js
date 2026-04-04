// server/index.js

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Always load server/.env even if the process was started from the repo root
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET || !String(process.env.JWT_SECRET).trim()) {
  console.error('FATAL: JWT_SECRET is missing or empty in server/.env. JWT login will not work.');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Routes (registered before listen)
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

// Listen only after MongoDB is ready — otherwise the app exits and the React client shows "Failed to fetch"
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    console.error(
      '\nFix: check MONGO_URI in server/.env, internet/DNS, and Atlas Network Access (allow your IP).\n'
    );
    process.exit(1);
  });