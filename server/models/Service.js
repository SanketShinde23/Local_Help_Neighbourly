// server/models/Service.js

const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  features: [{ type: String }],
  images: [{ type: String }],
  reviews: { type: Number, default: 0 },
  // Link the service to the user who provides it
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerName: { type: String, required: true }, // Denormalized for easier querying
  listingStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
});

module.exports = mongoose.model('Service', ServiceSchema);