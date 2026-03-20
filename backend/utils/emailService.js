const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  console.log('📧 SMTP Config:', {
    host: host ? `${host}:${port}` : 'MISSING',
    user: user ? `${user.split('@')[0]}@***.com` : 'MISSING',
    hasPass: !!pass,
    mailFrom: from || 'unset',
    adminEmail: process.env.ADMIN_EMAIL || 'unset'
  });

  if (!host || !user || !pass) {
    console.error('❌ SMTP missing required env vars - emails DISABLED');
    return null;
  }

  const transporter = nodemailer.createTransporter({
    host,
    port,
    secure: port === 465,
    auth: { 
      user, 
      pass 
    },
    // Render timeout optimizations
    connectionTimeout: 60000,  // 60s cold start tolerance
    greetingTimeout: 30000,    // SMTP greeting
    socketTimeout: 60000,      // Keep-alive
    // Connection pooling for multiple emails
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Rate limiting
    rateDelta: 10000,  // 10s window
    rateLimit: 10,     // 10 emails/10s
    // Debug (Render logs show if dev env)
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development'
  });

  // Async connection test (non-blocking)
  transporter.verify((error, success) => {
    if (error) {
      console.error('⚠️ SMTP verify FAILED:', error.code || error.message);
    } else {
      console.log('✅ SMTP ready - Gmail/587 verified');
    }
  });

  return transporter;
};

// Retry wrapper for Render flakiness
const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Email attempt ${attempt}/${maxRetries} to ${mailOptions.to}`);
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} FAILED:`, {
        to: mailOptions.to,
        code: error.code,
        message: error.message,
        response: error.responseCode || 'no-response'
      });
      
      if (attempt === maxRetries) return false;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

const sendRegistrationEmail = async (participant) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP unavailable. Registration email skipped.');
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@aimx.com';

  let qrImage = '';
  try {
    qrImage = await QRCode.toDataURL(participant.participantId);
    console.log(`✅ QR OK for ${participant.participantId}`);
  } catch (err) {
    console.error('QR error:', err.message);
    qrImage = '';
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
    <h1 style="margin: 0;">🎫 AIMX 2026 Registration</h1>
  </div>
  <div style="padding: 30px; background: #f8f9fa;">
    <p>Hello <strong>${participant.name}</strong>,</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><td><strong>Mobile:</strong></td><td>${participant.phone}</td></tr>
      <tr><td><strong>College:</strong></td><td>${participant.college}</td></tr>
      <tr><td><strong>Event:</strong></td><td>${participant.eventName} (${participant.eventId})</td></tr>
      <tr><td><strong>ID:</strong></td><td>${participant.participantId}</td></tr>
      <tr><td><strong>Status:</strong></td><td>${(participant.status || 'pending').toUpperCase()}</td></tr>
      ${participant.teamName ? `<tr><td><strong>Team:</strong></td><td>${participant.teamName}</td></tr>` : ''}
    </table>
    
    ${qrImage ? `
    <div style="text-align: center; background: #e8f5e8; padding: 20px; border-radius: 12px; border: 3px solid #28a745;">
      <h3>📱 Your QR Ticket (Scan at Entry)</h3>
      <img src="${qrImage}" style="width: 220px; height: 220px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);" />
      <p style="color: #155724; font-weight: 600;">Pending? Wait for admin approval.</p>
    </div>` : '<p style="color: orange;">QR coming after verification...</p>'}
    
    <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
    <p style="color: #666; font-size: 14px;">AIMX 2026 Team<br><em>Events • Tech • Community</em></p>
  </div>
</body>
</html>`;

  const mailOptions = {
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX 2026 | ${participant.participantId} - Registration Confirmed`,
    html,
    headers: { 'X-Mailer': 'AIMX-v2' }
  };

  return await sendEmailWithRetry(transporter, mailOptions, 3);
};

const sendStatusEmail = async (participant, status) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP unavailable. Status email skipped.');
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@aimx.com';
  const statusLabel = status.toUpperCase();
  const statusEmoji = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' 
    ? 'Your registration has been APPROVED! 🎉 Show QR at entry.' 
    : 'Registration REJECTED. Contact support@aimx.com';

  let qrImage = '';
  if (status === 'approved') {
    try {
      qrImage = await QRCode.toDataURL(participant.participantId);
    } catch (err) {
      console.error('Status QR error:', err.message);
    }
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="padding: 20px; background: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; color: ${status === 'approved' ? '#155724' : '#721c24'}; text-align: center;">
    <h1>${statusEmoji} ${statusLabel} Update</h1>
  </div>
  <div style="padding: 30px; background: #f8f9fa;">
    <p>Hello <strong>${participant.name}</strong>,</p>
    <p style="font-size: 18px; font-weight: bold; color: ${status === 'approved' ? '#28a745' : '#dc3545'};">
      ${statusText}
    </p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td><strong>Event:</strong></td><td>${participant.eventName}</td></tr>
      <tr><td><strong>ID:</strong></td><td>${participant.participantId}</td></tr>
      ${participant.teamName ? `<tr><td><strong>Team:</strong></td><td>${participant.teamName}</td></tr>` : ''}
    </table>
    
    ${qrImage ? `
    <div style="text-align: center; margin: 30px 0; padding: 25px; background: #d4edda; border-radius: 15px; border: 4px solid #28a745;">
      <h3>✅ Entry QR Code</h3>
      <img src="${qrImage}" style="width: 240px; height: 240px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />
      <p style="color: #155724; font-weight: 600; margin-top: 15px;">Event staff will scan this</p>
    </div>` : ''}
    
    <p style="color: #666;">AIMX Team | support@aimx.com</p>
  </div>
</body>
</html>`;

  const mailOptions = {
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX 2026 | ${participant.participantId} - ${statusLabel}`,
    html,
    headers: { 'X-Mailer': 'AIMX-v2' }
  };

  return await sendEmailWithRetry(transporter, mailOptions, 3);
};

module.exports = { sendRegistrationEmail, sendStatusEmail };

