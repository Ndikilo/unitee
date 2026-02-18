const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get organizer stats
// @route     GET /api/organizer/stats
// @access    Private (Organizer only)
exports.getStats = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const organizerId = req.user._id;

  // Get active opportunities count
  const activeOpportunities = await Opportunity.countDocuments({
    createdBy: organizerId,
    status: { $in: ['published'] }
  });

  // Get total applicants count
  const totalApplicants = await Application.countDocuments({
    opportunity: {
      $in: await Opportunity.find({ createdBy: organizerId }).select('_id')
    }
  });

  // Get total views count
  const opportunities = await Opportunity.find({ createdBy: organizerId });
  const totalViews = opportunities.reduce((sum, opp) => sum + opp.views, 0);

  // Get completed events count
  const completedEvents = await Opportunity.countDocuments({
    createdBy: organizerId,
    status: 'completed'
  });

  res.status(200).json({
    success: true,
    data: {
      activeOpportunities,
      totalApplicants,
      totalViews,
      completedEvents
    }
  });
});

// @desc      Get organizer opportunities
// @route     GET /api/organizer/opportunities
// @access    Private (Organizer only)
exports.getOpportunities = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.query;
  const query = { createdBy: req.user._id };

  if (status) {
    query.status = status;
  }

  const opportunities = await Opportunity.find(query).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities
  });
});

// @desc      Get applications for organizer's opportunities
// @route     GET /api/organizer/applications
// @access    Private (Organizer only)
exports.getApplications = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status, opportunityId } = req.query;
  
  // Find opportunities created by this organizer
  const opportunities = await Opportunity.find({ createdBy: req.user._id });
  const opportunityIds = opportunities.map(opp => opp._id);

  const query = { opportunity: { $in: opportunityIds } };

  if (status) {
    query.status = status;
  }

  if (opportunityId) {
    query.opportunity = opportunityId;
  }

  const applications = await Application.find(query)
    .populate('volunteer', 'name email profile.skills')
    .populate('opportunity', 'title description');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc      Update application status
// @route     PATCH /api/organizer/applications/:id
// @access    Private (Organizer only)
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status. Must be accepted or rejected.', 400));
  }

  // Find the application
  let application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check if the opportunity belongs to this organizer
  const opportunity = await Opportunity.findById(application.opportunity);
  if (!opportunity || opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this application', 403));
  }

  // Update the application status
  application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  ).populate('volunteer', 'name email profile.skills')
    .populate('opportunity', 'title description');

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc      Update opportunity status
// @route     PATCH /api/organizer/opportunities/:id/status
// @access    Private (Organizer only)
exports.updateOpportunityStatus = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.body;

  if (!['draft', 'published', 'cancelled', 'completed', 'archived'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  // Find the opportunity
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(new ErrorResponse('Opportunity not found', 404));
  }

  // Check if the opportunity belongs to this organizer
  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this opportunity', 403));
  }

  // Update the opportunity status
  opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: opportunity
  });
});

// @desc      Generate opportunity content with AI
// @route     POST /api/organizer/ai-assist
// @access    Private (Organizer only)
exports.generateOpportunityContent = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { title, goal, location, category } = req.body;

  // Validate required fields
  if (!title || !goal || !location) {
    return next(new ErrorResponse('Title, goal, and location are required', 400));
  }

  // Mock AI response - in a real implementation, this would call an AI service
  const aiResponse = {
    description: `Join us for this meaningful opportunity to ${goal}. We're looking for passionate volunteers to make a difference in ${location}. This ${category} initiative aims to create positive change in our community.`,
    suggestedSkills: ['Communication', 'Teamwork', 'Leadership', 'Problem-solving'],
    suggestedVolunteers: Math.floor(Math.random() * 10) + 5, // Random number between 5-15
    suggestedHours: Math.floor(Math.random() * 8) + 2, // Random number between 2-10
  };

  res.status(200).json({
    success: true,
    data: aiResponse
  });
});

// @desc      Get organizer profile
// @route     GET /api/organizer/profile
// @access    Private (Organizer only)
exports.getProfile = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const organizer = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    success: true,
    data: organizer
  });
});