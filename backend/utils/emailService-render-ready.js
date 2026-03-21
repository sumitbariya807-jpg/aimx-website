const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true' || false,  // Explicit
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Render Gmail timeout config
    connectionTimeout: 120000,  // 2min cold start
    greetingTimeout: 60000,
    socketTimeout: 120000,
    // Gmail TLS (fixes handshake)
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : true,
      minVersion: 'TLSv1.2'
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    rateDelta: 15000,  // 15s
    rateLimit: 5
  };

  console.log('📧 SMTP:', `${config.host}:${config.port} ${config.secure ? 'SSL' : 'TLS'}`);

  if (!config.auth.user || !config.auth.pass) {
    console.error('❌ SMTP auth missing');
    return null;
  }

  const transporter = nodemailer.createTransporter(config);

  // Production verify (5s timeout)
  transporter.verify({ timeout: 10000 }, (err, success) => {
    if (err) console.error('⚠️ SMTP verify fail:', err.code, err.message);
    else console.log('✅ SMTP Gmail ready');
  });

  return transporter;
};

const sendWithRetry = async (transporter, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.sendMail(options);
      return true;
    } catch (err) {
      console.error(`📧 Retry ${i+1}/${retries}:`, err.code || err.message);
      if (i === retries - 1) return false;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

// Registration Email (production)
const sendRegistrationEmail = async (participant) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  // QR
  let qr = '';
  try {
    qr = await QRCode.toDataURL(participant.participantId);
  } catch {}

  const html = `
  <div style="font-family: Arial; max-width: 600px;">
    <h1>🎫 AIMX Registration - ${participant.participantId}</h1>
    <p><strong>${participant.name}</strong></p>
    <p>Event: ${participant.eventName}</p>
    ${qr ? `<img src="${qr}" style="max-width: 250px;" />` : ''}
    <p>Status: ${participant.status?.toUpperCase()}</p>
  </div>`;

  return await sendWithRetry(transporter, {
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX ${participant.participantId}`,
    html
  });
};

// Status Email
const sendStatusEmail = async (participant, status) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  return await sendWithRetry(transporter, {
    from,
    to: participant.email,
    cc: adminEmail,
    subject: `AIMX Status: ${status.toUpperCase()}`,
    text: `Your registration ${status} for ${participant.participantId}`
  });
};

module.exports = { sendRegistrationEmail, sendStatusEmail };

