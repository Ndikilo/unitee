const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const AdminModel = require('../models/Admin');
const User = require('../models/User');
const Community = require('../models/Community');
const Opportunity = require('../models/Opportunity');
const Report = require('../models/Report');
const EmergencyAlert = require('../models/EmergencyAlert');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalVolunteers,
      totalOrganizations,
      totalCommunities,
      totalOpportunities,
      pendingReports,
      pendingVerifications,
      activeEmergencies,
      dailyActiveVolunteers,
      totalHours,
      userVolunteers,
      userOrganizers,
      userActiveToday,
      userTotalHours
    ] = await Promise.all([
      Volunteer.countDocuments({ isActive: true }),
      Organization.countDocuments({ isActive: true }),
      Community.countDocuments({ isActive: true }),
      Opportunity.countDocuments({ status: 'published' }),
      Report.countDocuments({ status: 'pending' }),
      Organization.countDocuments({ 'verification.status': 'pending' }),
      EmergencyAlert.countDocuments({ isActive: true }),
      Volunteer.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Volunteer.aggregate([{ $group: { _id: null, total: { $sum: '$stats.totalHours' } } }]).then(r => r[0]?.total || 0),
      // User collection counts (primary auth system)
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'organizer', isActive: true }),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$stats.totalHours' } } }]).then(r => r[0]?.total || 0),
    ]);

    // Prefer User collection counts (primary auth); fall back to Volunteer/Org collections
    const resolvedVolunteers = userVolunteers || totalVolunteers;
    const resolvedOrgs = userOrganizers || totalOrganizations;
    const resolvedActive = userActiveToday || dailyActiveVolunteers;
    const resolvedHours = userTotalHours || totalHours;

    res.json({
      totalUsers: resolvedVolunteers + resolvedOrgs,
      totalVolunteers: resolvedVolunteers,
      totalOrganizations: resolvedOrgs,
      totalCommunities,
      totalOpportunities,
      totalHours: resolvedHours,
      activeUsers: resolvedActive,
      pendingReports,
      pendingVerifications,
      activeEmergencies,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (paginated at DB level)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const pageNum  = Math.max(1, parseInt(req.query.page)  || 1);
    const limitNum = Math.min(100, parseInt(req.query.limit) || 10); // cap at 100
    const { search, role, status } = req.query;
    const skip = (pageNum - 1) * limitNum;

    // Build query for primary User collection
    const query = {};
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active')    query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    if (role === 'user')       query.role = 'user';
    else if (role === 'organizer') query.role = 'organizer';
    else if (role === 'admin') query.role = 'admin';

    // Paginate at DB level — never load full collection into memory
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    const normalized = users.map(u => ({ ...u, displayName: u.name, displayEmail: u.email }));

    res.json({
      users: normalized,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status (suspend/activate/verify)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, isVerified, verificationStatus } = req.body;
    const { id } = req.params;

    // Primary: User collection (where all auth registrations live)
    const userDoc = await User.findById(id);
    if (userDoc) {
      if (isActive !== undefined) userDoc.isActive = isActive;
      if (isVerified !== undefined) userDoc.isVerified = isVerified;
      if (verificationStatus) userDoc.organizationVerificationStatus = verificationStatus;
      await userDoc.save();
      return res.json({ message: 'Updated', user: userDoc.toObject() });
    }

    // Fallback: legacy Volunteer collection
    const vol = await Volunteer.findById(id);
    if (vol) {
      if (isActive !== undefined) vol.isActive = isActive;
      if (isVerified !== undefined && vol.verification) vol.verification.isVerified = isVerified;
      await vol.save();
      return res.json({ message: 'Updated', user: vol });
    }

    // Fallback: legacy Organization collection
    const org = await Organization.findById(id);
    if (org) {
      if (isActive !== undefined) org.isActive = isActive;
      if (verificationStatus && org.verification) org.verification.status = verificationStatus;
      await org.save();
      return res.json({ message: 'Updated', user: org });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user (hard delete from all collections)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    const requesterId = (req.user._id ?? req.user.id)?.toString();
    if (requesterId === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete from User collection (primary)
    const deleted = await User.findByIdAndDelete(id);

    // Also clean up from legacy collections in case they exist
    await Promise.allSettled([
      Volunteer.findByIdAndDelete(id),
      Organization.findByIdAndDelete(id),
    ]);

    if (!deleted) {
      // May have only existed in a legacy collection — still success
      return res.json({ message: 'User deleted successfully' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
exports.updateReport = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('reportedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get verification queue
// @route   GET /api/admin/verifications
// @access  Private/Admin
exports.getVerificationQueue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({
      organizationVerificationStatus: 'pending',
      organizationName: { $exists: true }
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await User.countDocuments({
      organizationVerificationStatus: 'pending',
      organizationName: { $exists: true }
    });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update verification status
// @route   PUT /api/admin/verifications/:id
// @access  Private/Admin
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        organizationVerificationStatus: status,
        isVerified: status === 'verified'
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create emergency alert
// @route   POST /api/admin/emergency-alert
// @access  Private/Admin
exports.createEmergencyAlert = async (req, res) => {
  try {
    const { title, message, severity, targetCity } = req.body;
    
    // Create alert
    const alert = await EmergencyAlert.create({
      title,
      message,
      severity,
      targetLocation: {
        city: targetCity,
        country: 'Cameroon'
      },
      createdBy: req.user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    // Find target users and fan-out in batches to avoid memory pressure at scale
    const userQuery = { isActive: true, 'preferences.emergencyAlerts': true };
    if (targetCity) userQuery['profile.city'] = new RegExp(targetCity, 'i');

    const BATCH_SIZE = 500;
    let totalSent = 0;
    let cursor = User.find(userQuery).select('_id').lean().cursor();
    let batch = [];

    for await (const user of cursor) {
      batch.push({
        recipient: user._id,
        type: 'emergency',
        title,
        message,
        priority: severity,
        data: { alertId: alert._id, actionRequired: true },
      });
      if (batch.length >= BATCH_SIZE) {
        await Notification.insertMany(batch, { ordered: false });
        totalSent += batch.length;
        batch = [];
      }
    }
    if (batch.length) {
      await Notification.insertMany(batch, { ordered: false });
      totalSent += batch.length;
    }

    // Update alert stats
    alert.stats.totalSent = totalSent;
    await alert.save();
    
    res.status(201).json({
      message: 'Emergency alert sent successfully',
      alert,
      recipientCount: totalSent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get emergency alerts
// @route   GET /api/admin/emergency-alerts
// @access  Private/Admin
exports.getEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate emergency alert
// @route   PUT /api/admin/emergency-alerts/:id/deactivate
// @access  Private/Admin
exports.deactivateEmergencyAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent admin activity
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get recent activities from different sources
    const [recentVerifications, recentReports, recentAlerts] = await Promise.all([
      User.find({ 
        organizationVerificationStatus: { $in: ['verified', 'rejected'] },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .select('organizationName organizationVerificationStatus updatedAt')
      .sort({ updatedAt: -1 })
      .limit(3),
      
      Report.find({ 
        status: { $in: ['resolved', 'dismissed'] },
        reviewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .select('type reason status reviewedAt')
      .sort({ reviewedAt: -1 })
      .limit(3),
      
      EmergencyAlert.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .select('title severity createdAt')
      .sort({ createdAt: -1 })
      .limit(2)
    ]);

    // Format activities
    const activities = [];
    
    recentVerifications.forEach(verification => {
      activities.push({
        type: 'verification',
        description: `NGO ${verification.organizationVerificationStatus}: ${verification.organizationName}`,
        timestamp: verification.updatedAt
      });
    });
    
    recentReports.forEach(report => {
      activities.push({
        type: 'report',
        description: `Report ${report.status}: ${report.reason}`,
        timestamp: report.reviewedAt
      });
    });
    
    recentAlerts.forEach(alert => {
      activities.push({
        type: 'emergency',
        description: `Emergency Alert: ${alert.title}`,
        timestamp: alert.createdAt
      });
    });
    
    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      activities: activities.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get real-time system health metrics
// @route   GET /api/admin/system-health
// @access  Private/Admin
exports.getSystemHealth = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const uptimeSeconds = process.uptime();
    const mem = process.memoryUsage();
    const heapUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMB       = Math.round(mem.rss       / 1024 / 1024);
    const memPercent  = Math.round((mem.heapUsed / mem.heapTotal) * 100);

    const activeUsers24h = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    let dbStats = null;
    try {
      dbStats = await mongoose.connection.db.stats();
    } catch (_) {}

    res.json({
      uptimeSeconds,
      serverStartTime: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        heapPercent: memPercent
      },
      database: dbStats ? {
        collections: dbStats.collections,
        dataSizeMB: Math.round(dbStats.dataSize / 1024 / 1024 * 10) / 10,
        storageSizeMB: Math.round(dbStats.storageSize / 1024 / 1024 * 10) / 10,
        objects: dbStats.objects
      } : null,
      activeUsers24h,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      newUsersThisMonth,
      newCommunitiesThisMonth,
      newOpportunitiesThisMonth,
      totalVolunteerHours
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Community.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Opportunity.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.totalHours' } } }
      ])
    ]);
    
    res.json({
      newUsersThisMonth,
      newCommunitiesThisMonth,
      newOpportunitiesThisMonth,
      totalVolunteerHours: totalVolunteerHours[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};