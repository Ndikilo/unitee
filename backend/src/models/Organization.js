const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const organizationSchema = new mongoose.Schema({
  // Login account (the contact person)
  account: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
  },

  // Organization details
  organization: {
    name: { type: String, required: true, trim: true },
    description: String,
    website: String,
    type: {
      type: String,
      enum: ['NGO / Non-profit', 'Community Based Org', 'Government Agency', 'School / University', 'Religious Organization', 'Other'],
    },
    phone: String,
    city: String,
    region: String,
    logo: String,   // base64 or URL
    banner: String, // base64 or URL
  },

  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: Date,
    rejectionReason: String,
  },

  stats: {
    eventsCreated: { type: Number, default: 0 },
    volunteersEngaged: { type: Number, default: 0 },
    certificatesIssued: { type: Number, default: 0 },
  },

  preferences: {
    emailNotifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },

  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
organizationSchema.pre('save', async function (next) {
  if (!this.isModified('account.password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.account.password = await bcrypt.hash(this.account.password, salt);
  next();
});

organizationSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.account.password);
};

organizationSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.account.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

organizationSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.account.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.account.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

organizationSchema.methods.updateLastActive = async function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Virtual: expose email at top level for convenience
organizationSchema.virtual('email').get(function () { return this.account.email; });
organizationSchema.virtual('name').get(function () { return this.account.name; });

module.exports = mongoose.model('Organization', organizationSchema);
