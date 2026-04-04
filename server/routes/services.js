const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Service = require('../models/Service');
const ServiceBooking = require('../models/ServiceBooking');
const User = require('../models/User');
const mongoose = require('mongoose');
const { auth, requireProvider, requireSeeker } = require('../middleware/auth');

function getUserIdFromReq(req) {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return decoded.user?.id || null;
  } catch {
    return null;
  }
}

/** Omit provider id on listings so seekers cannot resolve provider accounts; owners/admins still receive it. */
function serviceForJson(docOrLean, includeProviderId) {
  const o =
    docOrLean && typeof docOrLean.toObject === 'function'
      ? docOrLean.toObject({ virtuals: false })
      : { ...docOrLean };
  if (!includeProviderId) {
    delete o.provider;
  }
  return o;
}

function buildPublicListingFilter(category) {
  const approvedOnly = {
    $or: [{ listingStatus: 'approved' }, { listingStatus: { $exists: false } }],
  };
  const cat = category && String(category).trim() && String(category).trim() !== 'all' ? String(category).trim() : null;
  if (cat) {
    return { $and: [approvedOnly, { category: cat }] };
  }
  return approvedOnly;
}

router.get('/mine', auth, requireProvider, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort({ _id: -1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, requireProvider, async (req, res) => {
  try {
    const { name, category, price, image, description, features, images, rating } = req.body;
    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({ msg: 'Name, category, price, and image are required' });
    }
    const user = req.dbUser;
    const service = new Service({
      name,
      category,
      price: Number(price),
      image,
      description: description || '',
      features: Array.isArray(features) ? features : [],
      images: Array.isArray(images) && images.length ? images : [image],
      rating: rating != null ? Number(rating) : 4.5,
      reviews: 0,
      provider: req.user.id,
      providerName: user.name,
      listingStatus: 'pending',
    });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, requireProvider, async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: 'Invalid Service ID format' });
    }
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found' });
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { name, category, price, image, description, features, images, rating, reviews, providerName } = req.body;
    if (name !== undefined) service.name = name;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = Number(price);
    if (image !== undefined) service.image = image;
    if (description !== undefined) service.description = description;
    if (features !== undefined) service.features = features;
    if (images !== undefined) service.images = images;
    if (rating !== undefined) service.rating = Number(rating);
    if (reviews !== undefined) service.reviews = Number(reviews);
    if (providerName !== undefined) service.providerName = providerName;
    if (service.listingStatus === 'rejected') {
      service.listingStatus = 'pending';
      service.rejectionReason = '';
    }
    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, requireProvider, async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: 'Invalid Service ID format' });
    }
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found' });
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    await ServiceBooking.deleteMany({ service: serviceId });
    await Service.findByIdAndDelete(serviceId);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/book', auth, requireSeeker, async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: 'Invalid Service ID format' });
    }
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found' });
    if (service.provider.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot book your own service' });
    }
    const live =
      !service.listingStatus || service.listingStatus === 'approved';
    if (!live) {
      return res.status(400).json({ msg: 'This service is not available for booking yet' });
    }
    const { scheduledDate, timeSlot, notes, serviceLocation } = req.body;
    if (!scheduledDate || !timeSlot) {
      return res.status(400).json({ msg: 'Date and time slot are required' });
    }
    const loc = serviceLocation != null ? String(serviceLocation).trim() : '';
    if (loc.length < 8) {
      return res.status(400).json({ msg: 'Please enter the full service address or area (at least 8 characters)' });
    }
    const booking = new ServiceBooking({
      service: serviceId,
      seeker: req.user.id,
      provider: service.provider,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      serviceLocation: loc,
      notes: notes || '',
      status: 'pending',
      seekerDetailsUnlocked: false,
    });
    await booking.save();
    const populated = await ServiceBooking.findById(booking._id)
      .populate('service')
      .populate('provider', 'name')
      .populate('seeker', 'name');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = buildPublicListingFilter(category);
    const services = await Service.find(filter).sort({ _id: -1 });
    res.json(services.map((s) => serviceForJson(s, false)));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: 'Invalid Service ID format' });
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    const requesterId = getUserIdFromReq(req);
    let requester = null;
    if (requesterId) {
      requester = await User.findById(requesterId).select('userType');
    }
    const isOwner = requesterId && service.provider.toString() === requesterId;
    const isAdmin = requester && requester.userType === 'admin';
    const isApproved = !service.listingStatus || service.listingStatus === 'approved';
    if (!isApproved && !isOwner && !isAdmin) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    const includeProviderId = !!(isOwner || isAdmin);
    res.json(serviceForJson(service, includeProviderId));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
