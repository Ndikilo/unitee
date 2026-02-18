const Opportunity = require('../models/Opportunity');
const Community = require('../models/Community');
const User = require('../models/User');

// @desc    Create an opportunity
// @route   POST /api/opportunities
// @access  Private
exports.createOpportunity = async (req, res) => {
  try {
    const { 
      title, description, category, location, dateTime, requirements, 
      capacity, community, contactInfo, impact, tags, isEmergency 
    } = req.body;

    // Check if community exists and user is a member
    const communityExists = await Community.findOne({
      _id: community,
      $or: [
        { createdBy: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (!communityExists) {
      return res.status(403).json({ 
        message: 'Not authorized to create opportunities in this community' 
      });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      category,
      location,
      dateTime: {
        start: dateTime.start,
        end: dateTime.end,
        duration: dateTime.duration
      },
      requirements,
      capacity: {
        required: capacity.required || capacity
      },
      community,
      contactInfo,
      impact,
      tags,
      isEmergency,
      createdBy: req.user.id
    });

    await opportunity.populate([
      { path: 'community', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json(opportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    const { 
      category, city, community, date, search, status, 
      isEmergency, page = 1, limit = 10, sortBy = 'createdAt' 
    } = req.query;
    
    let query = { status: { $in: ['published', 'draft'] } };
    
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (community) query.community = community;
    if (status) query.status = status;
    if (isEmergency) query.isEmergency = isEmergency === 'true';
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query['dateTime.start'] = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const opportunities = await Opportunity.find(query)
      .populate('community', 'name location')
      .populate('volunteers.user', 'name email profile.avatar')
      .populate('createdBy', 'name organizationName')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Opportunity.countDocuments(query);

    res.json({
      opportunities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('community', 'name description location')
      .populate('volunteers.user', 'name email profile')
      .populate('waitlist.user', 'name email profile')
      .populate('createdBy', 'name email organizationName')
      .populate('feedback.reviews.user', 'name profile.avatar');
      
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Increment view count
    await opportunity.incrementViews();
    
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check authorization
    if (opportunity.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this opportunity' });
    }
    
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'community', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ]);
    
    res.json(updatedOpportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sign up for an opportunity
// @route   POST /api/opportunities/:id/signup
// @access  Private
exports.signUpOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    if (opportunity.status !== 'published') {
      return res.status(400).json({ message: 'Opportunity is not available for signup' });
    }

    // Check if already signed up
    if (opportunity.isUserRegistered(req.user.id)) {
      return res.status(400).json({ message: 'Already signed up for this opportunity' });
    }

    await opportunity.addVolunteer(req.user.id);
    
    const isOnWaitlist = opportunity.waitlist.some(w => w.user.toString() === req.user.id);
    
    res.json({ 
      message: isOnWaitlist ? 'Added to waitlist' : 'Successfully signed up for the opportunity',
      spotsLeft: opportunity.getAvailableSpots(),
      isOnWaitlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel signup for opportunity
// @route   DELETE /api/opportunities/:id/signup
// @access  Private
exports.cancelSignup = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (!opportunity.isUserRegistered(req.user.id)) {
      return res.status(400).json({ message: 'Not signed up for this opportunity' });
    }

    await opportunity.removeVolunteer(req.user.id);
    
    res.json({ 
      message: 'Successfully cancelled signup',
      spotsLeft: opportunity.getAvailableSpots()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's opportunities
// @route   GET /api/opportunities/my-opportunities
// @access  Private
exports.getUserOpportunities = async (req, res) => {
  try {
    const { type = 'registered' } = req.query;
    
    let query = {};
    
    if (type === 'created') {
      query.createdBy = req.user.id;
    } else {
      query.$or = [
        { 'volunteers.user': req.user.id },
        { 'waitlist.user': req.user.id }
      ];
    }
    
    const opportunities = await Opportunity.find(query)
      .populate('community', 'name')
      .populate('createdBy', 'name organizationName')
      .sort({ 'dateTime.start': 1 });
    
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add review to opportunity
// @route   POST /api/opportunities/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check if user participated
    const participated = opportunity.volunteers.some(
      v => v.user.toString() === req.user.id && v.status === 'attended'
    );
    
    if (!participated) {
      return res.status(403).json({ message: 'Can only review opportunities you attended' });
    }

    await opportunity.addReview(req.user.id, rating, comment);
    
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get testimonials for home page
// @route   GET /api/opportunities/testimonials
// @access  Public
exports.getTestimonials = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Find opportunities with reviews, populate user data, and get the best reviews
    const opportunities = await Opportunity.find({
      'feedback.reviews.0': { $exists: true },
      'feedback.rating': { $gte: 4 }
    })
    .populate('feedback.reviews.user', 'name profile.avatar profile.city role organizationName')
    .populate('createdBy', 'organizationName')
    .sort({ 'feedback.rating': -1 })
    .limit(50); // Get more opportunities to have variety in reviews

    // Extract and flatten all reviews
    const allReviews = [];
    opportunities.forEach(opportunity => {
      opportunity.feedback.reviews.forEach(review => {
        if (review.rating >= 4 && review.comment && review.comment.length > 20) {
          allReviews.push({
            id: review._id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            user: {
              name: review.user.name,
              avatar: review.user.profile?.avatar,
              city: review.user.profile?.city,
              role: review.user.role === 'organizer' ? 'NGO Director' : 'Volunteer',
              organization: review.user.organizationName
            },
            opportunity: {
              title: opportunity.title,
              organizer: opportunity.createdBy?.organizationName
            }
          });
        }
      });
    });

    // Sort by rating and date, then limit
    const testimonials = allReviews
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, parseInt(limit));

    res.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check authorization
    if (opportunity.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
    }
    
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
