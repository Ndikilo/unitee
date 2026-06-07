const express = require('express');
const Admin = require('../models/Admin');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const Community = require('../models/Community');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const router = express.Router();

// @desc    Create initial super admin (one-time setup)
// @route   POST /api/setup/admin
// @access  Public (protected by setup key)
router.post('/admin', async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'VOLUNTEER_ADMIN_SETUP_2024';

    if (setupKey !== SETUP_KEY) return res.status(403).json({ message: 'Invalid setup key' });
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({
      name, email, password,
      adminRole: 'super_admin',
      permissions: Admin.ROLE_PERMISSIONS.super_admin,
      status: 'active',
      createdBy: null,
    });
    // Trigger pre-save to hash password and set permissions
    await admin.save();

    res.status(201).json({ message: 'Super admin created', admin: { id: admin._id, name, email, adminRole: 'super_admin' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Check if any admin exists
// @route   GET /api/setup/admin-exists
// @access  Public
router.get('/admin-exists', async (req, res) => {
  try {
    const exists = await Admin.findOne({});
    res.json({ adminExists: !!exists });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Public platform stats (home page — no auth)
// @route   GET /api/setup/public-stats
// @access  Public
router.get('/public-stats', async (req, res) => {
  try {
    const [
      totalVolunteers, totalOrgs, totalCommunities, totalOpportunities, totalHoursVol,
      userVolunteers, userOrgs, userHours,
    ] = await Promise.all([
      Volunteer.countDocuments({ isActive: true }),
      Organization.countDocuments({ isActive: true }),
      Community.countDocuments({ isActive: true }),
      Opportunity.countDocuments({ status: 'published' }),
      Volunteer.aggregate([{ $group: { _id: null, total: { $sum: '$stats.totalHours' } } }]).then(r => r[0]?.total || 0),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'organizer', isActive: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$stats.totalHours' } } }]).then(r => r[0]?.total || 0),
    ]);

    // Prefer User collection (primary auth) over dedicated collections
    const resolvedVols = userVolunteers || totalVolunteers;
    const resolvedOrgs = userOrgs || totalOrgs;

    res.json({
      totalUsers: resolvedVols + resolvedOrgs,
      totalVolunteers: resolvedVols,
      totalOrganizations: resolvedOrgs,
      totalCommunities,
      totalOpportunities,
      totalVolunteerHours: userHours || totalHoursVol,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
