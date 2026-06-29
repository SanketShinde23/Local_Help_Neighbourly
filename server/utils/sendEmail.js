// server/utils/sendEmail.js

const axios = require('axios');

function trimEnv(name) {
  const value = process.env[name];
  return value != null ? String(value).trim() : '';
}

function getBrevoApiKey() {
  return trimEnv('BREVO_API_KEY');
}

function getFromEmail() {
  return trimEnv('EMAIL_FROM');
}

function getEmailConfigStatus() {
  const apiKey = getBrevoApiKey();
  const fromEmail = getFromEmail();

  return {
    onRender: Boolean(process.env.RENDER),
    deliveryMethod: apiKey && fromEmail ? 'brevo-api' : 'none',
    brevoApiKeyConfigured: Boolean(apiKey),
    brevoApiKeyLooksValid: apiKey.startsWith('xkeysib-'),
    emailFromConfigured: Boolean(fromEmail),
    ready: Boolean(apiKey && fromEmail),
    hint:
      !apiKey
        ? 'Set BREVO_API_KEY in Render (Brevo → SMTP & API → API Keys).'
        : !fromEmail
          ? 'Set EMAIL_FROM to your verified Brevo sender address.'
          : apiKey && !apiKey.startsWith('xkeysib-')
            ? 'BREVO_API_KEY should start with xkeysib-. You may have pasted the SMTP password by mistake.'
            : null,
  };
}

const sendEmail = async (options) => {
  const apiKey = getBrevoApiKey();
  const fromEmail = getFromEmail();

  if (!apiKey || !fromEmail) {
    throw new Error('BREVO_API_KEY and EMAIL_FROM must be set.');
  }

  console.log('Sending email via Brevo API...', { to: options.email, from: fromEmail });

  try {
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

    const messageId = response.data?.messageId;
    console.log('Verification email sent', { messageId });
    return response.data;
  } catch (error) {
    console.error('SEND MAIL ERROR:', error);
    console.error(error.stack);

    const brevoMessage = error.response?.data?.message;
    const brevoCode = error.response?.data?.code;

    if (brevoMessage) {
      const detail = brevoCode ? `${brevoCode}: ${brevoMessage}` : brevoMessage;
      console.error('Brevo API error body:', error.response.data);
      throw new Error(detail);
    }

    throw error;
  }
};

module.exports = sendEmail;
module.exports.getEmailConfigStatus = getEmailConfigStatus;
