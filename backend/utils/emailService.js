// ✅ COMPLETE: Resend Migration - Fixed Render "Connection timeout"
// Removed: Nodemailer + SMTP (SMTP_HOST/PORT/USER/PASS)
// Added: Resend API + QR CID attachments (Gmail/Outlook compatible)
// Preserved: All original HTML templates, participant data, QR logic, admin CC, logging
// Status: PRODUCTION READY

const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRegistrationEmail = async (participant) => {
  try {
    console.log(`📧 Registration email for ${participant.participantId} → ${participant.email}`);
    
    const from = process.env.MAIL_FROM || 'AIMX Events <onboarding@resend.dev>';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;
    const recipients = adminEmail ? [participant.email, adminEmail] : [participant.email];
    
    // Generate QR (exact original logic)
    let qrImage = '';
    try {
      const qrData = participant.participantId;
      qrImage = await QRCode.toDataURL(qrData);
      console.log(`✅ QR generated for ${participant.participantId}`);
    } catch (err) {
      console.error('QR generation error in registration email:', err.message);
      qrImage = '';
    }

    // QR as CID attachment (Gmail fix)
    let qrAttachment = null;
    if (qrImage) {
      const qrBuffer = Buffer.from(qrImage.replace(/^data:image\/png;base64,/, ''), 'base64');
      qrAttachment = [{
        filename: 'ticket-qr.png',
        content: qrBuffer,
        cid: 'qrcode'
      }];
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AIMX 2026 Registration</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Registration Confirmed</h1>
    <p style="opacity: 0.9; margin: 5px 0 0 0;">AIMX 2026 Events</p>
  </div>

  <div style="background: #fff; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <h2 style="color: #333;">Hello <strong>${participant.name}</strong>!</h2>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #007bff;">
      <h3 style="margin-top: 0;">📋 Registration Details</h3>
      <table style="width: 100%; font-size: 16px;">
        <tr><td style="padding-right: 20px; font-weight: 600; width: 120px;">Mobile:</td><td>${participant.phone}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">College:</td><td>${participant.college}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">Event:</td><td>${participant.eventName} (${participant.eventId})</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">Amount:</td><td>₹${participant.amount}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">TXN ID:</td><td>${participant.transactionId}</td></tr>
        <tr><td style="padding-right: 20px; font-weight: 600;">Status:</td><td><strong>${String(participant.status || 'pending').toUpperCase()}</strong></td></tr>
        ${participant.teamName ? `<tr><td style="padding-right: 20px; font-weight: 600;">Team:</td><td>${participant.teamName}</td></tr>` : ''}
      </table>
    </div>

    ${qrAttachment ? `
    <div style="text-align: center; margin: 30px 0; padding: 30px; background: #f8f9fa; border-radius: 15px; border: 3px solid #007bff;">
      <h3 style="color: #007bff; margin-top: 0;">🎫 Your Registration QR Ticket</h3>
      <img src="cid:qrcode" width="240" height="240" alt="AIMX 2026 QR Ticket" style="border: 3px solid #007bff; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,123,255,0.25);"/>
      <p style="font-size: 16px; color: #495057; margin-top: 20px; font-weight: 600;">⏳ Pending admin approval</p>
      <p style="font-size: 14px; color: #6c757d;">Show this QR at event entry gate after approval.</p>
    </div>
    ` : `
    <div style="text-align: center; padding: 30px; background: #fff3cd; border-radius: 12px; border-left: 5px solid #ffc107;">
      <h3 style="color: #856404;">📱 QR Coming Soon</h3>
      <p>QR ticket will be sent after admin verification.</p>
    </div>
    `}

    <div style="text-align: center; padding: 25px; background: #f0f8ff; border-radius: 12px; margin: 30px 0;">
      <p style="font-size: 18px; color: #1976d2; font-weight: 600; margin: 0;">⏳ Status: PENDING APPROVAL</p>
      <p style="font-size: 14px; color: #666; margin-top: 10px;">Track updates via email or AIMX dashboard</p>
    </div>

    <hr style="border: none; height: 1px; background: #eee; margin: 40px 0;">
    
    <p style="text-align: center; font-size: 14px; color: #666;">
      AIMX 2026 Team<br>
      <a href="https://aimx.in" style="color: #667eea; text-decoration: none;">aimx.in</a> | Events • Tech • Community
    </p>
  </div>
</body>
</html>`;

    const result = await resend.emails.send({
      from,
      to: recipients,
      subject: `🎫 AIMX 2026 | ${participant.participantId} - Registration Confirmed`,
      html,
      attachments: qrAttachment || []
    });

    console.log(`✅ Registration email sent via Resend to ${participant.email} (admin: ${adminEmail || 'none'}) ${qrImage ? 'with QR' : '(no QR)'}`);
    return true;
  } catch (error) {
    console.error(`❌ Registration email error "${participant.participantId}":`, error.message);
    return false;
  }
};

const sendStatusEmail = async (participant, status) => {
  try {
    console.log(`📧 Status email (${status.toUpperCase()}) for ${participant.participantId}`);
    
    const from = process.env.MAIL_FROM || 'AIMX Events <onboarding@resend.dev>';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;
    const recipients = adminEmail ? [participant.email, adminEmail] : [participant.email];
    const statusLabel = status.toUpperCase();
    
    const statusConfig = {
      approved: { color: '#d4edda', textColor: '#155724', emoji: '✅', text: 'APPROVED! Your registration is now approved.' },
      rejected: { color: '#f8d7da', textColor: '#721c24', emoji: '❌', text: 'REJECTED. Please contact admin for details.' }
    };
    const config = statusConfig[status] || statusConfig.approved;

    // QR only for approved
    let qrImage = '';
    let qrAttachment = null;
    if (status === 'approved') {
      try {
        qrImage = await QRCode.toDataURL(participant.participantId);
        const qrBuffer = Buffer.from(qrImage.replace(/^data:image\/png;base64,/, ''), 'base64');
        qrAttachment = [{
          filename: 'entry-qr.png',
          content: qrBuffer,
          cid: 'qrcode'
        }];
      } catch (err) {
        console.error('QR generation error:', err.message);
      }
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  
  <div style="background: ${config.color}; padding: 40px; text-align: center;">
    <h1 style="color: ${config.textColor}; margin: 0; font-size: 32px;">${config.emoji} ${statusLabel}</h1>
    <p style="font-size: 18px; opacity: 0.9;">AIMX 2026 Registration Update</p>
  </div>

  <div style="padding: 40px 30px; background: #fff;">
    <h2>Hello <strong>${participant.name}</strong>,</h2>
    
    <p style="font-size: 18px; font-weight: 500;">${config.text}</p>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <p><strong>Participant ID:</strong> ${participant.participantId}</p>
      <p><strong>Mobile:</strong> ${participant.phone}</p>
      <p><strong>College:</strong> ${participant.college}</p>
      <p><strong>Event:</strong> ${participant.eventName} (${participant.eventId})</p>
      ${participant.teamName ? `<p><strong>Team Name:</strong> ${participant.teamName}</p>` : ''}
      ${participant.teamMembers && participant.teamMembers.length > 1 ? 
        `<h4 style="margin-top: 20px;">Team Members:</h4>` + participant.teamMembers.map((m, i) => `<p>Member ${i+1}: ${m.name} (${m.email})</p>`).join('') : ''}
    </div>

    ${qrAttachment ? `
    <div style="text-align: center; padding: 30px; background: #e8f5e8; border-radius: 15px; border: 4px solid #28a745; margin: 30px 0;">
      <h3 style="color: #155724; margin-top: 0;">🎫 Entry QR Code - READY!</h3>
      <img src="cid:qrcode" width="260" height="260" alt="AIMX Entry QR" style="border: 4px solid #28a745; border-radius: 15px; box-shadow: 0 10px 30px rgba(40,167,69,0.3);"/>
      <p style="color: #155724; font-size: 16px; font-weight: 600; margin-top: 20px;">✅ Show this QR at event entry gate</p>
      <p style="font-size: 14px; color: #6c757d;">Staff will scan for verification</p>
    </div>
    ` : ''}

    <p style="text-align: center; font-size: 14px; color: #666; margin-top: 40px;">
      Thank you,<br><strong>AIMX 2026 Team</strong><br>
      <a href="https://aimx.in" style="color: #667eea;">aimx.in</a>
    </p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from,
      to: recipients,
      subject: `AIMX 2026 | ${participant.participantId} - ${statusLabel}`,
      html,
      attachments: qrAttachment || []
    });

    console.log(`✅ Status email (${statusLabel}) sent via Resend to ${participant.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Status email error "${participant.participantId}" (${status}):`, error.message);
    return false;
  }
};

module.exports = { sendRegistrationEmail, sendStatusEmail };

