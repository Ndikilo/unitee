const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  // Unique certificate identifier
  certificateId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Certificate verification hash (tamper-proof)
  verificationHash: {
    type: String,
    required: true,
    unique: true
  },
  
  // Certificate details
  type: {
    type: String,
    required: true,
    enum: ['volunteer_completion', 'volunteer_passport', 'achievement_badge', 'hours_milestone', 'skill_certification']
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Recipient information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recipientName: {
    type: String,
    required: true
  },
  
  recipientEmail: {
    type: String,
    required: true
  },
  
  // Issuing organization
  issuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  issuerName: {
    type: String,
    required: true
  },
  
  issuerType: {
    type: String,
    enum: ['ngo', 'admin', 'system'],
    required: true
  },
  
  // Related opportunity/activity
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  
  opportunityTitle: String,
  
  // Certificate metrics
  hoursCompleted: {
    type: Number,
    default: 0
  },
  
  skillsAcquired: [String],
  
  achievementLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  // Verification details
  issuedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  expiryDate: {
    type: Date
  },
  
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  
  // Digital signature and verification
  digitalSignature: {
    type: String,
    required: true
  },
  
  verificationUrl: {
    type: String,
    required: true
  },
  
  // PDF generation details
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  
  pdfPath: String,
  
  downloadCount: {
    type: Number,
    default: 0
  },
  
  // Verification tracking
  verificationCount: {
    type: Number,
    default: 0
  },
  
  lastVerified: Date,
  
  // Additional metadata
  metadata: {
    location: String,
    category: String,
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Generate unique certificate ID
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString(36);
    const randomStr = crypto.randomBytes(8).toString('hex');
    this.certificateId = `UNITEE-${timestamp}-${randomStr}`.toUpperCase();
  }
  
  // Generate verification hash
  if (!this.verificationHash) {
    const dataToHash = `${this.certificateId}${this.recipientId}${this.issuerId}${this.issuedDate}${this.title}`;
    this.verificationHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  }
  
  // Generate digital signature
  if (!this.digitalSignature) {
    const signatureData = `${this.verificationHash}${process.env.CERTIFICATE_SECRET || 'unitee-secret-key'}`;
    this.digitalSignature = crypto.createHash('sha256').update(signatureData).digest('hex');
  }
  
  // Generate verification URL
  if (!this.verificationUrl) {
    this.verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${this.certificateId}`;
  }
  
  next();
});

// Instance methods
certificateSchema.methods.verify = function() {
  // Verify certificate integrity
  const dataToHash = `${this.certificateId}${this.recipientId}${this.issuerId}${this.issuedDate}${this.title}`;
  const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  
  const signatureData = `${expectedHash}${process.env.CERTIFICATE_SECRET || 'unitee-secret-key'}`;
  const expectedSignature = crypto.createHash('sha256').update(signatureData).digest('hex');
  
  return this.verificationHash === expectedHash && this.digitalSignature === expectedSignature;
};

certificateSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  return this.verify();
};

certificateSchema.methods.revoke = function(reason) {
  this.status = 'revoked';
  this.metadata.revocationReason = reason;
  this.metadata.revokedAt = new Date();
  return this.save();
};

// Static methods
certificateSchema.statics.findByCertificateId = function(certificateId) {
  return this.findOne({ certificateId: certificateId.toUpperCase() });
};

certificateSchema.statics.generateCertificate = async function(data) {
  const certificate = new this(data);
  await certificate.save();
  return certificate;
};

// Indexes for performance
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ recipientId: 1 });
certificateSchema.index({ issuerId: 1 });
certificateSchema.index({ verificationHash: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issuedDate: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);