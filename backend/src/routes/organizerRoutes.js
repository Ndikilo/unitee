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
  getProfile,
  getOpportunityVolunteers,
  markVolunteerAttended,
  bulkMarkAttended,
  bulkIssueCertificates,
  getImpactReport,
  generateImpactPdf,
} = require('../controllers/organizerController');

router.route('/stats').get(protect, authorize('organization'), getStats);
router.route('/impact-report/pdf').get(protect, authorize('organization'), generateImpactPdf);
router.route('/impact-report').get(protect, authorize('organization'), getImpactReport);
router.route('/opportunities').get(protect, authorize('organization'), getOpportunities);
router.route('/applications').get(protect, authorize('organization'), getApplications);
router.route('/applications/:id').patch(protect, authorize('organization'), updateApplicationStatus);
router.route('/opportunities/:id/status').patch(protect, authorize('organization'), updateOpportunityStatus);
router.route('/opportunities/:id/volunteers').get(protect, authorize('organization'), getOpportunityVolunteers);
router.route('/opportunities/:id/volunteers/:userId').patch(protect, authorize('organization'), markVolunteerAttended);
router.route('/opportunities/:id/bulk-attendance').post(protect, authorize('organization'), bulkMarkAttended);
router.route('/opportunities/:id/issue-certificates').post(protect, authorize('organization'), bulkIssueCertificates);
router.route('/ai-assist').post(protect, authorize('organization'), generateOpportunityContent);
router.route('/profile').get(protect, authorize('organization'), getProfile);

module.exports = router;