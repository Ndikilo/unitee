const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

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

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
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

  // Create certificate
  const certificateData = {
    type,
    title,
    description,
    recipientId,
    recipientName: recipient.full_name,
    recipientEmail: recipient.email,
    issuerId: req.user.id,
    issuerName: req.user.full_name,
    issuerType: req.user.role === 'admin' ? 'admin' : 'ngo',
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
    .populate('recipientId', 'full_name email avatar_url')
    .populate('issuerId', 'full_name organization_name')
    .populate('opportunityId', 'title category location');

  if (!certificate) {
    return next(new ErrorResponse('Certificate not found', 404));
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
          avatar: certificate.recipientId?.avatar_url
        },
        issuer: {
          name: certificate.issuerName,
          type: certificate.issuerType,
          organization: certificate.issuerId?.organization_name
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
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access these certificates', 403));
  }

  const certificates = await Certificate.find({ recipientId: userId })
    .populate('issuerId', 'full_name organization_name')
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
    .populate('recipientId', 'full_name email')
    .populate('issuerId', 'full_name organization_name')
    .populate('opportunityId', 'title category location');

  if (!certificate) {
    return next(new ErrorResponse('Certificate not found', 404));
  }

  // Check if user is authorized to download
  if (req.user.id !== certificate.recipientId._id.toString() && req.user.role !== 'admin') {
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
  if (req.user.role !== 'admin' && req.user.id !== certificate.issuerId.toString()) {
    return next(new ErrorResponse('Not authorized to revoke this certificate', 403));
  }

  await certificate.revoke(reason || 'No reason provided');

  res.status(200).json({
    success: true,
    message: 'Certificate revoked successfully'
  });
});

// @desc    Get certificate statistics
// @route   GET /api/certificates/stats
// @access  Private (Admin)
exports.getCertificateStats = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
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
      // Logo placeholder (you can add actual logo here)
      doc.save();
      doc.fillColor('#3b82f6');
      doc.fontSize(40).font('Helvetica-Bold');
      doc.text('UNITEE', centerX - 80, 80, { width: 160, align: 'center' });
      doc.restore();

      // Subtitle
      doc.fontSize(12).fillColor('#64748b').font('Helvetica');
      doc.text('Volunteer Community Action Platform', 0, 125, { align: 'center' });

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
  getCertificateStats: exports.getCertificateStats
};