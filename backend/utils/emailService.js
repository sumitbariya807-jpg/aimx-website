const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const sendRegistrationEmail = async (participant) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('SMTP not configured. Registration email skipped.');
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM || process.env.SMTP_USER;
  const html = `
    <h2>AIMX 2026 Event Notification</h2>
    <p>Hello ${participant.name},</p>
    <p><strong>Participant ID:</strong> ${participant.participantId}</p>
    <p><strong>Event:</strong> ${participant.eventName} - ${participant.eventSubname}</p>
    <p><strong>College:</strong> ${participant.college}</p>
    <p><strong>Amount Paid:</strong> ₹${participant.amount}</p>
    <p><strong>Transaction ID:</strong> ${participant.transactionId}</p>
    <p><strong>Status:</strong> ${String(participant.status || 'pending').toUpperCase()}</p>
    <p>Thank you for participating in AIMX 2026.</p>
    <p>AIMX Team</p>
  `;

  await transporter.sendMail({
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX 2026 Update - ${participant.participantId}`,
    html
  });

  console.log(`✅ Registration email sent to ${participant.email} (admin copy: ${adminEmail})`);
  return true;
};

const sendStatusEmail = async (participant, status) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('SMTP not configured. Status email skipped.');
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM || process.env.SMTP_USER;
  const statusLabel = status.toUpperCase();
  const statusText = status === 'approved'
    ? 'Your registration has been ACCEPTED by admin.'
    : 'Your registration has been REJECTED by admin.';

  const html = `
    <h2>AIMX 2026 Registration Status Update</h2>
    <p>Hello ${participant.name},</p>
    <p>Your registration status is now: <strong>${statusLabel}</strong></p>
    <p>${statusText}</p>
    <p><strong>Participant ID:</strong> ${participant.participantId}</p>
    <p><strong>Event:</strong> ${participant.eventName} - ${participant.eventSubname}</p>
    <p>Thank you,<br/>AIMX Team</p>
  `;

  await transporter.sendMail({
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX 2026 Registration ${statusLabel}`,
    html
  });

  console.log(`✅ Status email (${statusLabel}) sent to ${participant.email} (admin copy: ${adminEmail})`);
  return true;
};

module.exports = { sendRegistrationEmail, sendStatusEmail };
