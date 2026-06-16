const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { checkAndAwardBadges } = require('../utils/badgeSystem');
const { sendEmail, templates } = require('../utils/email');

// @desc      Get organizer stats
// @route     GET /api/organizer/stats
// @access    Private (Organizer only)
exports.getStats = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const organizerId = req.user._id;

  // Get active opportunities count
  const activeOpportunities = await Opportunity.countDocuments({
    createdBy: organizerId,
    status: { $in: ['published'] }
  });

  // Get total applicants count
  const totalApplicants = await Application.countDocuments({
    opportunity: {
      $in: await Opportunity.find({ createdBy: organizerId }).select('_id')
    }
  });

  // Get total views count
  const opportunities = await Opportunity.find({ createdBy: organizerId });
  const totalViews = opportunities.reduce((sum, opp) => sum + opp.views, 0);

  // Get completed events count
  const completedEvents = await Opportunity.countDocuments({
    createdBy: organizerId,
    status: 'completed'
  });

  // Total hours volunteered across all events
  const hoursAgg = await Opportunity.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(organizerId) } },
    { $unwind: { path: '$volunteers', preserveNullAndEmptyArrays: false } },
    { $match: { 'volunteers.status': 'attended' } },
    { $group: { _id: null, total: { $sum: '$volunteers.hoursLogged' } } },
  ]);
  const totalHours = Math.round((hoursAgg[0]?.total ?? 0) * 10) / 10;

  // Certificates issued by this organizer
  const totalCertificates = await Certificate.countDocuments({ issuerId: organizerId });

  res.status(200).json({
    success: true,
    data: {
      activeOpportunities,
      totalApplicants,
      totalViews,
      completedEvents,
      totalHours,
      totalCertificates,
    }
  });
});

// @desc      Get organizer opportunities
// @route     GET /api/organizer/opportunities
// @access    Private (Organizer only)
exports.getOpportunities = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.query;
  const query = { createdBy: req.user._id };

  if (status) {
    query.status = status;
  }

  const opportunities = await Opportunity.find(query).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities
  });
});

// @desc      Get applications for organizer's opportunities
// @route     GET /api/organizer/applications
// @access    Private (Organizer only)
exports.getApplications = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status, opportunityId } = req.query;
  
  // Find opportunities created by this organizer
  const opportunities = await Opportunity.find({ createdBy: req.user._id });
  const opportunityIds = opportunities.map(opp => opp._id);

  const query = { opportunity: { $in: opportunityIds } };

  if (status) {
    query.status = status;
  }

  if (opportunityId) {
    query.opportunity = opportunityId;
  }

  const applications = await Application.find(query)
    .populate({
      path: 'volunteer',
      model: 'User',
      select: 'name email profile stats'
    })
    .populate('opportunity', 'title description dateTime location')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc      Update application status
