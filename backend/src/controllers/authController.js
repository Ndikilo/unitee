const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('../config/passport');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Branded email templates ──────────────────────────────────────────────────

const emailBase = (content) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#2563eb 0%,#059669 100%);padding:28px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">UNITEE</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Volunteer Community Action</p>
    </div>
    <div style="padding:36px 40px;">${content}</div>
    <div style="background:#f8fafc;padding:18px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">© 2024 UNITEE · Empowering communities across Cameroon</p>
    </div>
  </div>
</body></html>`;

const buildVerificationEmail = (name, token) => emailBase(`
  <h2 style="color:#1e293b;font-size:20px;font-weight:700;margin:0 0 12px;">Verify your email address</h2>
  <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">Hi <strong>${name}</strong>, welcome to UNITEE!</p>
  <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">Click the button below to verify your email and activate your account.</p>
  <div style="text-align:center;margin:0 0 28px;">
    <a href="${process.env.FRONTEND_URL}/verify-email/${token}"
       style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;">
      Verify Email Address
    </a>
  </div>
  <p style="color:#94a3b8;font-size:13px;margin:0 0 6px;">This link expires in <strong>24 hours</strong>.</p>
  <p style="color:#94a3b8;font-size:13px;margin:0;">Didn't create an account? You can safely ignore this email.</p>`);

