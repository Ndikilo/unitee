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

router.route('/stats').get(protect, authorize('organizer'), getStats);
router.route('/opportunities').get(protect, authorize('organizer'), getOpportunities);
router.route('/applications').get(protect, authorize('organizer'), getApplications);
router.route('/applications/:id').patch(protect, authorize('organizer'), updateApplicationStatus);
router.route('/opportunities/:id/status').patch(protect, authorize('organizer'), updateOpportunityStatus);
router.route('/ai-assist').post(protect, authorize('organizer'), generateOpportunityContent);
router.route('/profile').get(protect, authorize('organizer'), getProfile);

module.exports = router;