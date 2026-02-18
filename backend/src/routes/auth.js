const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, verifyEmail, forgotPassword, resetPassword, changePassword, googleSuccess, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleSuccess);
}

module.exports = router;
