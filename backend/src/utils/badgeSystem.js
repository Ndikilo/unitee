const User = require('../models/User');
const Badge = require('../models/Badge');

// Badge definitions
const BADGE_DEFINITIONS = [
  // Participation Badges
  {
    name: 'First Steps',
    description: 'Completed your first volunteer event',
    icon: '🎯',
    category: 'participation',
    criteria: { type: 'events_completed', threshold: 1 },
    tier: 'bronze',
    points: 10
  },
  {
    name: 'Dedicated Helper',
    description: 'Completed 5 volunteer events',
    icon: '💪',
    category: 'participation',
    criteria: { type: 'events_completed', threshold: 5 },
    tier: 'silver',
    points: 25
  },
  {
    name: 'Community Champion',
    description: 'Completed 10 volunteer events',
    icon: '🏆',
    category: 'participation',
    criteria: { type: 'events_completed', threshold: 10 },
    tier: 'gold',
    points: 50
  },
  {
    name: 'Volunteer Legend',
    description: 'Completed 25 volunteer events',
    icon: '⭐',
    category: 'participation',
    criteria: { type: 'events_completed', threshold: 25 },
    tier: 'platinum',
    points: 100
  },

  // Hours Badges
  {
    name: 'Time Giver',
    description: 'Logged 10+ volunteer hours',
    icon: '⏰',
    category: 'hours',
    criteria: { type: 'hours_logged', threshold: 10 },
    tier: 'bronze',
    points: 15
  },
  {
    name: 'Time Warrior',
    description: 'Logged 50+ volunteer hours',
    icon: '⚡',
    category: 'hours',
    criteria: { type: 'hours_logged', threshold: 50 },
    tier: 'silver',
    points: 40
  },
  {
    name: 'Hundred Hours Hero',
    description: 'Logged 100+ volunteer hours',
    icon: '💯',
    category: 'hours',
    criteria: { type: 'hours_logged', threshold: 100 },
    tier: 'gold',
    points: 75
  },
  {
    name: 'Time Master',
    description: 'Logged 250+ volunteer hours',
    icon: '👑',
    category: 'hours',
    criteria: { type: 'hours_logged', threshold: 250 },
    tier: 'platinum',
    points: 150
  },

  // Impact Badges
  {
    name: 'Helper',
    description: 'Helped 10+ people',
    icon: '🤝',
    category: 'impact',
    criteria: { type: 'people_helped', threshold: 10 },
    tier: 'bronze',
    points: 15
  },
  {
    name: 'Impact Maker',
    description: 'Helped 50+ people',
    icon: '💝',
    category: 'impact',
    criteria: { type: 'people_helped', threshold: 50 },
    tier: 'silver',
    points: 35
  },
  {
    name: 'Life Changer',
    description: 'Helped 100+ people',
    icon: '🌟',
    category: 'impact',
    criteria: { type: 'people_helped', threshold: 100 },
    tier: 'gold',
    points: 70
  },

  // Community Badges
  {
    name: 'Community Builder',
    description: 'Joined 3 communities',
    icon: '🏘️',
    category: 'community',
    criteria: { type: 'communities_joined', threshold: 3 },
    tier: 'bronze',
    points: 20
  },
  {
    name: 'Community Connector',
    description: 'Joined 5 communities',
    icon: '🌐',
    category: 'community',
    criteria: { type: 'communities_joined', threshold: 5 },
    tier: 'silver',
    points: 35
  },
  {
    name: 'Local Leader',
    description: 'Lead or create a community',
    icon: '👑',
    category: 'leadership',
    criteria: { type: 'events_created', threshold: 1 },
    tier: 'gold',
    points: 50
  },

  // Skills Badges
  {
    name: 'Skill Master',
    description: 'Added 5 skills to your profile',
    icon: '🎓',
    category: 'skills',
    criteria: { type: 'skills_added', threshold: 5 },
    tier: 'bronze',
    points: 15
  }
];

// Initialize badges in database
async function initializeBadges() {
  try {
    for (const badgeDef of BADGE_DEFINITIONS) {
      await Badge.findOneAndUpdate(
        { name: badgeDef.name },
        badgeDef,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Badges initialized');
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
  }
}

// Check and award badges to a user
async function checkAndAwardBadges(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const allBadges = await Badge.find({ isActive: true });
    const newBadges = [];

    for (const badge of allBadges) {
      // Check if user already has this badge
      const hasBadge = user.stats.badges.some(b => b.badgeId && b.badgeId.toString() === badge._id.toString());
      if (hasBadge) continue;

      // Check if user meets criteria
      let meetsCriteria = false;
      const stats = user.stats;

      switch (badge.criteria.type) {
        case 'events_completed':
          meetsCriteria = stats.totalEvents >= badge.criteria.threshold;
          break;
        case 'hours_logged':
          meetsCriteria = stats.totalHours >= badge.criteria.threshold;
          break;
        case 'people_helped':
          meetsCriteria = stats.peopleHelped >= badge.criteria.threshold;
          break;
        case 'communities_joined':
          // Count communities user is member of
          meetsCriteria = user.communities?.length >= badge.criteria.threshold;
          break;
        case 'skills_added':
          meetsCriteria = user.profile?.skills?.length >= badge.criteria.threshold;
          break;
        case 'events_created':
          // This would need to check opportunities created by user
          meetsCriteria = false; // Implement when needed
          break;
        case 'applications_accepted':
          // This would need to check accepted applications
          meetsCriteria = false; // Implement when needed
          break;
      }

      // Award badge if criteria met
      if (meetsCriteria) {
        user.stats.badges.push({
          badgeId: badge._id,
          name: badge.name,
          earnedAt: new Date()
        });
        newBadges.push(badge);
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// Get user's badge progress
async function getUserBadgeProgress(userId) {
  try {
    const user = await User.findById(userId).populate('stats.badges.badgeId');
    if (!user) return { earned: [], available: [] };

    const allBadges = await Badge.find({ isActive: true }).sort({ tier: 1, points: 1 });
    const earnedBadgeIds = user.stats.badges.map(b => b.badgeId?._id?.toString()).filter(Boolean);

    const earned = user.stats.badges.map(b => ({
      ...b.badgeId?.toObject(),
      earnedAt: b.earnedAt
    })).filter(b => b._id);

    const available = allBadges
      .filter(badge => !earnedBadgeIds.includes(badge._id.toString()))
      .map(badge => {
        let progress = 0;
        const stats = user.stats;

        switch (badge.criteria.type) {
          case 'events_completed':
            progress = Math.min(100, (stats.totalEvents / badge.criteria.threshold) * 100);
            break;
          case 'hours_logged':
            progress = Math.min(100, (stats.totalHours / badge.criteria.threshold) * 100);
            break;
          case 'people_helped':
            progress = Math.min(100, (stats.peopleHelped / badge.criteria.threshold) * 100);
            break;
          case 'communities_joined':
            progress = Math.min(100, ((user.communities?.length || 0) / badge.criteria.threshold) * 100);
            break;
          case 'skills_added':
            progress = Math.min(100, ((user.profile?.skills?.length || 0) / badge.criteria.threshold) * 100);
            break;
        }

        return {
          ...badge.toObject(),
          progress: Math.round(progress)
        };
      });

    return { earned, available };
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return { earned: [], available: [] };
  }
}

module.exports = {
  initializeBadges,
  checkAndAwardBadges,
  getUserBadgeProgress,
  BADGE_DEFINITIONS
};