// @route     PATCH /api/organizer/applications/:id
// @access    Private (Organizer only)
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status. Must be accepted or rejected.', 400));
  }

  // Find the application
  let application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check if the opportunity belongs to this organizer
  const opportunity = await Opportunity.findById(application.opportunity);
  if (!opportunity || opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this application', 403));
  }

  // Update the application status
  application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate({ path: 'volunteer', model: 'User', select: 'name email profile stats' })
   .populate('opportunity', 'title description');

  // When accepting, add volunteer to opportunity.volunteers if not already there
  if (status === 'accepted') {
    const volunteerId = application.volunteer?._id ?? application.volunteer;
    if (volunteerId) {
      const alreadyIn = opportunity.volunteers.some(v => v.user.toString() === volunteerId.toString());
      if (!alreadyIn) {
        opportunity.volunteers.push({ user: volunteerId, status: 'registered' });
        await opportunity.save();
      }
    }
  }

  // Notify the volunteer — try both User and Volunteer collections
  try {
    const volunteerId = application.volunteer?._id ?? application.volunteer;
    if (volunteerId) {
      const notifTitle = status === 'accepted'
        ? '🎉 Application Accepted'
        : 'Application Update';
      const notifMsg = status === 'accepted'
        ? `Your application for "${application.opportunity?.title}" has been accepted. We look forward to seeing you!`
        : `Your application for "${application.opportunity?.title}" was not accepted this time. Keep volunteering!`;

      await Notification.create({
        recipient: volunteerId,
        type: 'opportunity',
        title: notifTitle,
        message: notifMsg,
        priority: status === 'accepted' ? 'high' : 'medium',
        data: { opportunityId: application.opportunity?._id },
      });

      // Email for accepted applications only
      if (status === 'accepted') {
        const volunteerUser = await User.findById(volunteerId).select('name email').lean();
        if (volunteerUser?.email) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
          const { subject, html } = templates.applicationAccepted({
            volunteerName: volunteerUser.name,
            opportunityTitle: application.opportunity?.title || 'the event',
            orgName: req.user.organizationName || req.user.name || 'The organiser',
            dashboardUrl: `${frontendUrl}/my-opportunities`,
          });
          sendEmail(volunteerUser.email, subject, html); // fire-and-forget
        }
      }
    }
  } catch (notifErr) {
    // Non-fatal — log but don't block the response
    console.error('Notification creation failed:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc      Update opportunity status
// @route     PATCH /api/organizer/opportunities/:id/status
// @access    Private (Organizer only)
exports.updateOpportunityStatus = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status } = req.body;

  if (!['draft', 'published', 'cancelled', 'completed', 'archived'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  // Find the opportunity
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(new ErrorResponse('Opportunity not found', 404));
  }

  // Check if the opportunity belongs to this organizer
  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this opportunity', 403));
  }

  // Update the opportunity status
  opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  // Notify all registered volunteers when opportunity is cancelled
  if (status === 'cancelled') {
    const registeredVolunteers = opportunity.volunteers
      .filter(v => ['registered', 'confirmed', 'attended'].includes(v.status))
      .map(v => v.user);

    if (registeredVolunteers.length > 0) {
      Promise.allSettled(registeredVolunteers.map(uid =>
        Notification.create({
          recipient: uid,
          type: 'opportunity',
          title: 'Opportunity Cancelled',
          message: `Unfortunately, "${opportunity.title}" has been cancelled by the organizer.`,
          priority: 'high',
          data: { opportunityId: opportunity._id },
        })
      )).catch(err => console.error('Cancellation notifications failed:', err));
    }
  }

  // When marked completed, credit each attended/confirmed volunteer with the event
  // and trigger badge evaluation for each of them
  if (status === 'completed') {
    const attendedVolunteers = opportunity.volunteers
      .filter(v => ['attended', 'confirmed', 'registered'].includes(v.status))
      .map(v => v.user);

    if (attendedVolunteers.length > 0) {
      // Notify volunteers of completion
      Promise.allSettled(attendedVolunteers.map(uid =>
        Notification.create({
          recipient: uid,
          type: 'opportunity',
          title: '🎉 Event Completed!',
          message: `"${opportunity.title}" has been marked as completed. Thank you for your contribution!`,
          priority: 'medium',
          data: { opportunityId: opportunity._id },
        })
      )).catch(err => console.error('Completion notifications failed:', err));

      // Increment totalEvents for every volunteer (fire-and-forget, non-blocking)
      User.updateMany(
        { _id: { $in: attendedVolunteers } },
        { $inc: { 'stats.totalEvents': 1 } }
      ).then(async () => {
        // Check badges for each volunteer after stats are updated
        await Promise.allSettled(attendedVolunteers.map(uid => checkAndAwardBadges(uid)));

        // Notify each volunteer their certificate is ready to download (cert is saved on demand, not now)
        await Promise.allSettled(attendedVolunteers.map(uid =>
          Notification.create({
            recipient: uid,
            type: 'certificate',
            title: '🎓 Certificate Ready',
            message: `Your completion certificate for "${opportunity.title}" is ready. Visit My Opportunities to preview and download it.`,
            priority: 'high',
            data: { opportunityId: opportunity._id },
          })
        ));
      }).catch(err => console.error('Badge/cert award on completion failed:', err));
    }
  }

  res.status(200).json({
    success: true,
    data: opportunity
  });
});