const buildPasswordResetEmail = (name, token) => emailBase(`
  <h2 style="color:#1e293b;font-size:20px;font-weight:700;margin:0 0 12px;">Reset your password</h2>
  <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
  <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">We received a request to reset your UNITEE password. Click the button below to create a new one.</p>
  <div style="text-align:center;margin:0 0 28px;">
    <a href="${process.env.FRONTEND_URL}/reset-password/${token}"
       style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;">
      Reset Password
    </a>
  </div>
  <p style="color:#94a3b8;font-size:13px;margin:0 0 6px;">This link expires in <strong>10 minutes</strong>.</p>
  <p style="color:#94a3b8;font-size:13px;margin:0;">If you didn't request a password reset, please ignore this email — your password won't change.</p>`);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organizationName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Normalise role: 'organizer' → stored as 'organizer', everything else → 'user'
    const assignedRole = (role === 'organizer' || role === 'organization') ? 'organizer' : 'user';

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      organizationName: assignedRole === 'organizer' ? organizationName : undefined
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await transporter.sendMail({
        from: `"UNITEE" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify your email – UNITEE',
        html: buildVerificationEmail(user.name, verificationToken),
      });
    } catch (emailError) {
      console.error('Verification email failed to send:', emailError.message);
    }

    // userType maps role to the value the frontend & protect middleware expect
    const userType = assignedRole === 'organizer' ? 'organization' : 'volunteer';

    const token = jwt.sign(
      { id: user._id, userType },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Google OAuth users don't have a password
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Please log in with Google.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Enforce email verification (admin accounts are pre-verified)
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        message: 'Please verify your email address before signing in.',
        emailNotVerified: true,
        email: user.email,
      });
    }

    // Update last active
    await user.updateLastActive();

    // userType drives dashboard routing & protect middleware
    const userType = user.role === 'admin' ? 'admin'
      : user.role === 'organizer' ? 'organization'
      : 'volunteer';

    const token = jwt.sign(
      { id: user._id, userType },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      profile: user.profile,
      stats: user.stats,
      preferences: user.preferences,
      organizationName: user.organizationName,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is already resolved by protect middleware from the correct collection.
    // Re-fetch to get a fresh copy (protect may use a cached select).
    const fresh = await User.findById(req.user._id || req.user.id).select('-password');
    if (fresh) {
      const userType = fresh.role === 'admin' ? 'admin'
        : fresh.role === 'organizer' ? 'organization'
        : 'volunteer';
      return res.json({ ...fresh.toObject(), userType });
    }
    // User was registered via the newer Volunteer/Organization/Admin collections
    res.json({ ...req.user.toObject?.() ?? req.user, userType: req.userType });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name, profile, preferences, accountName,
      organizationName, organizationDescription,
      organizationPhone, organizationWebsite, organizationCity,
      organizationRegion, organizationType, organizationLogo, organizationBanner,
      organization, // legacy nested format
    } = req.body;

    let user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name || accountName)       user.name                  = name || accountName;
    if (profile)                   user.profile               = { ...user.profile.toObject?.() ?? user.profile, ...profile };
    if (preferences)               user.preferences           = { ...user.preferences.toObject?.() ?? user.preferences, ...preferences };
    if (organizationName)          user.organizationName      = organizationName;
    if (organizationDescription)   user.organizationDescription = organizationDescription;
    if (organizationType)          user.organizationType      = organizationType;
    if (organizationPhone)         user.organizationPhone     = organizationPhone;
    if (organizationWebsite)       user.organizationWebsite   = organizationWebsite;
    if (organizationCity)          user.organizationCity      = organizationCity;
    if (organizationRegion)        user.organizationRegion    = organizationRegion;
    if (organizationLogo)          user.organizationLogo      = organizationLogo;
    if (organizationBanner)        user.organizationBanner    = organizationBanner;

    // Legacy nested format support
    if (organization) {
      if (organization.name)        user.organizationName        = organization.name;
      if (organization.description) user.organizationDescription = organization.description;
      if (organization.website)     user.organizationWebsite     = organization.website;
      if (organization.type)        user.organizationType        = organization.type;
      if (organization.phone)       user.organizationPhone       = organization.phone;
      if (organization.city)        user.organizationCity        = organization.city;
      if (organization.region)      user.organizationRegion      = organization.region;
      if (organization.logo)        user.organizationLogo        = organization.logo;
      if (organization.banner)      user.organizationBanner      = organization.banner;
    }

    await user.save();

    // Check if skills were updated — trigger badge check for skills_added criterion
    const { checkAndAwardBadges } = require('../utils/badgeSystem');
    if (profile?.skills) checkAndAwardBadges(user._id).catch(() => {});

    const userType = user.role === 'admin' ? 'admin' : user.role === 'organizer' ? 'organization' : 'volunteer';
    return res.json({ ...user.toObject(), userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'This verification link is invalid or has expired. Please request a new one.',
        expired: true,
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });

    // Always return the same message to avoid revealing account existence
    const okMsg = { message: 'If that email is registered and unverified, a new verification link has been sent.' };

    if (!user) return res.json(okMsg);
    if (user.emailVerified) return res.status(400).json({ message: 'This email address is already verified.' });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    await transporter.sendMail({
      from: `"UNITEE" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify your email – UNITEE',
      html: buildVerificationEmail(user.name, verificationToken),
    });

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await transporter.sendMail({
        from: `"UNITEE" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset your password – UNITEE',
        html: buildPasswordResetEmail(user.name, resetToken),
      });

      res.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google OAuth success
// @route   GET /api/auth/google/success
// @access  Private
exports.googleSuccess = async (req, res) => {
  if (req.user) {
    const userType = req.user.role === 'admin' ? 'admin'
      : req.user.role === 'organizer' ? 'organization'
      : 'volunteer';
    const token = jwt.sign({ id: req.user._id, userType }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      userType,
      profile: req.user.profile
    }))}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
// @desc    Save onboarding preferences
// @route   PUT /api/auth/onboarding
// @access  Private
exports.saveOnboarding = async (req, res) => {
  try {
    const { purpose, interests, availability } = req.body;
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (purpose) user.profile.purpose = purpose;
    if (Array.isArray(interests)) user.profile.interests = interests;
    if (availability && typeof availability === 'object') {
      user.profile.availability = {
        weekends: !!availability.weekends,
        evenings: !!availability.evenings,
        fullTime: !!availability.fullTime,
        remote: !!availability.remote,
      };
    }
    user.onboardingCompleted = true;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Preferences saved', onboardingCompleted: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};