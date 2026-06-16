const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
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

  // Notify recipient that a certificate has been issued
  try {
    await Notification.create({
      recipient: recipientId,
      type: 'certificate',
      title: '🎓 Certificate Issued',
      message: `You have been issued a certificate: "${title}" by ${issuerName}.`,
      priority: 'high',
      data: { certificateId: certificate._id, certificateCode: certificate.certificateId },
    });
  } catch (notifErr) {
    console.error('Certificate notification failed:', notifErr.message);
  }

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
// A4 landscape: 841.89 × 595.28 pt
// All elements are placed with absolute coordinates, strictly top-to-bottom,
// and the QR code is pre-generated before any drawing begins.
async function generateCertificatePDF(certificate) {
  // accentColor: issuing org's brand color, falls back to UNITEE blue
  const ACCENT = certificate.accentColor || '#3b82f6';
  const ACCENT_LIGHT = ACCENT + '22';  // 13% opacity tint for box fills

  // ── Pre-generate QR code BEFORE creating the PDF document ──────────────────
  let qrImageData = null;
  if (certificate.verificationUrl) {
    try {
      qrImageData = await QRCode.toDataURL(certificate.verificationUrl, {
        width: 100,
        margin: 1,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
    } catch (e) {
      console.error('QR generation error:', e);
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        // Zero margins so we control every coordinate explicitly.
        // This prevents PDFKit from auto-adding pages based on margin logic.
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: true,
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width;   // 841.89
      const H = doc.page.height;  // 595.28
      const cx = W / 2;

      // ── Layout constants (strictly top-to-bottom) ─────────────────────────
      const BORDER   = 28;        // outer border inset
      const PAD_L    = 80;        // left text padding
      const PAD_R    = W - 80;    // right text boundary
      const TEXT_W   = PAD_R - PAD_L;

      // Vertical zones
      const HDR_Y    = 68;        // "UNITEE"
      const SUB_Y    = 112;       // subtitle
      const LINE_Y   = 132;       // decorative line
      const CERT_Y   = 148;       // "CERTIFICATE"
      const ACH_Y    = 188;       // "OF ACHIEVEMENT"
      const PRE_Y    = 228;       // "This is to certify that"
      const NAME_Y   = 246;       // recipient name
      const UL_Y     = 284;       // name underline
      const COMP_Y   = 296;       // "has successfully completed"
      const BOX_Y    = 318;       // title box top
      const BOX_H    = 44;
      const OPP_Y    = BOX_Y + BOX_H + 10; // opportunity title (368)
      const MET_Y    = (certificate.opportunityTitle ? OPP_Y + 22 : BOX_Y + BOX_H + 10); // metrics
      const MET_H    = 52;
      const SKL_Y    = MET_Y + MET_H + 8;  // skills row

      // Footer starts AFTER all content — fixed at bottom of page
      const FOOT_Y   = H - 108;   // ~487
      const QR_SIZE  = 80;
      const QR_X     = W - BORDER - QR_SIZE - 8; // right-align within border
      const QR_Y     = FOOT_Y + 4;

      // ── Background ────────────────────────────────────────────────────────
      doc.rect(0, 0, W, H).fill('#f8fafc');

      // Corner accent circles
      doc.save();
      doc.opacity(0.07).fillColor(ACCENT);
      doc.circle(BORDER, BORDER, 90).fill();
      doc.circle(W - BORDER, BORDER, 90).fill();
      doc.circle(BORDER, H - BORDER, 90).fill();
      doc.circle(W - BORDER, H - BORDER, 90).fill();
      doc.restore();

      // Outer border
      doc.save();
      doc.lineWidth(7).strokeColor(ACCENT).opacity(0.85);
      doc.roundedRect(BORDER, BORDER, W - 2 * BORDER, H - 2 * BORDER, 14).stroke();
      doc.restore();

      // Inner border
      doc.save();
      doc.lineWidth(1.5).strokeColor(ACCENT).opacity(0.3);
      doc.roundedRect(BORDER + 8, BORDER + 8, W - 2 * (BORDER + 8), H - 2 * (BORDER + 8), 10).stroke();
      doc.restore();

      // ── Header ────────────────────────────────────────────────────────────
      doc.save();
      doc.fontSize(38).font('Helvetica-Bold').fillColor(ACCENT).opacity(1);
      doc.text('UNITEE', PAD_L, HDR_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(11).font('Helvetica').fillColor('#64748b');
      doc.text('Volunteer Community Action Platform', PAD_L, SUB_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      // Optional profile photo (passport mode)
      if (certificate.photoBuffer) {
        try {
          const psz = 72, px = W - BORDER - psz - 10, py = HDR_Y - 4;
          doc.save();
          doc.roundedRect(px - 3, py - 3, psz + 6, psz + 6, 6).fillAndStroke('#ffffff', '#e2e8f0');
          doc.restore();
          doc.image(certificate.photoBuffer, px, py, { width: psz, height: psz, cover: [psz, psz] });
        } catch { /* ignore */ }
      }

      // Decorative divider
      doc.save();
      doc.moveTo(cx - 140, LINE_Y).lineTo(cx + 140, LINE_Y);
      doc.lineWidth(1.5).strokeColor('#cbd5e1').opacity(0.8).stroke();
      doc.restore();

      // ── Certificate title ─────────────────────────────────────────────────
      doc.save();
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#1e293b');
      doc.text('CERTIFICATE', PAD_L, CERT_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(20).font('Helvetica').fillColor('#475569');
      doc.text('OF ACHIEVEMENT', PAD_L, ACH_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      // ── Main content ──────────────────────────────────────────────────────
      doc.save();
      doc.fontSize(12).font('Helvetica').fillColor('#64748b');
      doc.text('This is to certify that', PAD_L, PRE_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#0f172a');
      doc.text(certificate.recipientName, PAD_L, NAME_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      // Underline under name
      const nw = Math.min(doc.widthOfString(certificate.recipientName, { fontSize: 28 }), TEXT_W - 40);
      doc.save();
      doc.moveTo(cx - nw / 2, UL_Y).lineTo(cx + nw / 2, UL_Y);
      doc.lineWidth(1.5).strokeColor(ACCENT).opacity(0.7).stroke();
      doc.restore();

      doc.save();
      doc.fontSize(13).font('Helvetica').fillColor('#475569');
      doc.text('has successfully completed', PAD_L, COMP_Y, { width: TEXT_W, align: 'center', lineBreak: false });
      doc.restore();

      // Title box — uses org brand color for border, light tint for fill
      doc.save();
      doc.roundedRect(cx - 230, BOX_Y, 460, BOX_H, 7).fillAndStroke(ACCENT_LIGHT, ACCENT);
      doc.restore();

      doc.save();
      doc.fontSize(16).font('Helvetica-Bold').fillColor(ACCENT);
      // Truncate long title to one line
      const titleStr = certificate.title.length > 60 ? certificate.title.substring(0, 57) + '…' : certificate.title;
      doc.text(titleStr, cx - 220, BOX_Y + 14, { width: 440, align: 'center', lineBreak: false });
      doc.restore();

      // Opportunity subtitle
      if (certificate.opportunityTitle) {
        doc.save();
        doc.fontSize(11).font('Helvetica-Oblique').fillColor('#64748b');
        const oppStr = certificate.opportunityTitle.length > 70
          ? certificate.opportunityTitle.substring(0, 67) + '…'
          : certificate.opportunityTitle;
        doc.text(oppStr, PAD_L, OPP_Y, { width: TEXT_W, align: 'center', lineBreak: false });
        doc.restore();
      }

      // ── Metrics bar ───────────────────────────────────────────────────────
      doc.save();
      doc.roundedRect(cx - 260, MET_Y, 520, MET_H, 7).fill('#f1f5f9');
      doc.restore();

      let mx = cx - 210;

      if (certificate.hoursCompleted > 0) {
        doc.save();
        doc.fontSize(20).font('Helvetica-Bold').fillColor(ACCENT);
        doc.text(String(certificate.hoursCompleted), mx, MET_Y + 8, { width: 90, align: 'center', lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text('Hours', mx, MET_Y + 34, { width: 90, align: 'center', lineBreak: false });
        doc.restore();
        mx += 130;
      }

      doc.save();
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#f59e0b');
      doc.text(certificate.achievementLevel.toUpperCase(), mx, MET_Y + 12, { width: 110, align: 'center', lineBreak: false });
      doc.fontSize(9).font('Helvetica').fillColor('#64748b');
      doc.text('Level', mx, MET_Y + 34, { width: 110, align: 'center', lineBreak: false });
      doc.restore();
      mx += 130;

      if (certificate.skillsAcquired && certificate.skillsAcquired.length > 0) {
        doc.save();
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#10b981');
        doc.text(String(certificate.skillsAcquired.length), mx, MET_Y + 8, { width: 90, align: 'center', lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text('Skills', mx, MET_Y + 34, { width: 90, align: 'center', lineBreak: false });
        doc.restore();
      }

      // Skills list — single line, clipped to page width, lineBreak:false prevents overflow
      if (certificate.skillsAcquired && certificate.skillsAcquired.length > 0 && SKL_Y < FOOT_Y - 16) {
        const skillStr = certificate.skillsAcquired.join('  •  ');
        const clipped = skillStr.length > 80 ? skillStr.substring(0, 77) + '…' : skillStr;
        doc.save();
        doc.fontSize(9).font('Helvetica').fillColor('#94a3b8');
        doc.text(clipped, PAD_L, SKL_Y, { width: TEXT_W, align: 'center', lineBreak: false });
        doc.restore();
      }

      // ── Footer divider ────────────────────────────────────────────────────
      doc.save();
      doc.moveTo(PAD_L, FOOT_Y - 6).lineTo(W - PAD_L, FOOT_Y - 6);
      doc.lineWidth(1).strokeColor('#e2e8f0').opacity(0.8).stroke();
      doc.restore();

      // ── Footer: Left — date + issuer + signature ──────────────────────────
      const FL = PAD_L;           // footer left column x
      const FC = cx - 60;         // footer centre column x
      const dateStr = new Date(certificate.issuedDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      doc.save();
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8');
      doc.text('Issued on', FL, FOOT_Y, { lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a');
      doc.text(dateStr, FL, FOOT_Y + 14, { lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8');
      doc.text('Issued by', FL, FOOT_Y + 36, { lineBreak: false });
      doc.restore();

      doc.save();
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a');
      const issuerStr = certificate.issuerName.length > 35
        ? certificate.issuerName.substring(0, 32) + '…'
        : certificate.issuerName;
      doc.text(issuerStr, FL, FOOT_Y + 50, { lineBreak: false });
      doc.restore();

      // Signature line
      doc.save();
      doc.moveTo(FL, FOOT_Y + 72).lineTo(FL + 150, FOOT_Y + 72);
      doc.lineWidth(1).strokeColor('#cbd5e1').stroke();
      doc.restore();

      doc.save();
      doc.fontSize(8).font('Helvetica').fillColor('#94a3b8');
      doc.text('Authorized Signature', FL, FOOT_Y + 76, { lineBreak: false });
      doc.restore();

      // ── Footer: Centre — cert ID + URL ───────────────────────────────────
      if (certificate.certificateId) {
        doc.save();
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8');
        doc.text('Certificate ID', FC, FOOT_Y, { lineBreak: false });
        doc.restore();

        doc.save();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b');
        doc.text(certificate.certificateId, FC, FOOT_Y + 12, { lineBreak: false });
        doc.restore();

        if (certificate.verificationUrl) {
          // Truncate URL to keep it on one line
          const urlDisplay = certificate.verificationUrl.replace(/^https?:\/\//, '');
          const urlStr = urlDisplay.length > 42 ? urlDisplay.substring(0, 39) + '…' : urlDisplay;
          doc.save();
          doc.fontSize(8).font('Helvetica').fillColor('#6366f1');
          doc.text(urlStr, FC, FOOT_Y + 28, { lineBreak: false });
          doc.restore();
        }
      }

      // ── Footer: Right — QR code ───────────────────────────────────────────
      if (qrImageData) {
        // White card behind QR
        doc.save();
        doc.roundedRect(QR_X - 4, QR_Y - 4, QR_SIZE + 8, QR_SIZE + 8, 6)
           .fillAndStroke('#ffffff', '#e2e8f0');
        doc.restore();

        // QR image — placed at absolute coordinates, no text cursor involvement
        doc.image(qrImageData, QR_X, QR_Y, { width: QR_SIZE, height: QR_SIZE });

        // "Scan to Verify" label directly below QR, within page bounds
        const lblY = QR_Y + QR_SIZE + 5;
        if (lblY + 12 <= H - BORDER) {
          doc.save();
          doc.fontSize(8).font('Helvetica').fillColor('#64748b');
          doc.text('Scan to Verify', QR_X, lblY, { width: QR_SIZE, align: 'center', lineBreak: false });
          doc.restore();
        }
      }

      // ── "VERIFIED" watermark (purely decorative, no cursor impact) ─────────
      doc.save();
      doc.opacity(0.04).fontSize(100).font('Helvetica-Bold').fillColor(ACCENT);
      // Manually rotate: use PDF transform instead of doc.text angle option
      doc.rotate(-30, { origin: [cx, H / 2] });
      doc.text('VERIFIED', cx - 200, H / 2 - 50, { width: 400, align: 'center', lineBreak: false });
      doc.restore();

      // ── "VERIFIED AUTHENTIC" seal (top-right corner) ──────────────────────
      doc.save();
      doc.circle(W - BORDER - 45, BORDER + 45, 36).fillAndStroke('#fef3c7', '#f59e0b');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#92400e');
      doc.text('VERIFIED', W - BORDER - 80, BORDER + 34, { width: 72, align: 'center', lineBreak: false });
      doc.text('AUTHENTIC', W - BORDER - 80, BORDER + 46, { width: 72, align: 'center', lineBreak: false });
      doc.restore();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// @desc    Preview a completion certificate without saving to DB (no cert ID shown)
// @route   GET /api/certificates/preview-completion/:opportunityId
// @access  Private (volunteer who attended)
exports.previewCompletion = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const opportunity = await Opportunity.findById(req.params.opportunityId);
  if (!opportunity) return next(new ErrorResponse('Opportunity not found', 404));

  const volEntry = opportunity.volunteers.find(v => v.user.toString() === userId.toString());
  if (!volEntry || !['attended', 'confirmed'].includes(volEntry.status)) {
    return next(new ErrorResponse('Certificate not available — you must have attended this event', 403));
  }

  const user = await User.findById(userId).select('name email profile stats');
  if (!user) return next(new ErrorResponse('User not found', 404));

  const hours = volEntry.hoursLogged || 0;
  const skills = user.profile?.skills || [];
  let achievementLevel = 'bronze';
  if (hours >= 100) achievementLevel = 'platinum';
  else if (hours >= 50) achievementLevel = 'gold';
  else if (hours >= 20) achievementLevel = 'silver';

  res.json({
    success: true,
    data: {
      recipientName: user.name,
      recipientEmail: user.email,
      issuerName: 'UNITEE Platform',
      title: `Volunteer Completion — ${opportunity.title}`,
      opportunityTitle: opportunity.title,
      issuedDate: new Date(),
      metrics: {
        hoursCompleted: hours,
        skillsAcquired: skills,
        achievementLevel,
      },
      isPreviewing: true, // no cert ID yet — only generated on download
    },
  });
});

// @desc    Download completion certificate PDF — saves to DB on first download
// @route   GET /api/certificates/download-completion/:opportunityId
// @access  Private (volunteer who attended)
exports.downloadCompletion = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const opportunity = await Opportunity.findById(req.params.opportunityId);
  if (!opportunity) return next(new ErrorResponse('Opportunity not found', 404));

  const volEntry = opportunity.volunteers.find(v => v.user.toString() === userId.toString());
  if (!volEntry || !['attended', 'confirmed'].includes(volEntry.status)) {
    return next(new ErrorResponse('Certificate not available', 403));
  }

  const user = await User.findById(userId).select('name email profile stats');
  if (!user) return next(new ErrorResponse('User not found', 404));

  // Idempotent: reuse existing cert if already downloaded before
  let cert = await Certificate.findOne({ recipientId: userId, opportunityId: opportunity._id, type: 'volunteer_completion' });

  if (!cert) {
    const hours = volEntry.hoursLogged || 0;
    const skills = user.profile?.skills || [];
    let achievementLevel = 'bronze';
    if (hours >= 100) achievementLevel = 'platinum';
    else if (hours >= 50) achievementLevel = 'gold';
    else if (hours >= 20) achievementLevel = 'silver';

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

    cert = await Certificate.generateCertificate({
      type: 'volunteer_completion',
      title: `Volunteer Completion — ${opportunity.title}`,
      description: `Certificate of volunteer completion for "${opportunity.title}".`,
      recipientId: userId,
      recipientName: user.name,
      recipientEmail: user.email,
      issuerId: opportunity.createdBy,
      issuerName: 'UNITEE Platform',
      issuerType: 'ngo',
      opportunityId: opportunity._id,
      opportunityTitle: opportunity.title,
      hoursCompleted: hours,
      skillsAcquired: skills,
      achievementLevel,
    });

    cert.verificationUrl = `${frontendUrl}/verify/${cert.certificateId}`;
    cert.pdfGenerated = true;
    await cert.save();
  }

  cert.downloadCount += 1;
  await cert.save();

  // Fetch issuer's brand color (stored in metadata when cert was bulk-issued, or from issuer's profile)
  let accentColor = cert.metadata?.accentColor;
  if (!accentColor && cert.issuerId) {
    try {
      const issuerUser = await User.findById(cert.issuerId).select('organizationBrandColor');
      accentColor = issuerUser?.organizationBrandColor;
    } catch { /* non-fatal */ }
  }

  const pseudoCert = {
    recipientName: cert.recipientName,
    title: cert.title,
    opportunityTitle: cert.opportunityTitle,
    hoursCompleted: cert.hoursCompleted,
    skillsAcquired: cert.skillsAcquired,
    achievementLevel: cert.achievementLevel,
    issuerName: cert.issuerName,
    issuedDate: cert.issuedDate,
    certificateId: cert.certificateId,
    verificationUrl: cert.verificationUrl,
    accentColor: accentColor || '#f97316',
    photoBuffer: null,
  };

  const pdfBuffer = await generateCertificatePDF(pseudoCert);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename="UNITEE-Certificate-${cert.certificateId}.pdf"`);
  res.send(pdfBuffer);
});

// @desc    Get all certificates (admin) with search + date filter
// @route   GET /api/certificates/all
// @access  Private (Admin)
exports.getAllCertificates = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const { search, date, type, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search) {
    const rx = new RegExp(search, 'i');
    query.$or = [
      { certificateId: rx },
      { recipientName: rx },
      { recipientEmail: rx },
      { opportunityTitle: rx },
    ];
  }

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.issuedDate = { $gte: start, $lte: end };
  }

  if (type) query.type = type;

  const total = await Certificate.countDocuments(query);
  const certificates = await Certificate.find(query)
    .populate('recipientId', 'name email')
    .populate('issuerId', 'name organizationName')
    .populate('opportunityId', 'title category')
    .sort({ issuedDate: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    data: certificates,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
  });
});

module.exports = {
  generateCertificate: exports.generateCertificate,
  verifyCertificate: exports.verifyCertificate,
  getUserCertificates: exports.getUserCertificates,
  downloadCertificate: exports.downloadCertificate,
  revokeCertificate: exports.revokeCertificate,
  getCertificateStats: exports.getCertificateStats,
  getMyPassport: exports.getMyPassport,
  downloadMyPassport: exports.downloadMyPassport,
  previewCompletion: exports.previewCompletion,
  downloadCompletion: exports.downloadCompletion,
  getAllCertificates: exports.getAllCertificates,
};