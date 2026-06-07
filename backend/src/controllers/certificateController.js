const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

// Decode a JWT token without blocking the request (used for optional auth)
const decodeToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Fetch a photo (base64 data-URL or http/https URL) into a Buffer
const fetchPhotoBuffer = async (avatar) => {
  if (!avatar) return null;
  try {
    if (avatar.startsWith('data:')) {
      const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    }
    if (avatar.startsWith('http')) {
      return await new Promise((resolve, reject) => {
        const protocol = avatar.startsWith('https') ? https : http;
        protocol.get(avatar, (res) => {
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    }
  } catch {
    return null;
  }
  return null;
};

// Helper: find a user by ID — checks User, Volunteer, then Organization collections
const findUserById = async (id) => {
  // Primary: legacy User model (used by authController)
  let user = await User.findById(id).select('name email profile organizationName role');
  if (user) {
    const displayName = user.organizationName || user.name;
    return { ...user.toObject(), displayName, email: user.email };
  }
  // Fallback: dedicated Volunteer collection
  user = await Volunteer.findById(id).select('name email profile');
  if (user) return { ...user.toObject(), displayName: user.name };
  // Fallback: dedicated Organization collection
  user = await Organization.findById(id).select('account organization');
  if (user) return { ...user.toObject(), displayName: user.account?.name || user.organization?.name, email: user.account?.email };
  return null;
};

// @desc    Generate certificate for volunteer
// @route   POST /api/certificates/generate
// @access  Private (NGO/Admin)
exports.generateCertificate = asyncHandler(async (req, res, next) => {
  const {
    type,
    title,
    description,
    recipientId,
    opportunityId,
    hoursCompleted,
    skillsAcquired,
    achievementLevel,
    expiryDate,
    metadata
  } = req.body;

  // Verify recipient exists (check Volunteer collection first, then Organization)
  const recipient = await findUserById(recipientId);
  if (!recipient) {
    return next(new ErrorResponse('Recipient not found', 404));
  }

  // Verify opportunity if provided
  let opportunity = null;
  if (opportunityId) {
    opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return next(new ErrorResponse('Opportunity not found', 404));
    }
  }

  // Get issuer display name
  const issuerName = req.user.name || req.user.account?.name || 'UNITEE Platform';

  // Create certificate
  const certificateData = {
    type,
    title,
    description,
    recipientId,
    recipientName: recipient.displayName || recipient.name,
    recipientEmail: recipient.email,
    issuerId: req.user._id,
    issuerName,
    issuerType: req.userType === 'admin' ? 'admin' : 'ngo',
    hoursCompleted: hoursCompleted || 0,
    skillsAcquired: skillsAcquired || [],
    achievementLevel: achievementLevel || 'bronze',
    expiryDate,
    metadata: metadata || {}
  };

  if (opportunity) {
    certificateData.opportunityId = opportunityId;
    certificateData.opportunityTitle = opportunity.title;
  }

  const certificate = await Certificate.generateCertificate(certificateData);

  res.status(201).json({
    success: true,
    data: certificate
  });
});

// @desc    Verify certificate by ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
exports.verifyCertificate = asyncHandler(async (req, res, next) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findByCertificateId(certificateId)
    .populate('recipientId', 'name email profile organizationName')
    .populate('issuerId', 'name organizationName')
    .populate('opportunityId', 'title category location');

  if (!certificate) {
    return next(new ErrorResponse('Certificate not found', 404));
  }

  // Volunteer passports require org or admin access to verify
  if (certificate.type === 'volunteer_passport') {
    const decoded = decodeToken(req);
    const isOrgOrAdmin = decoded && ['organization', 'admin'].includes(decoded.userType);
    const isOwner = decoded && decoded.id === certificate.recipientId?._id?.toString();
    if (!isOrgOrAdmin && !isOwner) {
      return next(new ErrorResponse(
        'Passport verification requires organization or admin access. Please log in.',
        401
      ));
    }
  }

  // Update verification tracking
  certificate.verificationCount += 1;
  certificate.lastVerified = new Date();
  await certificate.save();

  // Verify certificate integrity
  const isValid = certificate.isValid();
  const isVerified = certificate.verify();

  res.status(200).json({
    success: true,
    data: {
      certificate: {
        certificateId: certificate.certificateId,
        type: certificate.type,
        title: certificate.title,
        description: certificate.description,
        recipient: {
          name: certificate.recipientName,
          email: certificate.recipientEmail,
          avatar: certificate.recipientId?.profile?.avatar
        },
        issuer: {
          name: certificate.issuerName,
          type: certificate.issuerType,
          organization: certificate.issuerId?.organizationName
        },
        opportunity: certificate.opportunityId ? {
          title: certificate.opportunityTitle,
          category: certificate.opportunityId.category,
          location: certificate.opportunityId.location
        } : null,
        metrics: {
          hoursCompleted: certificate.hoursCompleted,
          skillsAcquired: certificate.skillsAcquired,
          achievementLevel: certificate.achievementLevel
        },
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
        verificationCount: certificate.verificationCount,
        lastVerified: certificate.lastVerified
      },
      verification: {
        isValid,
        isVerified,
        verificationHash: certificate.verificationHash,
        digitalSignature: certificate.digitalSignature
      }
    }
  });
});

// @desc    Get user certificates
// @route   GET /api/certificates/user/:userId
// @access  Private
exports.getUserCertificates = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Check if user is requesting their own certificates or is admin
  const requestId = (req.user._id ?? req.user.id)?.toString();
  if (requestId !== userId && req.userType !== 'admin') {
    return next(new ErrorResponse('Not authorized to access these certificates', 403));
  }

  const certificates = await Certificate.find({ recipientId: userId })
    .populate('issuerId', 'name organizationName')
    .populate('opportunityId', 'title category')
    .sort({ issuedDate: -1 });

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Download certificate as PDF
// @route   GET /api/certificates/download/:certificateId
// @access  Private
exports.downloadCertificate = asyncHandler(async (req, res, next) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findByCertificateId(certificateId)
    .populate('recipientId', 'name email profile')
    .populate('issuerId', 'name organizationName')
    .populate('opportunityId', 'title category location');

  if (!certificate) {
    return next(new ErrorResponse('Certificate not found', 404));
  }

  // Check if user is authorized to download
  const recipientIdStr = certificate.recipientId?._id?.toString() ?? certificate.recipientId?.toString();
  const requesterId = (req.user._id ?? req.user.id)?.toString();
  if (requesterId !== recipientIdStr && req.userType !== 'admin') {
    return next(new ErrorResponse('Not authorized to download this certificate', 403));
  }

  // Generate PDF
  const pdfBuffer = await generateCertificatePDF(certificate);

  // Update download count
  certificate.downloadCount += 1;
  await certificate.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="UNITEE-Certificate-${certificate.certificateId}.pdf"`);
  res.send(pdfBuffer);
});

// @desc    Revoke certificate
// @route   PUT /api/certificates/revoke/:certificateId
// @access  Private (Admin/Issuer)
exports.revokeCertificate = asyncHandler(async (req, res, next) => {
  const { certificateId } = req.params;
  const { reason } = req.body;

  const certificate = await Certificate.findByCertificateId(certificateId);

  if (!certificate) {
    return next(new ErrorResponse('Certificate not found', 404));
  }

  // Check authorization
  if (req.userType !== 'admin' && req.user._id.toString() !== certificate.issuerId.toString()) {
    return next(new ErrorResponse('Not authorized to revoke this certificate', 403));
  }

  await certificate.revoke(reason || 'No reason provided');

  res.status(200).json({
    success: true,
    message: 'Certificate revoked successfully'
  });
});

// @desc    Get live volunteer passport data (computed from current user stats, never stale)
// @route   GET /api/certificates/my-passport
// @access  Private
exports.getMyPassport = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('name email profile stats');
  if (!user) return next(new ErrorResponse('User not found', 404));

  const hours    = user.stats?.totalHours  ?? 0;
  const events   = user.stats?.totalEvents ?? 0;
  const badges   = user.stats?.badges      ?? [];
  const skills   = user.profile?.skills    ?? [];

  let achievementLevel = 'bronze';
  if (hours >= 100)     achievementLevel = 'platinum';
  else if (hours >= 50) achievementLevel = 'gold';
  else if (hours >= 20) achievementLevel = 'silver';

  res.json({
    success: true,
    data: {
      recipientName: user.name,
      recipientEmail: user.email,
      issuerName: 'UNITEE Platform',
      title: 'Volunteer Passport',
      issuedDate: new Date(),
      metrics: {
        hoursCompleted: hours,
        totalEvents: events,
        skillsAcquired: skills,
        achievementLevel,
        badgesEarned: badges.length,
      },
      earnedBadges: badges,
      isLive: true,
    }
  });
});

// @desc    Download volunteer passport as PDF (versioned, stored in DB, optional photo)
// @route   GET /api/certificates/my-passport/download?includePhoto=true
// @access  Private
exports.downloadMyPassport = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('name email profile stats');
  if (!user) return next(new ErrorResponse('User not found', 404));

  const includePhoto = req.query.includePhoto === 'true';
  const hours  = user.stats?.totalHours  ?? 0;
  const events = user.stats?.totalEvents ?? 0;
  const badges = user.stats?.badges      ?? [];
  const skills = user.profile?.skills    ?? [];

  let achievementLevel = 'bronze';
  if (hours >= 100)     achievementLevel = 'platinum';
  else if (hours >= 50) achievementLevel = 'gold';
  else if (hours >= 20) achievementLevel = 'silver';

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

  // Save a versioned Certificate record to the DB — creates a new snapshot each download
  const certRecord = await Certificate.generateCertificate({
    type: 'volunteer_passport',
    title: 'Volunteer Passport',
    description: `Volunteer Passport for ${user.name} — UNITEE Platform snapshot`,
    recipientId: user._id,
    recipientName: user.name,
    recipientEmail: user.email,
    issuerId: user._id,      // self-generated through UNITEE system
    issuerName: 'UNITEE Platform',
    issuerType: 'system',
    hoursCompleted: hours,
    skillsAcquired: skills,
    achievementLevel,
    metadata: {
      totalEvents: events,
      badgesEarned: badges.length,
      snapshotDate: new Date(),
    },
  });

  // Update verificationUrl now that we have the certificateId
  certRecord.verificationUrl = `${frontendUrl}/verify/${certRecord.certificateId}`;
  certRecord.pdfGenerated = true;
  certRecord.downloadCount += 1;
  await certRecord.save();

  // Optionally fetch photo buffer
  let photoBuffer = null;
  if (includePhoto && user.profile?.avatar) {
    photoBuffer = await fetchPhotoBuffer(user.profile.avatar);
  }

  const pseudoCert = {
    recipientName: user.name,
    title: 'Volunteer Passport',
    opportunityTitle: null,
    hoursCompleted: hours,
    skillsAcquired: skills,
    achievementLevel,
    issuerName: 'UNITEE Platform',
    issuedDate: certRecord.issuedDate,
    certificateId: certRecord.certificateId,
    verificationUrl: certRecord.verificationUrl,
    totalEvents: events,
    badgesEarned: badges.length,
    photoBuffer,
  };

  const pdfBuffer = await generateCertificatePDF(pseudoCert);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename="UNITEE-Passport-${user.name.replace(/\s+/g, '-')}.pdf"`);
  res.send(pdfBuffer);
});

