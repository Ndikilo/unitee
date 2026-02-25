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
      totalUsers,
      totalCommunities,
      totalOpportunities,
      totalApplications,
      pendingReports,
      pendingVerifications,
      activeEmergencies,
      dailyActiveUsers,
      totalHours
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Community.countDocuments({ isActive: true }),
      Opportunity.countDocuments({ status: 'published' }),
      User.aggregate([
        { $unwind: { path: '$applications', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]).then(result => result[0]?.count || 0),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ organizationVerificationStatus: 'pending' }),
      EmergencyAlert.countDocuments({ isActive: true }),
      User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.totalHours' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    // Calculate platform health metrics
    const uptime = 99.9; // This would typically come from monitoring service
    const avgResponse = 45; // This would typically come from monitoring service
    const errorRate = 0.1; // This would typically come from error tracking service

    res.json({
      totalUsers,
      totalCommunities,
      totalOpportunities,
      totalApplications,
      totalHours,
      activeUsers: dailyActiveUsers,
      pendingReports,
      pendingVerifications,
      activeEmergencies,
      uptime,
      avgResponse,
      dailyActive: dailyActiveUsers,
      errorRate
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await User.countDocuments(query);

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

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, isVerified },
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
    
    // Find target users
    let userQuery = { 
      isActive: true,
      'preferences.emergencyAlerts': true
    };
    
    if (targetCity) {
      userQuery['profile.city'] = new RegExp(targetCity, 'i');
    }
    
    const targetUsers = await User.find(userQuery).select('_id');
    
    // Create notifications for all target users
    const notifications = targetUsers.map(user => ({
      recipient: user._id,
      type: 'emergency',
      title,
      message,
      priority: severity,
      data: {
        alertId: alert._id,
        actionRequired: true
      }
    }));
    
    await Notification.insertMany(notifications);
    
    // Update alert stats
    alert.stats.totalSent = targetUsers.length;
    await alert.save();
    
    res.status(201).json({
      message: 'Emergency alert sent successfully',
      alert,
      recipientCount: targetUsers.length
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