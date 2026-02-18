const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['medium', 'high', 'critical'],
    required: true
  },
  targetLocation: {
    city: String,
    region: String,
    country: { type: String, default: 'Cameroon' },
    radius: Number // in km
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  stats: {
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 }
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

emergencyAlertSchema.index({ isActive: 1 });
emergencyAlertSchema.index({ severity: 1 });
emergencyAlertSchema.index({ 'targetLocation.city': 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);