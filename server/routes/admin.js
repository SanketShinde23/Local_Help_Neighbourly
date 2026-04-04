const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const ServiceBooking = require('../models/ServiceBooking');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

/** Full seeker & provider contact for admin mediation only (not exposed to seekers/providers). */
router.get('/bookings', auth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 150, 500);
    const bookings = await ServiceBooking.find()
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .populate('service', 'name category price providerName')
      .populate('seeker', 'name email phone')
      .populate('provider', 'name email phone');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/services/pending', auth, requireAdmin, async (req, res) => {
  try {
    const services = await Service.find({ listingStatus: 'pending' })
      .sort({ _id: -1 })
      .populate('provider', 'name email phone');
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.patch('/services/:id', auth, requireAdmin, async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: 'Invalid service id' });
    }
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'action must be approve or reject' });
    }
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found' });
    if (action === 'approve') {
      service.listingStatus = 'approved';
      service.rejectionReason = '';
    } else {
      service.listingStatus = 'rejected';
      service.rejectionReason = reason ? String(reason).trim() : 'Does not meet listing guidelines.';
    }
    await service.save();
    const populated = await Service.findById(service._id).populate('provider', 'name email phone');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
