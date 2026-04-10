const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const Admin = require('../models/Admin');

/**
 * protect — verifies JWT and attaches req.user + req.userType
 * userType: 'volunteer' | 'organization' | 'admin'
 */
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, userType } = decoded;

    let user = null;

    // If userType is known, look in the right collection directly
    if (userType === 'admin') {
      user = await Admin.findById(id).select('-password');
      if (user) { req.user = user; req.userType = 'admin'; return next(); }
    } else if (userType === 'organization') {
      user = await Organization.findById(id).select('-account.password');
      if (user) { req.user = user; req.userType = 'organization'; return next(); }
    } else if (userType === 'volunteer') {
      user = await Volunteer.findById(id).select('-password');
      if (user) { req.user = user; req.userType = 'volunteer'; return next(); }
    }

    // Fallback: old token without userType — search all collections
    if (!user) user = await Admin.findById(id).select('-password');
    if (user) { req.user = user; req.userType = 'admin'; return next(); }

    user = await Organization.findById(id).select('-account.password');
    if (user) { req.user = user; req.userType = 'organization'; return next(); }

    user = await Volunteer.findById(id).select('-password');
    if (user) { req.user = user; req.userType = 'volunteer'; return next(); }

    return res.status(401).json({ message: 'User not found' });
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * authorize — restricts to specific user types
 * Usage: authorize('admin') or authorize('volunteer', 'organization')
 */
exports.authorize = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.userType)) {
      return res.status(403).json({ message: `Access denied for ${req.userType}` });
    }
    next();
  };
};

/**
 * requirePermission — checks admin has a specific permission
 * Usage: requirePermission('verify_organizations')
 */
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ message: `Missing permission: ${permission}` });
    }
    next();
  };
};

/**
 * requireSuperAdmin — only super_admin can proceed
 */
exports.requireSuperAdmin = (req, res, next) => {
  if (req.userType !== 'admin' || req.user.adminRole !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};
