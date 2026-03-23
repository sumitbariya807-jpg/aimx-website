// ✅ Resend Migration Complete - Fixed Render SMTP Timeout + Gmail QR CID
// Original Nodemailer → Resend API (reliable on Render)
// QR as CID attachment (Gmail/Outlook compatible)
// All original HTML + participant data preserved

const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRegistrationEmail = async (participant) => {
  try {
    console.log(`📧 Registration email for ${participant.participantId} → ${participant.email}`);
    
    const from = process.env.MAIL_FROM || 'AIMX Events <onboarding@resend.dev>';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;
    const recipients = adminEmail ? [participant.email, adminEmail] : [participant.email];
    
    // Generate QR (preserve original)
    let qrImage = '';
    try {
      const qrData = participant.participantId;
      qrImage = await QRCode.toDataURL(qrData);
      console.log(`✅ QR generated for ${participant.participantId}`);
    } catch (err) {
      console.error('QR generation error:', err.message);
    }

    // QR Buffer for CID (Gmail fix)
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
<head><meta charset="utf-8"></head>
<body style="font-family: Arial; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0;">🎫 AIMX 2026 Registration</h1>
  </div>
  
  <div style="padding: 40px 30px; background: #fff;">
    <h2>Hello <strong>${participant.name}</strong>!</h2>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #007bff;">
      <h3>📋 Registration Details</h3>
      <p><strong>Mobile:</strong> ${participant.phone}</p>
      <p><strong>College:</strong> ${participant.college}</p>
      <p><strong>Event:</strong> ${participant.eventName} (${participant.eventId})</p>
      <p><strong>Amount:</strong> ₹${participant.amount}</p>
      <p><strong>Transaction ID:</strong> ${participant.transactionId}</p>
      <p><strong>Status:</strong> ${String(participant.status || 'pending').toUpperCase()}</p>
      ${participant.teamName ? `<p><strong>Team Name:</strong> ${participant.teamName}</p>` : ''}
      ${participant.teamMembers && participant.teamMembers.length > 1 ? 
        participant.teamMembers.map((member, i) => `<p>Member ${i+1}: ${member.name} (${member.email})</p>`).join('') : ''}
    </div>

    ${qrAttachment ? `
    <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #007bff;">
      <h3 style="color: #007bff;">🎫 Your Registration QR Ticket</h3>
      <img src="cid:qrcode" width="220" height="220" alt="AIMX QR Ticket" style="border: 2px solid #007bff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
      <p style="font-size: 14px; color: #495057; margin-top: 15px;">Show this QR at event entry (after approval).</p>
    </div>
    ` : '<p>QR ticket coming soon after verification!</p>'}

    <p>Thank you for participating in AIMX 2026.</p>
    <p>AIMX Team</p>
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

    console.log("✅ Email sent successfully via Resend:", participant.participantId);
    return true;
  } catch (error) {
    console.error(`❌ Registration email error: ${error.message}`);
    return false;
  }
};

const sendStatusEmail = async (participant, status) => {
  try {
    console.log(`📧 Status email (${status}) for ${participant.participantId}`);
    
    const from = process.env.MAIL_FROM || 'AIMX Events <onboarding@resend.dev>';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;
    const recipients = adminEmail ? [participant.email, adminEmail] : [participant.email];
    const statusLabel = status.toUpperCase();
    
    let qrImage = '';
    if (status === 'approved') {
      try {
        qrImage = await QRCode.toDataURL(participant.participantId);
      } catch (err) {
        console.error('QR error:', err);
      }
    }

    let qrAttachment = null;
    if (qrImage) {
      const qrBuffer = Buffer.from(qrImage.replace(/^data:image\/png;base64,/, ''), 'base64');
      qrAttachment = [{
        filename: 'approved-qr.png',
        content: qrBuffer,
        cid: 'qrcode'
      }];
    }

    const statusText = status === 'approved' ? 'APPROVED! Show QR at entry.' : 'REJECTED by admin.';
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <div style="background: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; padding: 30px; text-align: center;">
    <h1 style="color: ${status === 'approved' ? '#155724' : '#721c24'};">${statusLabel}</h1>
  </div>
  
  <div style="padding: 30px;">
    <p>Hello <strong>${participant.name}</strong>,</p>
    <p><strong>Your registration ${statusText}</strong></p>
    <p><strong>Participant ID:</strong> ${participant.participantId}</p>
    <p><strong>Event:</strong> ${participant.eventName} (${participant.eventId})</p>
    
    ${qrAttachment ? `
    <div style="text-align: center; padding: 20px; background: #e8f5e8; border-radius: 10px; border: 2px solid #28a745;">
      <h3 style="color: #28a745;">✅ Entry QR Code</h3>
      <img src="cid:qrcode" width="220" height="220" alt="QR Ticket" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
      <p style="color: #155724; font-weight: 500;">Show at event entry gate</p>
    </div>
    ` : ''}

    ${participant.teamName ? `<p><strong>Team:</strong> ${participant.teamName}</p>` : ''}
    
    <p>Thank you,<br>AIMX Team</p>
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

    console.log("✅ Status email sent successfully via Resend:", participant.participantId);
    return true;
  } catch (error) {
    console.error(`❌ Status email error: ${error.message}`);
    return false;
  }
};

module.exports = { sendRegistrationEmail, sendStatusEmail };

