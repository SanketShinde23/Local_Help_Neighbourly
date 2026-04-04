// server/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `LocalHelp <${process.env.EMAIL_FROM}>`, // Use the verified "From" email
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent successfully: %s', info.messageId);
  } catch (error) {
    console.error('--- ERROR SENDING EMAIL ---');
    console.error(error);
    // Re-throw the error so the calling function knows something went wrong
    throw new Error('Email could not be sent.');
  }
};

module.exports = sendEmail;