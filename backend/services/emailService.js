const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"TrustHire" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

// ── Welcome Email ─────────────────────────────────────────────────────────────
const sendWelcomeEmail = (user) => {
  const roleNote = user.role === 'Recruiter'
    ? `<p>As a <strong>Recruiter</strong>, you can post jobs, manage applicants, and conduct interviews through our trust-driven platform.</p>`
    : `<p>As a <strong>Candidate</strong>, your applications are protected by our escrow system — your challenge fee is fully refunded if you are rejected or hired.</p>`;

  return sendMail({
    to: user.email,
    subject: '🎉 Welcome to TrustHire!',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 40px 32px; text-align: center;">
          <h1 style="color: #fff; font-size: 28px; margin: 0; letter-spacing: -0.5px;">Welcome to TrustHire!</h1>
          <p style="color: rgba(255,255,255,0.85); margin-top: 10px; font-size: 15px;">The Trust-Driven Hiring Platform</p>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1e293b; font-size: 20px;">Hi ${user.name}! 👋</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for signing up! Your account has been successfully created.</p>
          ${roleNote}
          <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #15803d; font-weight: 600; font-size: 15px;">🔒 Your TrustScore: ${user.trustScore} points</p>
            <p style="margin: 6px 0 0; color: #166534; font-size: 13px;">Build your reputation by completing applications and interviews fairly.</p>
          </div>
          <a href="http://localhost:5173/dashboard" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 8px;">Go to Dashboard →</a>
        </div>
        <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">© 2025 TrustHire · Trust-Driven Hiring · <a href="http://localhost:5173" style="color: #6366f1;">Visit Platform</a></p>
        </div>
      </div>
    `,
  });
};

// ── Login Notification Email ──────────────────────────────────────────────────
const sendLoginEmail = (user) => {
  return sendMail({
    to: user.email,
    subject: '🔐 TrustHire: New Login Detected',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 32px; text-align: center;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">Successful Login</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1e293b; font-size: 18px;">Hi ${user.name},</h2>
          <p style="color: #475569; line-height: 1.6;">This is a quick confirmation that you've just signed in to your TrustHire account.</p>
          <div style="background: #f1f5f9; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 13px;">If this wasn't you, please reset your password immediately using the "Forgot Password" link on the login page.</p>
          </div>
          <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #1e293b; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to Dashboard</a>
        </div>
        <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 TrustHire · Safety First</p>
        </div>
      </div>
    `,
  });
};

// ── OTP Email ─────────────────────────────────────────────────────────────────
const sendOTPEmail = (user, otp) => {
  return sendMail({
    to: user.email,
    subject: '🔐 Your TrustHire Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 40px 32px; text-align: center;">
          <h1 style="color: #fff; font-size: 26px; margin: 0;">Password Reset Request</h1>
          <p style="color: rgba(165,180,252,0.9); margin-top: 10px; font-size: 14px;">TrustHire Security</p>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1e293b; font-size: 20px;">Hi ${user.name},</h2>
          <p style="color: #475569; line-height: 1.6;">We received a request to reset your password. Use the OTP below to proceed. It expires in <strong>10 minutes</strong>.</p>
          <div style="background: #eef2ff; border: 2px solid #c7d2fe; border-radius: 14px; padding: 28px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <p style="margin: 0; font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #1e293b;">${otp}</p>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
        </div>
        <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">© 2025 TrustHire · Never share your OTP with anyone.</p>
        </div>
      </div>
    `,
  });
};

// ── Application Status Email ──────────────────────────────────────────────────
const sendApplicationStatusEmail = (candidate, job, status, refundStatus) => {
  const statusMap = {
    Applied:      { emoji: '📨', color: '#f59e0b', title: 'Application Received!', msg: 'Your application has been submitted successfully. The escrow fee has been securely locked.' },
    Shortlisted:  { emoji: '⭐', color: '#4f46e5', title: 'You\'ve Been Shortlisted!', msg: 'Great news! The recruiter has shortlisted you for an interview. Get ready!' },
    Hired:        { emoji: '🎉', color: '#16a34a', title: 'Congratulations — You\'re Hired!', msg: 'Amazing! The recruiter has officially selected you for this position. Your challenge fee has been refunded.' },
    Rejected:     { emoji: '❌', color: '#dc2626', title: 'Application Update', msg: 'Unfortunately, the recruiter has decided not to proceed with your application at this time. Your challenge fee has been refunded.' },
    Disputed:     { emoji: '⚠️', color: '#f59e0b', title: 'Dispute Submitted', msg: 'Your dispute has been raised and is under review by our admin team. We will update you with the outcome.' },
    Resolved:     { emoji: '✅', color: '#0891b2', title: 'Dispute Resolved', msg: 'Your dispute has been resolved by the TrustHire admin team. Please check your dashboard for the final outcome.' },
  };

  const s = statusMap[status] || { emoji: '📋', color: '#64748b', title: 'Application Update', msg: `Your application status has been updated to: ${status}` };

  const refundBadge = refundStatus === 'Refunded'
    ? `<div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:14px 20px;margin:16px 0;color:#15803d;font-weight:600;font-size:14px;">💰 Refund Status: <strong>Refunded</strong> — Your escrow fee has been returned.</div>`
    : refundStatus === 'Forfeited'
    ? `<div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;padding:14px 20px;margin:16px 0;color:#dc2626;font-weight:600;font-size:14px;">⚠️ Refund Status: <strong>Forfeited</strong> — Escrow fee was forfeited due to no-show.</div>`
    : `<div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:10px;padding:14px 20px;margin:16px 0;color:#c2410c;font-weight:600;font-size:14px;">⏳ Refund Status: <strong>Pending</strong> — Your escrow fee is held securely.</div>`;

  return sendMail({
    to: candidate.email,
    subject: `${s.emoji} TrustHire: ${s.title} — ${job.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 40px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">${s.emoji}</div>
          <h1 style="color: #fff; font-size: 24px; margin: 0;">${s.title}</h1>
          <p style="color: rgba(165,180,252,0.9); margin-top: 8px; font-size: 14px;">${job.title} ${job.companyName ? `@ ${job.companyName}` : ''}</p>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1e293b; font-size: 18px;">Hi ${candidate.name},</h2>
          <p style="color: #475569; line-height: 1.6; font-size: 15px;">${s.msg}</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 6px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Application Details</p>
            <p style="margin: 4px 0; color: #1e293b; font-size: 15px;"><strong>Position:</strong> ${job.title}</p>
            ${job.companyName ? `<p style="margin: 4px 0; color: #1e293b; font-size: 15px;"><strong>Company:</strong> ${job.companyName}</p>` : ''}
            <p style="margin: 4px 0; color: #1e293b; font-size: 15px;"><strong>Status:</strong> <span style="color:${s.color};font-weight:700;">${status}</span></p>
          </div>
          ${refundBadge}
          <a href="http://localhost:5173/dashboard" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 12px;">View Dashboard →</a>
        </div>
        <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">© 2025 TrustHire · Trust-Driven Hiring Platform</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendLoginEmail, sendOTPEmail, sendApplicationStatusEmail };