// @desc      Generate opportunity content with AI
// @route     POST /api/organizer/ai-assist
// @access    Private (Organizer only)
exports.generateOpportunityContent = asyncHandler(async (req, res, next) => {
  // Verify user is an organizer
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { title, goal, location, category } = req.body;

  // Validate required fields
  if (!title || !goal || !location) {
    return next(new ErrorResponse('Title, goal, and location are required', 400));
  }

  const categoryDefaults = {
    Environment:          { volunteers: 15, hours: 4 },
    Education:            { volunteers: 10, hours: 3 },
    Healthcare:           { volunteers: 8,  hours: 5 },
    Humanitarian:         { volunteers: 20, hours: 6 },
    'Social Services':    { volunteers: 12, hours: 4 },
    'Economic Development': { volunteers: 10, hours: 3 },
  };
  const defaults = categoryDefaults[category] || { volunteers: 10, hours: 4 };

  const aiResponse = {
    description: `Join us for "${title}" — a ${category.toLowerCase()} initiative in ${location} where volunteers will ${goal.toLowerCase()}. This is a great opportunity to contribute meaningfully to your community and gain hands-on experience. All skill levels welcome.`,
    suggestedSkills: ['Communication', 'Teamwork', 'Adaptability', 'Initiative'],
    suggestedVolunteers: defaults.volunteers,
    suggestedHours: defaults.hours,
  };

  res.status(200).json({
    success: true,
    data: aiResponse
  });
});

// @desc      Get organizer profile
// @route     GET /api/organizer/profile
// @access    Private (Organizer only)
exports.getProfile = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const organizer = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    success: true,
    data: organizer
  });
});

// @desc      Get volunteers for a specific opportunity
// @route     GET /api/organizer/opportunities/:id/volunteers
// @access    Private (Organizer only)
exports.getOpportunityVolunteers = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const opportunity = await Opportunity.findById(req.params.id)
    .populate({ path: 'volunteers.user', model: 'User', select: 'name email profile stats' });

  if (!opportunity) {
    return next(new ErrorResponse('Opportunity not found', 404));
  }

  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  res.status(200).json({
    success: true,
    data: opportunity.volunteers,
  });
});

// @desc      Mark a volunteer as attended (or update their status)
// @route     PATCH /api/organizer/opportunities/:id/volunteers/:userId
// @access    Private (Organizer only)
exports.markVolunteerAttended = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied. Organizer role required.', 403));
  }

  const { status = 'attended', hours } = req.body;
  const allowed = ['registered', 'confirmed', 'attended', 'no-show'];
  if (!allowed.includes(status)) {
    return next(new ErrorResponse('Invalid volunteer status', 400));
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(new ErrorResponse('Opportunity not found', 404));
  }

  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const volunteer = opportunity.volunteers.find(
    v => v.user.toString() === req.params.userId
  );

  if (!volunteer) {
    return next(new ErrorResponse('Volunteer not found for this opportunity', 404));
  }

  volunteer.status = status;

  if (hours !== undefined) {
    const parsedHours = parseFloat(hours);
    if (!isNaN(parsedHours) && parsedHours >= 0) {
      const previousHours = volunteer.hoursLogged || 0;
      volunteer.hoursLogged = parsedHours;
      const diff = parsedHours - previousHours;
      if (diff !== 0) {
        await User.findByIdAndUpdate(req.params.userId, { $inc: { 'stats.totalHours': diff } });
      }
    }
  }

  await opportunity.save();

  if (status === 'attended') {
    try {
      await Notification.create({
        recipient: req.params.userId,
        type: 'opportunity',
        title: 'Attendance Confirmed',
        message: `Your attendance for "${opportunity.title}" has been confirmed by the organizer.`,
        priority: 'medium',
        data: { opportunityId: opportunity._id },
      });
      await checkAndAwardBadges(req.params.userId);
    } catch (err) {
      console.error('Attendance notification/badge check failed:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    data: { userId: req.params.userId, status, hoursLogged: volunteer.hoursLogged },
  });
});

