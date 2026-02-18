const express = require('express');
const router = express.Router();
const { createReport, getUserReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createReport);
router.get('/my-reports', getUserReports);

module.exports = router;