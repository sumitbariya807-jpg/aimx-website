// ✅ CLEAN Resend Migration - Gmail QR CID Fixed
const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);

// 🎟️ Registration Email with QR CID (Gmail/Outlook compatible)
const sendRegistrationEmail = async (participant) => {
  try {
    console.log(`📧 Register email for ${participant.participantId} → ${participant.email}`);

    // Generate QR dataURL
    const qrData = JSON.stringify({
      id: participant.participantId,
      name: participant.name,
      event: participant.eventName,
      phone: participant.phone,
      college: participant.college
    });
    const qrImage = await QRCode.toDataURL(qrData);

    // Base64 → Buffer for CID
    const qrBuffer = Buffer.from(qrImage.replace(/^data:image\/png;base64,/, ''), 'base64');

    // Send via Resend
    const { data } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'AIMX Events <noreply@aimx.in>',
      to: participant.email,
      cc: process.env.ADMIN_EMAIL || '',
      subject: `🎫 AIMX 2026 | Registration #${participant.participantId}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AIMX Registration</title>
</head>
<body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Registration Confirmed</h1>
    <p style="opacity: 0.9;">AIMX 2026 Events</p>
  </div>
  
  <div style="padding: 40px 30px; background: #fff;">
    <h2 style="color: #333;">Hello <strong>${participant.name}</strong>!</h2>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #28a745;">
      <h3>📋 Registration Details</h3>
      <table style="width: 100%; font-size: 16px;">
        <tr><td style="padding-right: 20px; font-weight: 600;">Event:</td><td>${participant.eventName}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">ID:</td><td><strong>${participant.participantId}</strong></td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">Mobile:</td><td>${participant.phone}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">College:</td><td>${participant.college}</td></tr>
      </table>
    </div>

    <div style="text-align: center; background: #e8f5e8; padding: 30px; border-radius: 15px; margin: 30px 0; border: 3px solid #28a745;">
      <h3 style="color: #155724; margin-top: 0;">📱 Your Entry QR Code</h3>
      <img src="cid:qrcode" alt="QR Ticket" style="width: 220px; height: 220px; border-radius: 12px; box-shadow: 0 8px 25px rgba(40, 165, 69, 0.3);" />
      <p style="color: #155724; font-weight: 600; margin-top: 20px;">Pending admin approval → Show at entry</p>
    </div>

    <div style="text-align: center; padding: 25px; background: #f0f8ff; border-radius: 12px; margin: 30px 0;">
      <p style="font-size: 16px; color: #1976d2; font-weight: 500;">⏳ Status: PENDING</p>
      <p style="font-size: 14px; color: #666;">Check AIMX dashboard or contact support</p>
    </div>

    <hr style="border: none; height: 1px; background: #eee; margin: 40px 0;" />
    
    <p style="text-align: center; font-size: 14px; color: #666;">
      AIMX 2026 Team<br>
      <a href="https://aimx.in" style="color: #667eea;">aimx.in</a> | Events • Tech • Community
    </p>
  </div>
</body>
</html>`,
      attachments: [{
        filename: 'ticket-qr.png',
        content: qrBuffer,
        cid: 'qrcode'
      }]
    });

    console.log(`✅ Registration email sent: ${participant.participantId}`);
    return true;
  } catch (error) {
    console.error(`❌ Registration email failed ${participant.participantId}:`, error.message);
    return false;
  }
};

// Status notification
const sendStatusEmail = async (participant, status) => {
  try {
    const statusConfig = {
      approved: { emoji: '✅', color: '#d4edda', textColor: '#155724', subject: 'APPROVED' },
      rejected: { emoji: '❌', color: '#f8d7da', textColor: '#721c24', subject: 'REJECTED' }
    };
    const config = statusConfig[status] || statusConfig.approved;

    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: participant.email,
      cc: process.env.ADMIN_EMAIL || '',
      subject: `AIMX ${config.subject} | ${participant.participantId}`,
      html: `
<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <div style="background: ${config.color}; padding: 30px; text-align: center;">
    <h1 style="color: ${config.textColor}; margin: 0;">${config.emoji} ${status.toUpperCase()}</h1>
  </div>
  <div style="padding: 30px;">
    <p>Hello <strong>${participant.name}</strong>,</p>
    <p>Your <strong>${participant.eventName}</strong> registration is now <strong style="color: ${config.textColor};">${status.toUpperCase()}</strong>.</p>
    <p style="font-weight: 600;">ID: ${participant.participantId}</p>
  </div>
</div>`
    });

    console.log(`✅ Status email ${status}: ${participant.participantId}`);
  } catch (error) {
    console.error(`❌ Status email failed ${participant.participantId}:`, error.message);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendStatusEmail
};