// @desc      Bulk mark attendance for all volunteers in one request
// @route     POST /api/organizer/opportunities/:id/bulk-attendance
// @access    Private (Organizer only)
exports.bulkMarkAttended = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied', 403));
  }

  const { attendances } = req.body;
  if (!Array.isArray(attendances) || attendances.length === 0) {
    return next(new ErrorResponse('attendances array is required', 400));
  }

  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return next(new ErrorResponse('Opportunity not found', 404));
  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const attendedUserIds = [];

  for (const item of attendances) {
    const vol = opportunity.volunteers.find(v => v.user.toString() === item.userId);
    if (!vol) continue;

    const newStatus = item.status || 'attended';
    const newHours = parseFloat(item.hours);

    vol.status = newStatus;

    if (!isNaN(newHours) && newHours >= 0) {
      const previousHours = vol.hoursLogged || 0;
      vol.hoursLogged = newHours;
      const diff = newHours - previousHours;
      if (diff !== 0) {
        await User.findByIdAndUpdate(item.userId, { $inc: { 'stats.totalHours': diff } });
      }
    }

    if (newStatus === 'attended') attendedUserIds.push(item.userId);
  }

  await opportunity.save();

  // Badge checks and notifications (non-blocking)
  Promise.allSettled([
    ...attendedUserIds.map(uid => checkAndAwardBadges(uid)),
    ...attendedUserIds.map(uid =>
      Notification.create({
        recipient: uid,
        type: 'opportunity',
        title: 'Attendance Confirmed',
        message: `Your attendance for "${opportunity.title}" has been confirmed.`,
        priority: 'medium',
        data: { opportunityId: opportunity._id },
      })
    ),
  ]).catch(err => console.error('Bulk attendance post-processing failed:', err.message));

  res.json({ success: true, updated: attendances.length, attended: attendedUserIds.length });
});

// @desc      Bulk issue certificates to all attended volunteers
// @route     POST /api/organizer/opportunities/:id/issue-certificates
// @access    Private (Organizer only)
exports.bulkIssueCertificates = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied', 403));
  }

  const opportunity = await Opportunity.findById(req.params.id)
    .populate({ path: 'volunteers.user', model: 'User', select: 'name email' });
  if (!opportunity) return next(new ErrorResponse('Opportunity not found', 404));
  if (opportunity.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const issuer = await User.findById(req.user._id).select('name organizationName organizationBrandColor');
  const issuerName = issuer?.organizationName || issuer?.name || 'UNITEE';
  const issuerBrandColor = issuer?.organizationBrandColor || '#f97316';

  const attended = opportunity.volunteers.filter(v => v.status === 'attended' && v.user);

  let issued = 0;
  let skipped = 0;

  for (const vol of attended) {
    const recipient = vol.user;
    const exists = await Certificate.findOne({
      recipientId: recipient._id,
      opportunityId: opportunity._id,
      type: 'volunteer_completion',
    });

    if (exists) { skipped++; continue; }

    const hours = vol.hoursLogged || opportunity.dateTime.duration || 0;
    const cert = await Certificate.generateCertificate({
      type: 'volunteer_completion',
      title: `Certificate of Completion — ${opportunity.title}`,
      description: `This certifies that ${recipient.name} successfully volunteered for "${opportunity.title}" on ${new Date(opportunity.dateTime.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, contributing ${hours} hour${hours !== 1 ? 's' : ''} to the community.`,
      recipientId: recipient._id,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      issuerId: req.user._id,
      issuerName,
      issuerType: 'ngo',
      opportunityId: opportunity._id,
      opportunityTitle: opportunity.title,
      hoursCompleted: hours,
      metadata: {
        location: `${opportunity.location?.city || ''}, ${opportunity.location?.country || ''}`,
        category: opportunity.category,
        tags: opportunity.tags,
        accentColor: issuerBrandColor,
      },
    });

    issued++;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const verifyUrl = `${frontendUrl}/verify/${cert.certificateId}`;
    const downloadUrl = `${frontendUrl}/my-opportunities`;

    Notification.create({
      recipient: recipient._id,
      type: 'certificate',
      title: '🎓 Certificate Issued',
      message: `Your completion certificate for "${opportunity.title}" has been issued by ${issuerName}. Go to My Opportunities to download it.`,
      priority: 'high',
      data: { opportunityId: opportunity._id, certificateId: cert.certificateId },
    }).catch(err => console.error('Cert notification failed:', err.message));

    // Email — fire-and-forget
    if (recipient.email) {
      const { subject, html } = templates.certificateIssued({
        volunteerName: recipient.name,
        opportunityTitle: opportunity.title,
        orgName: issuerName,
        hoursLogged: hours,
        certificateId: cert.certificateId,
        verifyUrl,
        downloadUrl,
      });
      sendEmail(recipient.email, subject, html);
    }
  }

  res.json({ success: true, issued, skipped, total: attended.length });
});

