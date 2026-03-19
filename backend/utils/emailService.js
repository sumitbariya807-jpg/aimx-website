const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

console.log('📧 Loading email service. Env:', {
  SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'MISSING',
  SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
  SMTP_USER: process.env.SMTP_USER ? 'SET' : 'MISSING'
});

const createTransporter = () => {
  const host
