// server/utils/sendEmail.js

const axios = require('axios');
const nodemailer = require('nodemailer');

function logEmailEnv() {
  console.log('EMAIL env check:', {
    BREVO_API_KEY: process.env.BREVO_API_KEY ? '(set)' : '(missing)',
    EMAIL_FROM: process.env.EMAIL_FROM ? '(set)' : '(missing)',
    EMAIL_HOST: process.env.EMAIL_HOST ? '(set)' : '(missing)',
    EMAIL_USER: process.env.EMAIL_USER ? '(set)' : '(missing)',
    EMAIL_PASS: process.env.EMAIL_PASS ? '(set)' : '(missing)',
  });
}

async function sendViaBrevoApi(options) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    throw new Error('BREVO_API_KEY and EMAIL_FROM must be set for Brevo API delivery.');
  }

  console.log('Using Brevo HTTP API (port 443 — works on Render free tier)');
  console.log('Calling sendMail via Brevo API...');

  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'LocalHelp', email: fromEmail },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message,
    },
    {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      timeout: 15000,
    }
  );

  console.log('sendMail completed');
  console.log('Verification email sent', response.data);
  return response.data;
}

async function sendViaSmtp(options) {
  console.log('Creating transporter...');
  logEmailEnv();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Verifying SMTP...');
  await transporter.verify();
  console.log('SMTP verified');

  const message = {
    from: `LocalHelp <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  console.log('Calling sendMail...');
  const info = await transporter.sendMail(message);
  console.log('sendMail completed');
  console.log('Verification email sent', info.messageId);
  return info;
}

const sendEmail = async (options) => {
  try {
    if (process.env.BREVO_API_KEY) {
      return await sendViaBrevoApi(options);
    }

    console.warn(
      'BREVO_API_KEY not set — falling back to SMTP on port 587. ' +
        'Render free tier blocks SMTP ports; set BREVO_API_KEY in production.'
    );
    return await sendViaSmtp(options);
  } catch (error) {
    console.error('SEND MAIL ERROR:', error);
    console.error(error.stack);
    if (error.response?.data) {
      console.error('Brevo API error body:', error.response.data);
    }
    throw error;
  }
};

module.exports = sendEmail;
