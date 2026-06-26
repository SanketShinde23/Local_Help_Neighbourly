// server/utils/sendEmail.js

const axios = require('axios');
const nodemailer = require('nodemailer');

function trimEnv(name) {
  const value = process.env[name];
  return value != null ? String(value).trim() : '';
}

function getBrevoApiKey() {
  return trimEnv('BREVO_API_KEY') || trimEnv('SENDINBLUE_API_KEY');
}

function getFromEmail() {
  return trimEnv('EMAIL_FROM');
}

function isRenderHost() {
  return Boolean(process.env.RENDER);
}

function getEmailConfigStatus() {
  const apiKey = getBrevoApiKey();
  const fromEmail = getFromEmail();
  const onRender = isRenderHost();
  const smtpConfigured = Boolean(
    trimEnv('EMAIL_HOST') && trimEnv('EMAIL_USER') && trimEnv('EMAIL_PASS') && fromEmail
  );

  let deliveryMethod = 'none';
  if (apiKey) {
    deliveryMethod = 'brevo-api';
  } else if (smtpConfigured && !onRender) {
    deliveryMethod = 'smtp';
  } else if (smtpConfigured && onRender) {
    deliveryMethod = 'smtp-blocked-on-render';
  }

  return {
    onRender,
    deliveryMethod,
    brevoApiKeyConfigured: Boolean(apiKey),
    brevoApiKeyLooksValid: apiKey.startsWith('xkeysib-'),
    emailFromConfigured: Boolean(fromEmail),
    smtpConfigured,
    ready: Boolean(apiKey && fromEmail),
    hint:
      !apiKey && onRender
        ? 'Set BREVO_API_KEY in Render (Brevo → SMTP & API → API Keys). SMTP port 587 is blocked on Render free tier.'
        : !fromEmail
          ? 'Set EMAIL_FROM to your verified Brevo sender address.'
          : apiKey && !apiKey.startsWith('xkeysib-')
            ? 'BREVO_API_KEY should start with xkeysib-. You may have pasted the SMTP password by mistake.'
            : null,
  };
}

function logEmailEnv() {
  const status = getEmailConfigStatus();
  console.log('EMAIL env check:', {
    ...status,
    EMAIL_HOST: trimEnv('EMAIL_HOST') ? '(set)' : '(missing)',
    EMAIL_USER: trimEnv('EMAIL_USER') ? '(set)' : '(missing)',
    EMAIL_PASS: trimEnv('EMAIL_PASS') ? '(set)' : '(missing)',
  });
}

async function sendViaBrevoApi(options) {
  const apiKey = getBrevoApiKey();
  const fromEmail = getFromEmail();

  if (!apiKey || !fromEmail) {
    throw new Error('BREVO_API_KEY and EMAIL_FROM must be set for Brevo API delivery.');
  }

  if (!apiKey.startsWith('xkeysib-')) {
    throw new Error(
      'BREVO_API_KEY looks invalid (expected xkeysib-...). Use an API key from Brevo → SMTP & API → API Keys, not the SMTP password.'
    );
  }

  console.log('Using Brevo HTTP API (port 443 — works on Render free tier)');
  console.log('Calling sendMail via Brevo API...', { to: options.email, from: fromEmail });

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
    host: trimEnv('EMAIL_HOST'),
    port: 587,
    secure: false,
    auth: {
      user: trimEnv('EMAIL_USER'),
      pass: trimEnv('EMAIL_PASS'),
    },
  });

  console.log('Verifying SMTP...');
  await transporter.verify();
  console.log('SMTP verified');

  const message = {
    from: `LocalHelp <${getFromEmail()}>`,
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
  logEmailEnv();

  try {
    const apiKey = getBrevoApiKey();

    if (apiKey) {
      return await sendViaBrevoApi(options);
    }

    if (isRenderHost()) {
      throw new Error(
        'BREVO_API_KEY is not set on Render. SMTP ports 587/465/25 are blocked on the free tier — add BREVO_API_KEY and EMAIL_FROM in Render environment variables.'
      );
    }

    console.warn('BREVO_API_KEY not set — falling back to SMTP (local dev only)');
    return await sendViaSmtp(options);
  } catch (error) {
    console.error('SEND MAIL ERROR:', error);
    console.error(error.stack);
    if (error.response?.data) {
      console.error('Brevo API error body:', error.response.data);
    }

    const brevoMessage = error.response?.data?.message;
    if (brevoMessage) {
      throw new Error(`Brevo API: ${brevoMessage}`);
    }
    throw error;
  }
};

module.exports = sendEmail;
module.exports.getEmailConfigStatus = getEmailConfigStatus;
