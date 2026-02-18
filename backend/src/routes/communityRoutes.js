const express = require('express');
const router = express.Router();
const { 
  createCommunity, 
  getCommunities, 
  getCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  getUserCommunities,
  deleteCommunity
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getCommunities)
  .post(protect, createCommunity);

router.get('/my-communities', protect, getUserCommunities);

router.route('/:id')
  .get(getCommunity)
  .put(protect, updateCommunity)
  .delete(protect, deleteCommunity);

router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);

module.exports = router;
