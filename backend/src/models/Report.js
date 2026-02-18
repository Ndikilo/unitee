const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'opportunity', 'community', 'content'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['User', 'Opportunity', 'Community']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'fake', 'harassment', 'scam', 'other']
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  resolution: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);