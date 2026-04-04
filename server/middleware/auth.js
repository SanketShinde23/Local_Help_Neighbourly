const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(req, res, next) {
  const header = req.header('Authorization');
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ msg: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
}

async function requireProvider(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.userType !== 'provider') {
      return res.status(403).json({ msg: 'Provider account required' });
    }
    req.dbUser = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

async function requireSeeker(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.userType !== 'user') {
      return res.status(403).json({ msg: 'Seeker account required' });
    }
    req.dbUser = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    req.dbUser = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

module.exports = { auth, requireProvider, requireSeeker, requireAdmin };
