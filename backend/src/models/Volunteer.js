const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const volunteerSchema = new mongoose.Schema({
  googleId: String,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },

  verification: {
    emailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },

  profile: {
    avatar: String,
    phone: String,
    city: String,
    country: { type: String, default: 'Cameroon' },
    bio: String,
    skills: [String],
    interests: [String],
    dateOfBirth: Date,
  },

  stats: {
    totalHours: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    peopleHelped: { type: Number, default: 0 },
    badges: [{
      badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
      name: String,
      icon: String,
      description: String,
      earnedAt: { type: Date, default: Date.now },
    }],
  },

  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emergencyAlerts: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },

  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
volunteerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

volunteerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

volunteerSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.verification.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

volunteerSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.verification.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verification.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

volunteerSchema.methods.updateLastActive = async function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Volunteer', volunteerSchema);
