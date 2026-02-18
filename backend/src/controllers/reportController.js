const Report = require('../models/Report');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { type, targetId, targetModel, reason, description } = req.body;
    
    // Check if user already reported this item
    const existingReport = await Report.findOne({
      reportedBy: req.user.id,
      targetId,
      targetModel
    });
    
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this item' });
    }
    
    const report = await Report.create({
      type,
      targetId,
      targetModel,
      reason,
      description,
      reportedBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.id })
      .populate('targetId')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;