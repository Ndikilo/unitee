const express = require('express');
const {
  generateCertificate,
  verifyCertificate,
  getUserCertificates,
  downloadCertificate,
  revokeCertificate,
  getCertificateStats
} = require('../controllers/certificateController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.use(protect);

router.post('/generate', authorize('organization', 'admin'), generateCertificate);
router.get('/user/:userId', getUserCertificates);
router.get('/download/:certificateId', downloadCertificate);
router.put('/revoke/:certificateId', authorize('organization', 'admin'), revokeCertificate);

// Admin only routes
router.get('/stats', authorize('admin'), getCertificateStats);

module.exports = router;