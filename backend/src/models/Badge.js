const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['participation', 'hours', 'impact', 'community', 'skills', 'leadership'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['events_completed', 'hours_logged', 'people_helped', 'communities_joined', 'skills_added', 'events_created', 'applications_accepted'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    }
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);
