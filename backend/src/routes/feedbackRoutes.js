const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Anyone (logged in or not) can submit feedback
router.post('/', protect, submitFeedback);
router.post('/anonymous', submitFeedback); // No auth required for anonymous

// Admin only
router.get('/', protect, authorize('admin'), getFeedback);
router.patch('/:id', protect, authorize('admin'), updateFeedbackStatus);

module.exports = router;
