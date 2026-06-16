const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const base = (content) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);padding:28px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">UNITEE</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Volunteer Community Action</p>
    </div>
    <div style="padding:36px 40px;">${content}</div>
    <div style="background:#f8fafc;padding:18px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">© 2025 UNITEE · Empowering communities across Cameroon</p>
    </div>
  </div>
</body></html>`;

/**
 * Send a transactional email. Always fire-and-forget — never throw.
 */
const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    await transporter.sendMail({
      from: `"UNITEE Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: base(html),
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const templates = {
  applicationAccepted: ({ volunteerName, opportunityTitle, orgName, dashboardUrl }) => ({
    subject: `🎉 You're in — ${opportunityTitle}`,
    html: `
      <h2 style="color:#111827;margin:0 0 8px;">You've been accepted!</h2>
      <p style="color:#374151;margin:0 0 20px;">Hi ${volunteerName},<br><br>
        <strong>${orgName}</strong> has accepted your application for <strong>${opportunityTitle}</strong>.
        We look forward to seeing you there.
      </p>
      <a href="${dashboardUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        View My Opportunities →
      </a>
      <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">
        You'll receive a reminder closer to the event date.
      </p>`,
  }),

  certificateIssued: ({ volunteerName, opportunityTitle, orgName, hoursLogged, certificateId, verifyUrl, downloadUrl }) => ({
    subject: `🎓 Your certificate is ready — ${opportunityTitle}`,
    html: `
      <h2 style="color:#111827;margin:0 0 8px;">Your certificate is ready!</h2>
      <p style="color:#374151;margin:0 0 8px;">Hi ${volunteerName},</p>
      <p style="color:#374151;margin:0 0 20px;">
        <strong>${orgName}</strong> has issued your completion certificate for
        <strong>${opportunityTitle}</strong>${hoursLogged ? ` (${hoursLogged} hours)` : ''}.
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Certificate ID</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;font-family:monospace;">${certificateId}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Anyone can verify this at <a href="${verifyUrl}" style="color:#f97316;">${verifyUrl}</a></p>
      </div>
      <a href="${downloadUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-right:12px;">
        Download Certificate →
      </a>
      <a href="${verifyUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Verify Online
      </a>`,
  }),
};

module.exports = { sendEmail, templates };
