const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSystemHealth,
  getUsers,
  updateUserStatus,
  deleteUser,
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
const {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  toggleBadge,
  getBadgeStats,
  duplicateBadge
} = require('../controllers/badgeController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

// All admin routes require auth + admin userType
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/recent-activity', getRecentActivity);
router.get('/system-health', getSystemHealth);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

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

// Badge management
router.route('/badges')
  .get(getAllBadges)
  .post(createBadge);

router.route('/badges/:id')
  .put(updateBadge)
  .delete(deleteBadge);

router.patch('/badges/:id/toggle', toggleBadge);
router.get('/badges/:id/stats', getBadgeStats);
router.post('/badges/:id/duplicate', duplicateBadge);

module.exports = router;