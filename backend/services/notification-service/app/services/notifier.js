const nodemailer = require("nodemailer");
const {
  senderEmail,
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPassword,
} = require("../config");

const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPassword);
const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPassword },
    })
  : nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });

async function sendEmail({ to, subject, body }) {
  const message = {
    from: senderEmail,
    to,
    subject,
    text: body,
  };
  const info = await transporter.sendMail(message);
  if (smtpConfigured) {
    console.log(`Email sent to ${to}. messageId=${info.messageId}`);
  } else {
    console.log(`Email simulated for ${to}. Configure SMTP_HOST, SMTP_USER and SMTP_PASSWORD to send it.`);
  }
}

async function sendSms({ to, body }) {
  console.log(`SMS queued to ${to}: ${body}`);
}

module.exports = {
  sendEmail,
  sendSms,
};
