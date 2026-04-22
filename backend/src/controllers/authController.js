const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const Admin = require('../models/Admin');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ to, subject, html });
  } catch (e) {
    console.log('Email failed:', e.message);
  }
};

const signToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '30d' });

const buildResponse = (doc, userType, token) => {
  if (userType === 'volunteer') {
    return {
      _id: doc._id, name: doc.name, email: doc.email,
      role: 'user', userType,
      isVerified: doc.verification?.isVerified || false,
      emailVerified: doc.verification?.emailVerified || false,
      profile: doc.profile,
      stats: doc.stats,
      preferences: doc.preferences,
      token,
    };
  }
  if (userType === 'organization') {
    return {
      _id: doc._id,
      name: doc.account.name, email: doc.account.email,
      role: 'organizer', userType,
      emailVerified: doc.account.emailVerified || false,
      organization: doc.organization,
      verification: doc.verification,
      stats: doc.stats,
      preferences: doc.preferences,
      token,
    };
  }
  if (userType === 'admin') {
    return {
      _id: doc._id, name: doc.name, email: doc.email,
      role: 'admin', userType,
      adminRole: doc.adminRole,
      permissions: doc.permissions,
      profile: doc.profile,
      token,
    };
  }
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role,
      organizationName, organizationDescription, organizationType,
      organizationWebsite, organizationPhone, organizationCity, organizationRegion,
    } = req.body;

    if (role === 'organizer') {
      const exists = await Organization.findOne({ 'account.email': email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      const org = await Organization.create({
        account: { name, email, password },
        organization: {
          name: organizationName || name,
          description: organizationDescription,
          type: organizationType,
          website: organizationWebsite,
          phone: organizationPhone,
          city: organizationCity,
          region: organizationRegion,
        },
      });

      const verifyToken = org.generateEmailVerificationToken();
      await org.save({ validateBeforeSave: false });

      await sendEmail(email, 'Verify Your Email — UNITEE',
        `<h2>Welcome to UNITEE!</h2><p>Click to verify: <a href="${process.env.FRONTEND_URL}/verify-email/${verifyToken}">Verify Email</a></p>`
      );

      const token = signToken(org._id, 'organization');
      return res.status(201).json(buildResponse(org, 'organization', token));
    }

    // Default: volunteer
    const exists = await Volunteer.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const vol = await Volunteer.create({ name, email, password });
    const verifyToken = vol.generateEmailVerificationToken();
    await vol.save({ validateBeforeSave: false });

    await sendEmail(email, 'Verify Your Email — UNITEE',
      `<h2>Welcome to UNITEE!</h2><p>Click to verify: <a href="${process.env.FRONTEND_URL}/verify-email/${verifyToken}">Verify Email</a></p>`
    );

    const token = signToken(vol._id, 'volunteer');
    return res.status(201).json(buildResponse(vol, 'volunteer', token));

  } catch (err) {
    console.error('Register error:', err.message);
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try admin first
    let admin = await Admin.findOne({ email }).select('+password');
    if (admin) {
      if (admin.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });
      const match = await admin.matchPassword(password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      await admin.updateLastActive();
      const token = signToken(admin._id, 'admin');
      return res.json(buildResponse(admin, 'admin', token));
    }

    // Try organization
    let org = await Organization.findOne({ 'account.email': email }).select('+account.password');
    if (org) {
      if (!org.isActive) return res.status(403).json({ message: 'Account suspended' });
      const match = await org.matchPassword(password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      await org.updateLastActive();
      const token = signToken(org._id, 'organization');
      return res.json(buildResponse(org, 'organization', token));
    }

    // Try volunteer
    let vol = await Volunteer.findOne({ email }).select('+password');
    if (vol) {
      if (!vol.isActive) return res.status(403).json({ message: 'Account suspended' });
      const match = await vol.matchPassword(password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      await vol.updateLastActive();
      const token = signToken(vol._id, 'volunteer');
      return res.json(buildResponse(vol, 'volunteer', token));
    }

    return res.status(400).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const { user, userType } = req;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    const response = buildResponse(user, userType, null);
    if (!response) return res.status(500).json({ message: 'Failed to build user response' });
    // Remove null token from response
    delete response.token;
    res.json(response);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { userType, user } = req;

    if (userType === 'volunteer') {
      const { name, profile, preferences } = req.body;
      if (name) user.name = name;
      if (profile) user.profile = { ...user.profile.toObject?.() || user.profile, ...profile };
      if (preferences) user.preferences = { ...user.preferences.toObject?.() || user.preferences, ...preferences };
      await user.save();
      return res.json(buildResponse(user, 'volunteer', null));
    }

    if (userType === 'organization') {
      const { accountName, organization, preferences } = req.body;
      if (accountName) user.account.name = accountName;
      if (organization) user.organization = { ...user.organization.toObject?.() || user.organization, ...organization };
      if (preferences) user.preferences = { ...user.preferences.toObject?.() || user.preferences, ...preferences };
      await user.save();
      return res.json(buildResponse(user, 'organization', null));
    }

    if (userType === 'admin') {
      const { name, profile } = req.body;
      if (name) user.name = name;
      if (profile) user.profile = { ...user.profile?.toObject?.() || user.profile || {}, ...profile };
      await user.save();
      return res.json(buildResponse(user, 'admin', null));
    }

    res.status(400).json({ message: 'Unknown user type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

    let user = await Volunteer.findOne({ 'verification.emailVerificationToken': hashed });
    if (user) {
      user.verification.emailVerified = true;
      user.verification.emailVerificationToken = undefined;
      await user.save();
      return res.json({ message: 'Email verified' });
    }

    user = await Organization.findOne({ 'account.emailVerificationToken': hashed });
    if (user) {
      user.account.emailVerified = true;
      user.account.emailVerificationToken = undefined;
      await user.save();
      return res.json({ message: 'Email verified' });
    }

    res.status(400).json({ message: 'Invalid or expired token' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Admin.findOne({ email });
    let userType = 'admin';
    if (!user) { user = await Organization.findOne({ 'account.email': email }); userType = 'organization'; }
    if (!user) { user = await Volunteer.findOne({ email }); userType = 'volunteer'; }
    if (!user) return res.status(404).json({ message: 'No account with that email' });

    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await sendEmail(email, 'Password Reset — UNITEE',
      `<h2>Password Reset</h2><p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a></p><p>Expires in 10 minutes.</p>`
    );

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const now = Date.now();

    let user = await Admin.findOne({ 'verification.passwordResetToken': hashed, 'verification.passwordResetExpires': { $gt: now } }).select('+password');
    let userType = 'admin';
    if (!user) {
      user = await Organization.findOne({ 'account.passwordResetToken': hashed, 'account.passwordResetExpires': { $gt: now } }).select('+account.password');
      userType = 'organization';
    }
    if (!user) {
      user = await Volunteer.findOne({ 'verification.passwordResetToken': hashed, 'verification.passwordResetExpires': { $gt: now } }).select('+password');
      userType = 'volunteer';
    }
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    if (userType === 'organization') {
      user.account.password = req.body.password;
      user.account.passwordResetToken = undefined;
      user.account.passwordResetExpires = undefined;
    } else if (userType === 'admin') {
      user.password = req.body.password;
      user.verification.passwordResetToken = undefined;
      user.verification.passwordResetExpires = undefined;
    } else {
      user.password = req.body.password;
      user.verification.passwordResetToken = undefined;
      user.verification.passwordResetExpires = undefined;
    }

    await user.save();
    const token = signToken(user._id, userType);
    res.json(buildResponse(user, userType, token));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userType } = req;

    let user;
    if (userType === 'admin') {
      user = await Admin.findById(req.user._id).select('+password');
    } else if (userType === 'organization') {
      user = await Organization.findById(req.user._id).select('+account.password');
    } else {
      user = await Volunteer.findById(req.user._id).select('+password');
    }

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    if (userType === 'organization') {
      user.account.password = newPassword;
    } else {
      user.password = newPassword;
    }
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GOOGLE OAUTH SUCCESS ──────────────────────────────────────────────────────
exports.googleSuccess = async (req, res) => {
  if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  const { doc, userType } = req.user;
  const token = signToken(doc._id, userType);
  const userData = buildResponse(doc, userType, null);
  res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
};

exports.logout = (req, res) => res.json({ message: 'Logged out' });
