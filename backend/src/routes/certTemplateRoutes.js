const express = require('express');
const router = express.Router();
const CertificateTemplate = require('../models/CertificateTemplate');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templates = await CertificateTemplate.find().sort({ isDefault: -1, createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single template
router.get('/:id', async (req, res) => {
  try {
    const t = await CertificateTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const t = await CertificateTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const t = await CertificateTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    Object.assign(t, req.body);
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await CertificateTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
