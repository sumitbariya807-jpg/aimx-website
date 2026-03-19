
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

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

  let qrImage = '';
  try {
    const qrData = participant.participantId;
    qrImage = await QRCode.toDataURL(qrData);
    console.log(`✅ QR generated for ${participant.participantId}`);
  } catch (err) {
    console.error('QR generation error in registration email:', err.message);
    qrImage = '';
  }

  const html = `
    <h2>AIMX 2026 Event Notification</h2>
    <p>Hello ${participant.name},</p>
    <p><strong>Mobile:</strong> ${participant.phone}</p>
    <p><strong>College:</strong> ${participant.college}</p>
    <p><strong>Event:</strong> ${participant.eventName} (${participant.eventId})</p>
    <p><strong>Amount Paid:</strong> ₹${participant.amount}</p>
    <p><strong>Transaction ID:</strong> ${participant.transactionId}</p>
    <p><strong>Status:</strong> ${String(participant.status || 'pending').toUpperCase()}</p>
    ${participant.teamName ? `<p><strong>Team Name:</strong> ${participant.teamName}</p>` : ''}
    ${participant.teamMembers && participant.teamMembers.length > 1 ? 
      '<h3>Team Members:</h3>' + participant.teamMembers.map((member, i) => `<p>Member ${i+1}: ${member.name} (${member.email})</p>`).join('') : ''}
    
    ${qrImage ? `
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #007bff;">
        <h3 style="color: #007bff;">🎫 Your Registration QR Ticket</h3>
        <img src="${qrImage}" width="220" height="220" alt="AIMX 2026 QR Ticket" style="border: 2px solid #007bff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
        <p style="font-size: 14px; color: #495057; margin-top: 15px; font-weight: 500;">Show this QR at event entry (after admin approval).</p>
        <p style="font-size: 13px; color: #6c757d;">Pending approval? Track status in email updates.</p>
      </div>
    ` : '<p>QR ticket coming soon after verification!</p>'}
    
    <p>Thank you for participating in AIMX 2026.</p>
    <p>AIMX Team</p>
  `;

  await transporter.sendMail({
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX 2026 Update - ${participant.participantId}`,
    html,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });

  console.log(`✅ Registration email sent to ${participant.email} (admin copy: ${adminEmail}) ${qrImage ? 'with QR' : '(no QR)'}`);
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
    ? 'Your registration has been APPROVED.'

    : 'Your registration has been REJECTED by admin.';

  let qrImage = '';
  if (status === 'approved') {
    try {
      const qrData = participant.participantId;
      qrImage = await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('QR generation error:', err);
      qrImage = '';
    }
  }

  const html = `
    <h2>AIMX 2026 Registration Status Update</h2>
    <p>Hello ${participant.name},</p>
    <p><strong>Mobile:</strong> ${participant.phone}</p>
    <p><strong>College:</strong> ${participant.college}</p>
    <p>Your registration status is now: <strong>${statusLabel}</strong></p>
  <p>${statusText}</p>
    <p><strong>Participant ID:</strong> ${participant.participantId}</p>
    ${qrImage ? `
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #28a745;">
        <h3 style="color: #28a745;">✅ Your Entry QR Ticket</h3>
        <img src="${qrImage}" width="220" height="220" alt="AIMX 2026 QR Ticket" style="border: 2px solid #007bff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
        <p style="font-size: 14px; color: #495057; margin-top: 15px; font-weight: 500;">Please show this QR code at the event entry gate.</p>
        <p style="font-size: 13px; color: #6c757d;">Event staff will scan this QR for verification. No ticket? Contact AIMX Team.</p>
      </div>
    ` : ''}
    <p><strong>Event:</strong> ${participant.eventName} (${participant.eventId})</p>
    ${participant.teamName ? `<p><strong>Team Name:</strong> ${participant.teamName}</p>` : ''}
    ${participant.teamMembers && participant.teamMembers.length > 1 ? 
      '<h3>Team Members:</h3>' + participant.teamMembers.map((member, i) => `<p>Member ${i+1}: ${member.name} (${member.email})</p>`).join('') : ''}
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