// ── PDF helpers ───────────────────────────────────────────────────────────────
function _pdfFillText(doc, text, x, y, opts = {}) {
  doc.fontSize(opts.size || 9)
    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fillColor(opts.color || '#111827')
    .text(String(text), x, y, { width: opts.width, align: opts.align || 'left', lineBreak: false, ...opts.extra });
}

async function _fetchLogoBuffer(url) {
  if (!url) return null;
  try {
    const axios = require('axios');
    const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 4000 });
    return Buffer.from(resp.data);
  } catch { return null; }
}

// Single source of truth for impact aggregation — used by JSON, CSV, and PDF exports.
// All three formats MUST call this function so they always show identical numbers.
function _aggregateImpact(opportunities) {
  let totalVolunteers = 0, totalHours = 0;
  const breakdown = [], hoursByCategory = {};
  for (const opp of opportunities) {
    const attended = opp.volunteers.filter(v => v.status === 'attended');
    totalVolunteers += attended.length;
    for (const vol of attended) {
      const hours = vol.hoursLogged || opp.dateTime?.duration || 0;
      totalHours += hours;
      breakdown.push({
        activity: opp.title,
        date: opp.dateTime?.start ? new Date(opp.dateTime.start).toLocaleDateString('en-GB') : '',
        category: opp.category,
        city: opp.location?.city || '',
        volunteerName: vol.user?.name || 'Unknown',
        volunteerEmail: vol.user?.email || '',
        hours,
      });
      hoursByCategory[opp.category] = (hoursByCategory[opp.category] || 0) + hours;
    }
  }
  return { breakdown, hoursByCategory, totalVolunteers, totalHours: Math.round(totalHours * 10) / 10 };
}

