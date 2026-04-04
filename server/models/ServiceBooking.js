const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  /** Where the seeker wants the service (address / area). Hidden from provider until booking is confirmed. */
  serviceLocation: { type: String, default: '' },
  notes: { type: String, default: '' },
  /** Set when provider accepts; seeker contact + serviceLocation may be shown to provider. */
  seekerDetailsUnlocked: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ServiceBooking', ServiceBookingSchema);
