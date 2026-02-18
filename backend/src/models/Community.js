const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: ['Environment', 'Education', 'Healthcare', 'Humanitarian', 'Social Services', 'Economic Development'],
    required: true
  },
  location: {
    city: String,
    country: { type: String, default: 'Cameroon' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  image: String,
  website: String,
  contactEmail: String,
  contactPhone: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowMemberInvites: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 1000 }
  },
  stats: {
    totalOpportunities: { type: Number, default: 0 },
    totalVolunteers: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 }
  },
  tags: [String],
  isActive: { type: Boolean, default: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add creator as first admin and member
communitySchema.pre('save', function(next) {
  if (this.isNew) {
    this.admins.push(this.createdBy);
    this.members.push({
      user: this.createdBy,
      role: 'admin'
    });
  }
  this.updatedAt = Date.now();
  next();
});

// Update member count
communitySchema.methods.updateMemberCount = function() {
  this.stats.totalVolunteers = this.members.length;
  return this.save();
};

// Add member
communitySchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  if (!existingMember) {
    this.members.push({ user: userId, role });
    this.stats.totalVolunteers = this.members.length;
  }
  return this.save();
};

// Remove member
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.stats.totalVolunteers = this.members.length;
  return this.save();
};

// Check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Check if user is admin
communitySchema.methods.isAdmin = function(userId) {
  return this.admins.some(adminId => adminId.toString() === userId.toString()) ||
         this.members.some(m => m.user.toString() === userId.toString() && ['admin', 'moderator'].includes(m.role));
};

// Indexes for better performance
communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ category: 1 });
communitySchema.index({ 'location.city': 1 });
communitySchema.index({ isActive: 1 });
communitySchema.index({ verificationStatus: 1 });
communitySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Community', communitySchema);