// @desc      Generate branded PDF impact report
// @route     GET /api/organizer/impact-report/pdf
// @access    Private (Organizer only)
exports.generateImpactPdf = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied', 403));
  }

  const { startDate, endDate } = req.query;
  const organizerId = req.user._id;

  // Fetch org profile — includes brand color
  const org = await User.findById(organizerId).select(
    'name organizationName organizationLogo organizationBrandColor organizationCity organizationRegion'
  );
  const orgName = org?.organizationName || org?.name || 'Your Organisation';
  const logoBuffer = await _fetchLogoBuffer(org?.organizationLogo);
  const orgBrand = org?.organizationBrandColor || '#f97316';  // fall back to UNITEE orange

  // Identical date filter and query as getImpactReport
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  const oppQuery = { createdBy: organizerId };
  if (startDate || endDate) oppQuery['dateTime.start'] = dateFilter;

  const opportunities = await Opportunity.find(oppQuery)
    .populate({ path: 'volunteers.user', model: 'User', select: 'name email' })
    .sort({ 'dateTime.start': -1 });

  // Use the shared aggregation — same numbers as JSON/CSV exports
  const { breakdown, hoursByCategory, totalVolunteers, totalHours } = _aggregateImpact(opportunities);

  const certFilter = { issuerId: organizerId };
  if (startDate || endDate) certFilter.issuedDate = dateFilter;
  const totalCertificates = await Certificate.countDocuments(certFilter);

  const summary = {
    totalEvents: opportunities.length,
    completedEvents: opportunities.filter(o => o.status === 'completed').length,
    totalVolunteers,
    totalHours,
    totalCertificates,
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const fromStr = fmtDate(startDate) || 'inception';
  const toStr = fmtDate(endDate) || 'today';
  const periodStr = (startDate || endDate) ? `${fmtDate(startDate) || 'All time'} – ${fmtDate(endDate) || 'Today'}` : 'All time';

  // ── Layout constants ──────────────────────────────────────────────────────
  const PDFDocument = require('pdfkit');
  const BRAND  = orgBrand;            // org's own brand color, not hardcoded UNITEE orange
  const DARK   = '#111827';
  const GRAY   = '#6b7280';
  const LGRAY  = '#f9fafb';
  const BORDER = '#e5e7eb';
  const W      = 595;
  const H      = 842;
  const M      = 48;   // margin
  const CW     = W - M * 2; // content width = 499

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="unitee-impact-${Date.now()}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
  doc.pipe(res);

  let pageNum = 1;

  const drawFooter = () => {
    const fy = H - 28;
    doc.save()
      .rect(0, fy - 4, W, 32).fill('#f3f4f6')
      .fontSize(7).font('Helvetica').fillColor(GRAY)
      .text(
        `Generated by UNITEE  ·  Each certificate is individually QR-verifiable  ·  Page ${pageNum}`,
        M, fy + 4, { width: CW, align: 'center' }
      )
      .restore();
  };

  // ── PAGE 1: HEADER ────────────────────────────────────────────────────────
  // Brand band
  doc.rect(0, 0, W, 78).fill(BRAND);
  // Subtle diagonal stripe pattern
  doc.save().opacity(0.08);
  for (let i = -20; i < W + 20; i += 18) {
    doc.moveTo(i, 0).lineTo(i + 78, 78).lineWidth(10).strokeColor('#ffffff').stroke();
  }
  doc.restore();

  // Logo or org name
  if (logoBuffer) {
    try { doc.image(logoBuffer, M, 14, { width: 50, height: 50, fit: [50, 50] }); }
    catch { /* fall through to text */ }
  }
  if (!logoBuffer) {
    doc.roundedRect(M, 16, 50, 46, 4).fill('rgba(0,0,0,0.25)');
    const initials = orgName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#ffffff')
      .text(initials, M, 26, { width: 50, align: 'center' });
  }

  // Title block
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff')
    .text('Community Impact Report', M + 58, 16, { width: CW - 58, align: 'right' });
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.85)')
    .text(orgName, M + 58, 40, { width: CW - 58, align: 'right' });
  doc.fontSize(8).fillColor('rgba(255,255,255,0.7)')
    .text(`Period: ${periodStr}`, M + 58, 56, { width: CW - 58, align: 'right' });

  // "Powered by UNITEE" tag + generated date
  let y = 86;
  doc.fontSize(7).font('Helvetica').fillColor(GRAY)
    .text('Powered by UNITEE', M, y)
    .text(`Generated ${fmtDate(new Date().toISOString())}`, M, y, { width: CW, align: 'right' });

  // ── EXECUTIVE SUMMARY ─────────────────────────────────────────────────────
  y = 104;
  const execSummary = `Between ${fromStr} and ${toStr}, ${orgName} mobilised ${summary.totalVolunteers} volunteer${summary.totalVolunteers !== 1 ? 's' : ''} contributing ${summary.totalHours} hours across ${summary.totalEvents} community activit${summary.totalEvents !== 1 ? 'ies' : 'y'}, issuing ${summary.totalCertificates} verifiable certificate${summary.totalCertificates !== 1 ? 's' : ''}.`;
  doc.roundedRect(M, y, CW, 34, 4).fill('#fff7ed');
  doc.rect(M, y, 3, 34).fill(BRAND);
  doc.fontSize(9).font('Helvetica').fillColor(DARK)
    .text(execSummary, M + 10, y + 8, { width: CW - 16, align: 'justify' });
  y += 44;

  // ── KPI CALLOUTS ─────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Volunteers',  value: summary.totalVolunteers },
    { label: 'Total Hours', value: summary.totalHours },
    { label: 'Events',      value: summary.totalEvents },
    { label: 'Completed',   value: summary.completedEvents },
    { label: 'Certificates',value: summary.totalCertificates },
  ];
  const kpiW = CW / kpis.length;
  const kpiH = 58;
  kpis.forEach((kpi, i) => {
    const kx = M + i * kpiW;
    doc.roundedRect(kx + 2, y, kpiW - 4, kpiH, 4).fillAndStroke('#ffffff', BORDER);
    doc.rect(kx + 2, y, kpiW - 4, 3).fill(BRAND);
    doc.fontSize(22).font('Helvetica-Bold').fillColor(DARK)
      .text(String(kpi.value), kx + 2, y + 9, { width: kpiW - 4, align: 'center' });
    doc.fontSize(7).font('Helvetica').fillColor(GRAY)
      .text(kpi.label, kx + 2, y + 39, { width: kpiW - 4, align: 'center' });
  });
  y += kpiH + 16;

  // ── BAR CHART ─────────────────────────────────────────────────────────────
  const chartData = Object.entries(hoursByCategory).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (chartData.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
      .text('Hours by Category', M, y);
    y += 14;

    const maxH = Math.max(...chartData.map(([, h]) => h));
    const labelW = 100;
    const barAreaW = CW - labelW - 36;
    const barH = 14;
    const barGap = 7;

    chartData.forEach(([cat, hrs]) => {
      const barFill = maxH > 0 ? Math.max((hrs / maxH) * barAreaW, 2) : 0;
      // Track bg
      doc.rect(M + labelW, y, barAreaW, barH).fill('#f3f4f6');
      // Filled bar
      doc.rect(M + labelW, y, barFill, barH).fill(BRAND);
      // Category label
      doc.fontSize(8).font('Helvetica').fillColor(DARK)
        .text(cat, M, y + 3, { width: labelW - 4, align: 'left', lineBreak: false });
      // Value
      doc.fontSize(8).fillColor(GRAY)
        .text(`${hrs}h`, M + labelW + barAreaW + 4, y + 3, { width: 30, lineBreak: false });
      y += barH + barGap;
    });
    y += 8;
  }

  // ── ACTIVITY TABLE ────────────────────────────────────────────────────────
  if (breakdown.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
      .text('Volunteer Activity Breakdown', M, y);
    y += 14;

    const cols = [
      { label: 'Activity',  w: 138 },
      { label: 'Date',      w: 62 },
      { label: 'Category',  w: 86 },
      { label: 'City',      w: 64 },
      { label: 'Volunteer', w: 100 },
      { label: 'Hrs',       w: 36 },
    ];
    const tableW = cols.reduce((s, c) => s + c.w, 0); // = 486
    const rowH = 17;

    const drawHeader = (yy) => {
      doc.rect(M, yy, tableW, rowH).fill(BRAND);
      let cx = M;
      cols.forEach(col => {
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
          .text(col.label, cx + 3, yy + 5, { width: col.w - 6, lineBreak: false });
        cx += col.w;
      });
      return yy + rowH;
    };

    y = drawHeader(y);

    breakdown.forEach((row, i) => {
      if (y + rowH > H - 40) {
        drawFooter();
        pageNum++;
        doc.addPage();
        y = M;
        y = drawHeader(y);
      }
      if (i % 2 === 0) doc.rect(M, y, tableW, rowH).fill(LGRAY);
      const cells = [row.activity, row.date, row.category, row.city, row.volunteerName, `${row.hours}h`];
      let cx = M;
      cells.forEach((cell, ci) => {
        doc.fontSize(7).font('Helvetica').fillColor(DARK)
          .text(String(cell).slice(0, 28), cx + 3, y + 5, { width: cols[ci].w - 6, lineBreak: false });
        cx += cols[ci].w;
      });
      y += rowH;
    });
  } else {
    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
      .text('No attendance data recorded for this period.', M, y);
  }

  drawFooter();
  doc.end();
});

