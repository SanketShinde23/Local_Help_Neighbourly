const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ServiceBooking = require('../models/ServiceBooking');
const { auth, requireProvider, requireSeeker } = require('../middleware/auth');

function normalizeBookingStatus(status) {
  return String(status || '')
    .toLowerCase()
    .trim();
}

function providerCanSeeSeekerPrivate(booking) {
  if (booking.seekerDetailsUnlocked === true) return true;
  const st = normalizeBookingStatus(booking.status);
  return st === 'confirmed' || st === 'completed';
}

function sanitizeBookingForProvider(doc) {
  const b =
    doc && typeof doc.toObject === 'function'
      ? doc.toObject({ virtuals: false })
      : { ...doc };
  const show = providerCanSeeSeekerPrivate(b);
  if (!show) {
    if (b.seeker && typeof b.seeker === 'object' && b.seeker !== null) {
      b.seeker = {
        _id: b.seeker._id,
        name: b.seeker.name,
      };
    }
    delete b.serviceLocation;
  }
  return b;
}

router.get('/seeker', auth, requireSeeker, async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ seeker: req.user.id })
      .populate('service')
      .populate('provider', 'name')
      .sort({ scheduledDate: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/provider', auth, requireProvider, async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ provider: req.user.id })
      .populate({ path: 'service' })
      .populate({ path: 'seeker', select: 'name email phone' })
      .sort({ scheduledDate: -1 })
      .lean();
    res.json(bookings.map((b) => sanitizeBookingForProvider(b)));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ msg: 'Invalid booking id' });
    }
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const isSeeker = booking.seeker.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    if (!isSeeker && !isProvider) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ msg: 'Status is required' });
    }

    const allowedSeeker = ['cancelled'];
    const allowedProvider = ['confirmed', 'completed', 'cancelled'];

    if (isSeeker && !allowedSeeker.includes(status)) {
      return res.status(400).json({ msg: 'Seekers can only cancel a booking' });
    }
    if (isProvider && !allowedProvider.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status for provider' });
    }

    const current = booking.status;

    if (isSeeker && status === 'cancelled') {
      if (!['pending', 'confirmed'].includes(current)) {
        return res.status(400).json({ msg: 'This booking can no longer be cancelled' });
      }
      booking.status = 'cancelled';
    } else if (isProvider) {
      if (status !== current) {
        if (['completed', 'cancelled'].includes(current)) {
          return res.status(400).json({ msg: 'This booking is already closed' });
        }
        if (status === 'confirmed' && current !== 'pending') {
          return res.status(400).json({ msg: 'Only pending requests can be accepted' });
        }
        if (status === 'completed' && current !== 'confirmed') {
          return res.status(400).json({ msg: 'Only confirmed bookings can be marked completed' });
        }
        if (status === 'cancelled' && !['pending', 'confirmed'].includes(current)) {
          return res.status(400).json({ msg: 'This booking cannot be declined or cancelled' });
        }
        booking.status = status;
        if (isProvider && status === 'confirmed' && current === 'pending') {
          booking.seekerDetailsUnlocked = true;
        }
      }
    }
    await booking.save();
    const populated = await ServiceBooking.findById(booking._id)
      .populate({ path: 'service' })
      .populate({ path: 'provider', select: 'name' })
      .populate({ path: 'seeker', select: 'name email phone' })
      .lean();
    if (isProvider) {
      res.json(sanitizeBookingForProvider(populated));
    } else {
      res.json(populated);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
