const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    enum: ['Environment', 'Education', 'Healthcare', 'Humanitarian', 'Social Services', 'Economic Development'],
    required: true
  },
  location: {
    address: String,
    city: String,
    country: { type: String, default: 'Cameroon' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dateTime: {
    start: {
      type: Date,
      required: [true, 'Please add a start date']
    },
    end: Date,
    duration: Number // in hours
  },
  requirements: {
    minAge: { type: Number, default: 16 },
    maxAge: Number,
    skills: [String],
    experience: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced'],
      default: 'none'
    },
    physicalRequirements: String,
    equipment: [String]
  },
  capacity: {
    required: {
      type: Number,
      required: [true, 'Please specify number of volunteers needed'],
      min: [1, 'Must need at least 1 volunteer']
    },
    registered: { type: Number, default: 0 },
    waitlist: { type: Number, default: 0 }
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  volunteers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  waitlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'archived'],
    default: 'published'
  },
  visibility: {
    type: String,
    enum: ['public', 'community', 'private'],
    default: 'public'
  },
  images: [String],
  contactInfo: {
    email: String,
    phone: String,
    instructions: String
  },
  impact: {
    expectedBeneficiaries: Number,
    actualBeneficiaries: Number,
    description: String,
    metrics: [{
      name: String,
      value: Number,
      unit: String
    }]
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  tags: [String],
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number,
    endDate: Date
  },
  isEmergency: { type: Boolean, default: false },
  emergencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  views: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
opportunitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.capacity.registered = this.volunteers.filter(v => ['registered', 'confirmed', 'attended'].includes(v.status)).length;
  this.capacity.waitlist = this.waitlist.length;
  next();
});

// Increment view count
opportunitySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Add volunteer
opportunitySchema.methods.addVolunteer = function(userId, status = 'registered') {
  const existingVolunteer = this.volunteers.find(v => v.user.toString() === userId.toString());
  if (!existingVolunteer) {
    if (this.capacity.registered < this.capacity.required) {
      this.volunteers.push({ user: userId, status });
    } else {
      this.waitlist.push({ user: userId });
    }
  }
  return this.save();
};

// Remove volunteer
opportunitySchema.methods.removeVolunteer = function(userId) {
  this.volunteers = this.volunteers.filter(v => v.user.toString() !== userId.toString());
  this.waitlist = this.waitlist.filter(w => w.user.toString() !== userId.toString());
  
  // Move from waitlist to volunteers if space available
  if (this.waitlist.length > 0 && this.volunteers.length < this.capacity.required) {
    const nextVolunteer = this.waitlist.shift();
    this.volunteers.push({ user: nextVolunteer.user, status: 'registered' });
  }
  
  return this.save();
};

// Update volunteer status
opportunitySchema.methods.updateVolunteerStatus = function(userId, status) {
  const volunteer = this.volunteers.find(v => v.user.toString() === userId.toString());
  if (volunteer) {
    volunteer.status = status;
  }
  return this.save();
};

// Check if user is registered
opportunitySchema.methods.isUserRegistered = function(userId) {
  return this.volunteers.some(v => v.user.toString() === userId.toString()) ||
         this.waitlist.some(w => w.user.toString() === userId.toString());
};

// Get available spots
opportunitySchema.methods.getAvailableSpots = function() {
  return Math.max(0, this.capacity.required - this.capacity.registered);
};

// Add review
opportunitySchema.methods.addReview = function(userId, rating, comment) {
  const existingReview = this.feedback.reviews.find(r => r.user.toString() === userId.toString());
  if (!existingReview) {
    this.feedback.reviews.push({ user: userId, rating, comment });
    // Update average rating
    const totalRating = this.feedback.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.feedback.rating = totalRating / this.feedback.reviews.length;
  }
  return this.save();
};

// Indexes for better performance
opportunitySchema.index({ title: 'text', description: 'text' });
opportunitySchema.index({ category: 1 });
opportunitySchema.index({ 'location.city': 1 });
opportunitySchema.index({ 'dateTime.start': 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ community: 1 });
opportunitySchema.index({ createdBy: 1 });
opportunitySchema.index({ isEmergency: 1 });
opportunitySchema.index({ tags: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
