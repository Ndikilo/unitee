const Community = require('../models/Community');
const User = require('../models/User');

// @desc    Create a community
// @route   POST /api/communities
// @access  Private
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, category, location, contactEmail, website } = req.body;
    const community = await Community.create({
      name,
      description,
      category,
      location,
      contactEmail,
      website,
      createdBy: req.user.id
    });
    
    await community.populate('createdBy', 'name email');
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
exports.getCommunities = async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Community.countDocuments(query);
    
    res.json({
      communities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'name email profile')
      .populate('members.user', 'name email profile.avatar')
      .populate('admins', 'name email');
      
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private
exports.updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is admin
    if (!community.isAdmin(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this community' });
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    res.json(updatedCommunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a community
// @route   POST /api/communities/:id/join
// @access  Private
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if already a member
    if (community.isMember(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    // Check member limit
    if (community.members.length >= community.settings.maxMembers) {
      return res.status(400).json({ message: 'Community is full' });
    }

    await community.addMember(req.user.id);
    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave a community
// @route   POST /api/communities/:id/leave
// @access  Private
exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if member
    if (!community.isMember(req.user.id)) {
      return res.status(400).json({ message: 'Not a member of this community' });
    }
    
    // Prevent creator from leaving
    if (community.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'Community creator cannot leave' });
    }

    await community.removeMember(req.user.id);
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's communities
// @route   GET /api/communities/my-communities
// @access  Private
exports.getUserCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      $or: [
        { createdBy: req.user.id },
        { 'members.user': req.user.id }
      ],
      isActive: true
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete community
// @route   DELETE /api/communities/:id
// @access  Private
exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Only creator or admin can delete
    if (community.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this community' });
    }
    
    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