// @desc      Get impact report for organizer (JSON or CSV)
// @route     GET /api/organizer/impact-report
// @access    Private (Organizer only)
exports.getImpactReport = asyncHandler(async (req, res, next) => {
  if (req.userType !== 'organization') {
    return next(new ErrorResponse('Access denied', 403));
  }

  const { startDate, endDate, format = 'json' } = req.query;
  const organizerId = req.user._id;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const oppQuery = { createdBy: organizerId };
  if (startDate || endDate) oppQuery['dateTime.start'] = dateFilter;

  const opportunities = await Opportunity.find(oppQuery)
    .populate({ path: 'volunteers.user', model: 'User', select: 'name email' })
    .sort({ 'dateTime.start': -1 });

  // Use the shared aggregation — same numbers as PDF and CSV exports
  const { breakdown, totalVolunteers, totalHours } = _aggregateImpact(opportunities);

  const certFilter = { issuerId: organizerId };
  if (startDate || endDate) certFilter.issuedDate = dateFilter;
  const totalCertificates = await Certificate.countDocuments(certFilter);

  const summary = {
    totalEvents: opportunities.length,
    completedEvents: opportunities.filter(o => o.status === 'completed').length,
    totalVolunteers,
    totalHours: Math.round(totalHours * 10) / 10,
    totalCertificates,
    period: {
      from: startDate || null,
      to: endDate || null,
    },
  };

  if (format === 'csv') {
    const header = 'Activity,Date,Category,City,Volunteer Name,Email,Hours\n';
    const rows = breakdown.map(r =>
      `"${r.activity}","${r.date}","${r.category}","${r.city}","${r.volunteerName}","${r.volunteerEmail}",${r.hours}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="unitee-impact-${Date.now()}.csv"`);
    return res.send(header + rows);
  }

  res.json({ success: true, data: { summary, breakdown } });
});
