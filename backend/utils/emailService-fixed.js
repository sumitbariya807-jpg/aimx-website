// Migrated to Resend - Gmail QR CID fix (Complete replacement)
const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);

// 🎟️ Registration Email with QR CID (Gmail fix)
const sendRegistrationEmail = async (participant) => {
  try {
    console.log("📧 Sending email to:", participant.email);

    // Generate QR
    const qrData = JSON.stringify({
      id: participant.participantId,
      name: participant.name,
      event: participant.eventName,
      phone: participant.phone,
      college: participant.college
    });

    const qrImage = await QRCode.toDataURL(qrData);

    // Convert to buffer for CID
    const qrBuffer = Buffer.from(
      qrImage.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    // Send with attachment
    const response = await resend.emails.send({
      from: process.env.MAIL_FROM || 'AIMX <onboarding@resend.dev>',
      to: participant.email,
      subject: `🎉 AIMX Registration - ${participant.participantId}`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#4CAF50;">AIMX 2026 Registration 🚀</h2>

          <p>Hello <b>${participant.name}</b>,</p>
          <p>You have successfully registered.</p>

          <div style="background:#f5f5f5; padding:15px; border-radius:10px;">
            <p><b>ID:</b> ${participant.participantId}</p>
            <p><b>Event:</b> ${participant.eventName}</p>
            <p><b>College:</b> ${participant.college}</p>
          </div>

          <h3>Your QR Ticket 🎟️</h3>
          <img src="cid:qrcode" width="200"/>

          <p style="margin-top:15px;">
            Show this QR at entry after approval.
          </p>

          <hr/>
          <p style="font-size:12px;color:gray;">
            AIMX 2026 | Aditya Institute
          </p>
        </div>
      `,
      attachments: [{
        filename: "qr.png",
        content: qrBuffer,
        cid: "qrcode"
      }]
    });

    console.log("✅ Email sent with QR CID:", response);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

// Status Email (simple)
const sendStatusEmail = async (participant, status) => {
  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: participant.email,
      subject: `AIMX Registration ${status.toUpperCase()}`,
      html: `
        <h2>Status Update</h2>
        <p>Hello ${participant.name}</p>
        <p>Your registration is <b>${status}</b></p>
      `
    });

    console.log("✅ Status email sent");
  } catch (err) {
    console.error("❌ Status email error:", err);
  }
};

module.exports = { sendRegistrationEmail, sendStatusEmail };

