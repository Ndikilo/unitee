const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getOpportunities,
  getApplications,
  updateApplicationStatus,
  updateOpportunityStatus,
  generateOpportunityContent,
  getProfile
} = require('../controllers/organizerController');

router.route('/stats').get(protect, authorize('organization'), getStats);
router.route('/opportunities').get(protect, authorize('organization'), getOpportunities);
router.route('/applications').get(protect, authorize('organization'), getApplications);
router.route('/applications/:id').patch(protect, authorize('organization'), updateApplicationStatus);
router.route('/opportunities/:id/status').patch(protect, authorize('organization'), updateOpportunityStatus);
router.route('/ai-assist').post(protect, authorize('organization'), generateOpportunityContent);
router.route('/profile').get(protect, authorize('organization'), getProfile);

module.exports = router;