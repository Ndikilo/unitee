const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['opportunity', 'community', 'emergency', 'system', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    opportunityId: mongoose.Schema.Types.ObjectId,
    communityId: mongoose.Schema.Types.ObjectId,
    url: String,
    actionRequired: Boolean
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  sentVia: [{
    type: String,
    enum: ['push', 'email', 'sms']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });

module.exports = mongoose.model('Notification', notificationSchema);