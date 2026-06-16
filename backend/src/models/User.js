const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'organizer'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  onboardingCompleted: { type: Boolean, default: false },
  profile: {
    avatar: String,
    phone: String,
    city: String,
    country: { type: String, default: 'Cameroon' },
    bio: String,
    skills: [String],
    interests: [String],
    dateOfBirth: Date,
    purpose: {
      type: String,
      enum: ['volunteering', 'internship', 'community_impact', 'professional_development'],
    },
    availability: {
      weekends: { type: Boolean, default: false },
      evenings: { type: Boolean, default: false },
      fullTime: { type: Boolean, default: false },
      remote: { type: Boolean, default: false },
    },
  },
  organizationName: String,
  organizationDescription: String,
  organizationWebsite: String,
  organizationType: {
    type: String,
    enum: ['ngo', 'startup', 'school', 'cbo', 'government', 'health', 'religious', 'other'],
  },
  organizationPhone: String,
  organizationCity: String,
  organizationRegion: String,
  organizationLogo: String,
  organizationBanner: String,
  organizationBrandColor: { type: String, default: '#f97316' },
  organizationVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  stats: {
    totalHours: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    peopleHelped: { type: Number, default: 0 },
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: Date
    }]
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emergencyAlerts: { type: Boolean, default: true },
    opportunityUpdates: { type: Boolean, default: true },
    communityUpdates: { type: Boolean, default: true },
    badgeAlerts: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    privacy: {
      showProfileToOrgs: { type: Boolean, default: true },
      showHoursPublicly: { type: Boolean, default: true },
      showBadgesPublicly: { type: Boolean, default: true },
      allowCertVerification: { type: Boolean, default: true },
    },
  },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token (valid for 24 hours)
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Add badge to user
userSchema.methods.addBadge = function(badge) {
  const existingBadge = this.stats.badges.find(b => b.name === badge.name);
  if (!existingBadge) {
    this.stats.badges.push({
      ...badge,
      earnedAt: new Date()
    });
  }
  return this.save();
};

// Update volunteer stats
userSchema.methods.updateStats = function(hours, peopleHelped) {
  this.stats.totalHours += hours || 0;
  this.stats.totalEvents += 1;
  this.stats.peopleHelped += peopleHelped || 0;
  return this.save();
};

// ── Indexes ────────────────────────────────────────────────────────────────
// email is declared unique above, Mongoose creates a unique index automatically.
// Compound (role, isActive) — most common filter in admin user queries
userSchema.index({ role: 1, isActive: 1 });
// lastActive — used for daily-active-user stats and inactivity queries
userSchema.index({ lastActive: -1 });
// organizationVerificationStatus — admin verification queue
userSchema.index({ organizationVerificationStatus: 1 });
// Text index for admin search by name / email
userSchema.index({ name: 'text', email: 'text' });
// Sparse index on organizationName (only organizers have this field)
userSchema.index({ organizationName: 1 }, { sparse: true });
// createdAt — new-user-this-month analytics
userSchema.index({ createdAt: -1 });
// profile.city — geographically targeted emergency alerts
userSchema.index({ 'profile.city': 1 });

module.exports = mongoose.model('User', userSchema);
