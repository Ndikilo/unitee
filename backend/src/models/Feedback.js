const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bug', 'suggestion', 'question', 'other'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  email: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  page: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new',
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
