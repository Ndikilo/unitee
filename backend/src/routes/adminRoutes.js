const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getReports,
  updateReport,
  getVerificationQueue,
  updateVerificationStatus,
  createEmergencyAlert,
  getEmergencyAlerts,
  deactivateEmergencyAlert,
  getAnalytics,
  getRecentActivity
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Apply admin protection to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/recent-activity', getRecentActivity);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// Reports
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);

// Verifications
router.get('/verifications', getVerificationQueue);
router.put('/verifications/:id', updateVerificationStatus);

// Emergency alerts
router.route('/emergency-alerts')
  .get(getEmergencyAlerts)
  .post(createEmergencyAlert);

router.put('/emergency-alerts/:id/deactivate', deactivateEmergencyAlert);

module.exports = router;