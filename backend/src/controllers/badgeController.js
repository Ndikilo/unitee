const Badge = require('../models/Badge');
const User = require('../models/User');

// @desc    Get all badges (admin)
// @route   GET /api/admin/badges
// @access  Private/Admin
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ category: 1, tier: 1, createdAt: -1 });
    
    // Get stats for each badge
    const badgesWithStats = await Promise.all(badges.map(async (badge) => {
      const earnedCount = await User.countDocuments({
        'stats.badges.badgeId': badge._id
      });
      
      return {
        ...badge.toObject(),
        earnedCount
      };
    }));
    
    res.json(badgesWithStats);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new badge
// @route   POST /api/admin/badges
// @access  Private/Admin
const createBadge = async (req, res) => {
  try {
    const { name, description, icon, category, criteria, tier, points } = req.body;
    
    // Validate required fields
    if (!name || !description || !icon || !category || !criteria) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if badge with same name exists
    const existingBadge = await Badge.findOne({ name });
    if (existingBadge) {
      return res.status(400).json({ message: 'Badge with this name already exists' });
    }
    
    // Create badge
    const badge = await Badge.create({
      name,
      description,
      icon,
      category,
      criteria,
      tier: tier || 'bronze',
      points: points || 10,
      isActive: true
    });
    
    res.status(201).json(badge);
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update badge
// @route   PUT /api/admin/badges/:id
// @access  Private/Admin
const updateBadge = async (req, res) => {
  try {
    const { name, description, icon, category, criteria, tier, points, isActive } = req.body;
    
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Check if new name conflicts with existing badge
    if (name && name !== badge.name) {
      const existingBadge = await Badge.findOne({ name, _id: { $ne: req.params.id } });
      if (existingBadge) {
        return res.status(400).json({ message: 'Badge with this name already exists' });
      }
    }
    
    // Update fields
    if (name) badge.name = name;
    if (description) badge.description = description;
    if (icon) badge.icon = icon;
    if (category) badge.category = category;
    if (criteria) badge.criteria = criteria;
    if (tier) badge.tier = tier;
    if (points !== undefined) badge.points = points;
    if (isActive !== undefined) badge.isActive = isActive;
    
    await badge.save();
    
    res.json(badge);
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete badge
// @route   DELETE /api/admin/badges/:id
// @access  Private/Admin
const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Check if any users have earned this badge
    const usersWithBadge = await User.countDocuments({
      'stats.badges.badgeId': badge._id
    });
    
    if (usersWithBadge > 0) {
      return res.status(400).json({ 
        message: `Cannot delete badge. ${usersWithBadge} user(s) have earned it. Consider deactivating instead.` 
      });
    }
    
    await badge.deleteOne();
    
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle badge active status
// @route   PATCH /api/admin/badges/:id/toggle
// @access  Private/Admin
const toggleBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    badge.isActive = !badge.isActive;
    await badge.save();
    
    res.json(badge);
  } catch (error) {
    console.error('Toggle badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get badge statistics
// @route   GET /api/admin/badges/:id/stats
// @access  Private/Admin
const getBadgeStats = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Get users who earned this badge
    const usersWithBadge = await User.find({
      'stats.badges.badgeId': badge._id
    }).select('name email stats.badges');
    
    // Calculate stats
    const earnedCount = usersWithBadge.length;
    const recentEarners = usersWithBadge
      .map(user => {
        const badgeData = user.stats.badges.find(b => b.badgeId.toString() === badge._id.toString());
        return {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          earnedAt: badgeData?.earnedAt
        };
      })
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 10);
    
    res.json({
      badge,
      earnedCount,
      recentEarners
    });
  } catch (error) {
    console.error('Get badge stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate badge
// @route   POST /api/admin/badges/:id/duplicate
// @access  Private/Admin
const duplicateBadge = async (req, res) => {
  try {
    const originalBadge = await Badge.findById(req.params.id);
    if (!originalBadge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Create new badge with "Copy" suffix
    const newBadge = await Badge.create({
      name: `${originalBadge.name} (Copy)`,
      description: originalBadge.description,
      icon: originalBadge.icon,
      category: originalBadge.category,
      criteria: originalBadge.criteria,
      tier: originalBadge.tier,
      points: originalBadge.points,
      isActive: false // Start as inactive
    });
    
    res.status(201).json(newBadge);
  } catch (error) {
    console.error('Duplicate badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  toggleBadge,
  getBadgeStats,
  duplicateBadge
};
