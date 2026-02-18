const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const PDFDocument = require('pdfkit');
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

// Helper function to generate PDF certificate
async function generateCertificatePDF(certificate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background and border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
         .stroke('#2563eb', 3);

      doc.rect(50, 50, pageWidth - 100, pageHeight - 100)
         .stroke('#e5e7eb', 1);

      // Header
      doc.fontSize(32)
         .fillColor('#1e40af')
         .text('CERTIFICATE OF ACHIEVEMENT', 0, 100, { align: 'center' });

      doc.fontSize(16)
         .fillColor('#6b7280')
         .text('UNITEE Volunteer Platform', 0, 140, { align: 'center' });

      // Main content
      doc.fontSize(18)
         .fillColor('#374151')
         .text('This is to certify that', 0, 200, { align: 'center' });

      doc.fontSize(28)
         .fillColor('#1f2937')
         .text(certificate.recipientName, 0, 240, { align: 'center' });

      doc.fontSize(16)
         .fillColor('#374151')
         .text(`has successfully completed`, 0, 290, { align: 'center' });

      doc.fontSize(22)
         .fillColor('#1e40af')
         .text(certificate.title, 0, 320, { align: 'center' });

      if (certificate.opportunityTitle) {
        doc.fontSize(14)
           .fillColor('#6b7280')
           .text(`Related to: ${certificate.opportunityTitle}`, 0, 360, { align: 'center' });
      }

      // Metrics
      let yPos = 400;
      if (certificate.hoursCompleted > 0) {
        doc.fontSize(14)
           .fillColor('#374151')
           .text(`Hours Completed: ${certificate.hoursCompleted}`, 0, yPos, { align: 'center' });
        yPos += 25;
      }

      if (certificate.skillsAcquired && certificate.skillsAcquired.length > 0) {
        doc.text(`Skills Acquired: ${certificate.skillsAcquired.join(', ')}`, 0, yPos, { align: 'center' });
        yPos += 25;
      }

      // Date and signature area
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`Issued on: ${certificate.issuedDate.toLocaleDateString()}`, 100, pageHeight - 150);

      doc.text(`Issued by: ${certificate.issuerName}`, 100, pageHeight - 130);

      // Certificate ID and verification
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text(`Certificate ID: ${certificate.certificateId}`, 100, pageHeight - 100);

      doc.text(`Verification URL: ${certificate.verificationUrl}`, 100, pageHeight - 85);

      doc.text(`Verification Hash: ${certificate.verificationHash.substring(0, 32)}...`, 100, pageHeight - 70);

      // QR Code placeholder (you can integrate a QR code library here)
      doc.rect(pageWidth - 150, pageHeight - 150, 100, 100)
         .stroke('#e5e7eb');

      doc.fontSize(8)
         .text('QR Code', pageWidth - 125, pageHeight - 95, { align: 'center' });

      doc.text('Scan to verify', pageWidth - 135, pageHeight - 85, { align: 'center' });

      // Watermark
      doc.fontSize(60)
         .fillColor('#f3f4f6')
         .text('UNITEE', 0, pageHeight / 2 - 30, { 
           align: 'center',
           opacity: 0.1
         });

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