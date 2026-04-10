const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Available permissions
const PERMISSIONS = [
  'manage_admins',      // create/edit/delete other admins
  'delete_users',       // delete volunteer or org accounts
  'verify_organizations', // approve/reject org verification
  'suspend_users',      // suspend/activate accounts
  'view_all_data',      // view all platform data
  'manage_content',     // manage opportunities, communities
  'manage_badges',      // create/edit/delete badges
  'create_alerts',      // create emergency alerts
  'handle_reports',     // review and resolve reports
  'view_analytics',     // access analytics dashboard
  'issue_certificates', // issue/revoke certificates
];

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },

  adminRole: {
    type: String,
    enum: ['super_admin', 'moderator', 'verifier', 'support'],
    default: 'moderator',
  },

  // Explicit permission list — populated based on adminRole or customized
  permissions: {
    type: [String],
    enum: PERMISSIONS,
    default: [],
  },

  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },

  profile: {
    avatar: String,
    phone: String,
  },

  // Who created this admin (null for the first super admin)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },

  verification: {
    passwordResetToken: String,
    passwordResetExpires: Date,
  },

  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Default permissions per role
const ROLE_PERMISSIONS = {
  super_admin: PERMISSIONS, // all permissions
  moderator: ['view_all_data', 'suspend_users', 'manage_content', 'handle_reports', 'view_analytics'],
  verifier: ['view_all_data', 'verify_organizations', 'view_analytics'],
  support: ['view_all_data', 'view_analytics'],
};

// Auto-assign permissions when adminRole is set
adminSchema.pre('save', async function (next) {
  // Hash password
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // Set default permissions if not customized
  if (this.isModified('adminRole') && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ROLE_PERMISSIONS[this.adminRole] || [];
  }
  next();
});

adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

adminSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

adminSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.verification.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verification.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

adminSchema.methods.updateLastActive = async function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Admin', adminSchema);
module.exports.PERMISSIONS = PERMISSIONS;
module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