// @desc    Get certificate statistics
// @route   GET /api/certificates/stats
// @access  Private (Admin)
exports.getCertificateStats = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'admin') {
    return next(new ErrorResponse('Not authorized to access certificate statistics', 403));
  }

  const stats = await Certificate.aggregate([
    {
      $group: {
        _id: null,
        totalCertificates: { $sum: 1 },
        activeCertificates: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        revokedCertificates: {
          $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] }
        },
        totalDownloads: { $sum: '$downloadCount' },
        totalVerifications: { $sum: '$verificationCount' }
      }
    }
  ]);

  const typeStats = await Certificate.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalCertificates: 0,
        activeCertificates: 0,
        revokedCertificates: 0,
        totalDownloads: 0,
        totalVerifications: 0
      },
      byType: typeStats
    }
  });
});

// Helper function to generate top-notch PDF certificate
async function generateCertificatePDF(certificate) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // ===== BACKGROUND DESIGN =====
      // Gradient-like effect with overlapping rectangles
      doc.rect(0, 0, pageWidth, pageHeight).fill('#f8fafc');
      
      // Decorative corner elements
      doc.save();
      doc.fillColor('#3b82f6').opacity(0.1);
      doc.circle(50, 50, 100).fill();
      doc.circle(pageWidth - 50, 50, 100).fill();
      doc.circle(50, pageHeight - 50, 100).fill();
      doc.circle(pageWidth - 50, pageHeight - 50, 100).fill();
      doc.restore();

      // Main border with gradient effect
      doc.lineWidth(8);
      doc.strokeColor('#3b82f6').opacity(0.8);
      doc.roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 15).stroke();
      
      doc.lineWidth(3);
      doc.strokeColor('#60a5fa').opacity(0.6);
      doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 10).stroke();

      // Inner decorative border
      doc.lineWidth(1);
      doc.strokeColor('#93c5fd').opacity(0.4);
      doc.roundedRect(50, 50, pageWidth - 100, pageHeight - 100, 8).stroke();

      // ===== HEADER SECTION =====
      doc.save();
      doc.fillColor('#3b82f6');
      doc.fontSize(40).font('Helvetica-Bold');
      doc.text('UNITEE', centerX - 80, 80, { width: 160, align: 'center' });
      doc.restore();

      // Subtitle
      doc.fontSize(12).fillColor('#64748b').font('Helvetica');
      doc.text('Volunteer Community Action Platform', 0, 125, { align: 'center' });

      // ===== OPTIONAL PHOTO (passport only) =====
      if (certificate.photoBuffer) {
        try {
          const photoSize = 80;
          const photoX = pageWidth - 140;
          const photoY = 65;
          // White rounded background
          doc.save();
          doc.roundedRect(photoX - 4, photoY - 4, photoSize + 8, photoSize + 8, 8)
             .fillAndStroke('#ffffff', '#e2e8f0');
          doc.restore();
          doc.image(certificate.photoBuffer, photoX, photoY, {
            width: photoSize, height: photoSize, cover: [photoSize, photoSize],
          });
        } catch { /* photo failed silently */ }
      }

      // Decorative line under header
      doc.moveTo(centerX - 150, 145).lineTo(centerX + 150, 145);
      doc.strokeColor('#cbd5e1').lineWidth(2).stroke();

      // ===== CERTIFICATE TITLE =====
      doc.fontSize(36).fillColor('#1e293b').font('Helvetica-Bold');
      doc.text('CERTIFICATE', 0, 170, { align: 'center' });
      
      doc.fontSize(24).fillColor('#475569').font('Helvetica');
      doc.text('OF ACHIEVEMENT', 0, 210, { align: 'center' });

      // ===== MAIN CONTENT =====
      // "This certifies that" text
      doc.fontSize(14).fillColor('#64748b').font('Helvetica');
      doc.text('This is to certify that', 0, 260, { align: 'center' });

      // Recipient name with decorative underline
      doc.fontSize(32).fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(certificate.recipientName, 0, 290, { align: 'center' });
      
      // Decorative underline for name
      const nameWidth = doc.widthOfString(certificate.recipientName);
      const nameX = centerX - (nameWidth / 2);
      doc.moveTo(nameX, 330).lineTo(nameX + nameWidth, 330);
      doc.strokeColor('#3b82f6').lineWidth(2).stroke();

      // Achievement description
      doc.fontSize(16).fillColor('#475569').font('Helvetica');
      doc.text('has successfully completed', 0, 350, { align: 'center' });

      // Certificate title with background
      doc.save();
      doc.roundedRect(centerX - 250, 380, 500, 50, 8);
      doc.fillAndStroke('#eff6ff', '#3b82f6');
      doc.restore();
      
      doc.fontSize(20).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text(certificate.title, centerX - 240, 395, { width: 480, align: 'center' });

      // Opportunity title if exists
      if (certificate.opportunityTitle) {
        doc.fontSize(13).fillColor('#64748b').font('Helvetica-Oblique');
        doc.text(`Related to: ${certificate.opportunityTitle}`, 0, 450, { align: 'center' });
      }

      // ===== METRICS SECTION =====
      let metricsY = certificate.opportunityTitle ? 480 : 460;
      
      // Metrics background
      doc.save();
      doc.roundedRect(centerX - 300, metricsY, 600, 60, 8);
      doc.fillColor('#f1f5f9');
      doc.fill();
      doc.restore();

      // Display metrics in columns
      const metricStartX = centerX - 250;
      let metricX = metricStartX;
      
      if (certificate.hoursCompleted > 0) {
        doc.fontSize(24).fillColor('#3b82f6').font('Helvetica-Bold');
        doc.text(certificate.hoursCompleted.toString(), metricX, metricsY + 10, { width: 100, align: 'center' });
        doc.fontSize(10).fillColor('#64748b').font('Helvetica');
        doc.text('Hours Completed', metricX, metricsY + 40, { width: 100, align: 'center' });
        metricX += 150;
      }

      // Achievement level
      doc.fontSize(18).fillColor('#f59e0b').font('Helvetica-Bold');
      doc.text(certificate.achievementLevel.toUpperCase(), metricX, metricsY + 15, { width: 120, align: 'center' });
      doc.fontSize(10).fillColor('#64748b').font('Helvetica');
      doc.text('Achievement Level', metricX, metricsY + 40, { width: 120, align: 'center' });
      metricX += 150;

      // Skills count
      if (certificate.skillsAcquired && certificate.skillsAcquired.length > 0) {
        doc.fontSize(24).fillColor('#10b981').font('Helvetica-Bold');
        doc.text(certificate.skillsAcquired.length.toString(), metricX, metricsY + 10, { width: 100, align: 'center' });
        doc.fontSize(10).fillColor('#64748b').font('Helvetica');
        doc.text('Skills Acquired', metricX, metricsY + 40, { width: 100, align: 'center' });
      }

      // Skills list if available
      if (certificate.skillsAcquired && certificate.skillsAcquired.length > 0) {
        const skillsY = metricsY + 75;
        doc.fontSize(9).fillColor('#64748b').font('Helvetica');
        doc.text('Skills: ' + certificate.skillsAcquired.join(' • '), 100, skillsY, { 
          width: pageWidth - 200, 
          align: 'center' 
        });
      }

      // ===== FOOTER SECTION =====
      const footerY = pageHeight - 140;

      // Date and issuer info
      doc.fontSize(11).fillColor('#475569').font('Helvetica');
      doc.text('Issued on', 100, footerY);
      doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(new Date(certificate.issuedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), 100, footerY + 18);

      doc.fontSize(11).fillColor('#475569').font('Helvetica');
      doc.text('Issued by', 100, footerY + 45);
      doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(certificate.issuerName, 100, footerY + 63);

      // Signature line
      doc.moveTo(100, footerY + 90).lineTo(250, footerY + 90);
      doc.strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.fontSize(9).fillColor('#94a3b8').font('Helvetica');
      doc.text('Authorized Signature', 100, footerY + 95);

      // ===== QR CODE SECTION =====
      try {
        const qrCodeData = await QRCode.toDataURL(certificate.verificationUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        });
        
        // QR Code background
        doc.save();
        doc.roundedRect(pageWidth - 180, footerY - 10, 140, 140, 8);
        doc.fillAndStroke('#ffffff', '#e2e8f0');
        doc.restore();

        // Add QR code
        doc.image(qrCodeData, pageWidth - 170, footerY, { width: 120, height: 120 });
        
        doc.fontSize(9).fillColor('#64748b').font('Helvetica');
        doc.text('Scan to Verify', pageWidth - 170, footerY + 125, { width: 120, align: 'center' });
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }

      // ===== CERTIFICATE ID AND VERIFICATION =====
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica');
      doc.text(`Certificate ID: ${certificate.certificateId}`, 100, pageHeight - 35);
      doc.text(`Verification: ${certificate.verificationUrl}`, 100, pageHeight - 23);

      // Security watermark
      doc.save();
      doc.fontSize(80).fillColor('#f1f5f9').font('Helvetica-Bold').opacity(0.05);
      doc.text('VERIFIED', 0, pageHeight / 2 - 40, { 
        align: 'center',
        angle: -30
      });
      doc.restore();

      // Decorative seal/badge
      doc.save();
      doc.circle(pageWidth - 100, 120, 40);
      doc.fillAndStroke('#fef3c7', '#f59e0b');
      doc.fontSize(10).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('VERIFIED', pageWidth - 130, 110, { width: 60, align: 'center' });
      doc.text('AUTHENTIC', pageWidth - 130, 125, { width: 60, align: 'center' });
      doc.restore();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateCertificate: exports.generateCertificate,
  verifyCertificate: exports.verifyCertificate,
  getUserCertificates: exports.getUserCertificates,
  downloadCertificate: exports.downloadCertificate,
  revokeCertificate: exports.revokeCertificate,
  getCertificateStats: exports.getCertificateStats,
  getMyPassport: exports.getMyPassport,
  downloadMyPassport: exports.downloadMyPassport,
};