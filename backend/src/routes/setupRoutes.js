const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// @desc    Create initial admin user (one-time setup)
// @route   POST /api/setup/admin
// @access  Public (but with security key)
router.post('/admin', async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    // Security key to prevent unauthorized admin creation
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'VOLUNTEER_ADMIN_SETUP_2024';
    
    if (setupKey !== SETUP_KEY) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin user already exists. Use the existing admin account or contact support.' 
      });
    }

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      emailVerified: true,
      isActive: true
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
});

// @desc    Check if admin exists
// @route   GET /api/setup/admin-exists
// @access  Public
router.get('/admin-exists', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    console.log('Admin check result:', adminExists ? 'Found' : 'Not found');
    res.json({ adminExists: !!adminExists });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;