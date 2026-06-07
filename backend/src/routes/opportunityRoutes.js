const express = require('express');
const router = express.Router();
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  signUpOpportunity,
  cancelSignup,
  getUserOpportunities,
  addReview,
  getTestimonials,
  deleteOpportunity,
  logHours,
  getRecommended,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getOpportunities)
  .post(protect, createOpportunity);

router.get('/my-opportunities', protect, getUserOpportunities);
router.get('/recommended', protect, getRecommended);
router.get('/testimonials', getTestimonials);

router.route('/:id')
  .get(getOpportunity)
  .put(protect, updateOpportunity)
  .delete(protect, deleteOpportunity);

router.route('/:id/signup')
  .post(protect, signUpOpportunity)
  .delete(protect, cancelSignup);

router.post('/:id/review', protect, addReview);
router.post('/:id/log-hours', protect, logHours);

module.exports = router;
