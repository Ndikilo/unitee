const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserBadgeProgress, checkAndAwardBadges } = require('../utils/badgeSystem');
const Badge = require('../models/Badge');

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ category: 1, tier: 1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's badges and progress
// @route   GET /api/badges/my-badges
// @access  Private
router.get('/my-badges', protect, async (req, res) => {
  try {
    const badgeData = await getUserBadgeProgress(req.user.id);
    res.json(badgeData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Check and award new badges
// @route   POST /api/badges/check
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const newBadges = await checkAndAwardBadges(req.user.id);
    res.json({
      message: newBadges.length > 0 ? 'New badges earned!' : 'No new badges',
      badges: newBadges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
