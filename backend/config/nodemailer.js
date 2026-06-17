import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate SMTP credentials
// Support both EMAIL_USER/EMAIL_PASSWORD and SMTP_USER/SMTP_PASS for flexibility
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

console.log('📧 NODEMAILER INIT:');
console.log('  EMAIL_USER:', emailUser || '❌ NOT SET');
console.log('  EMAIL_PASSWORD:', emailPassword ? '✅ SET (' + emailPassword.length + ' chars)' : '❌ NOT SET');

if (!emailUser || !emailPassword) {
  console.error('❌ CRITICAL: SMTP credentials not configured. Email sending will FAIL.');
  console.error('Required env vars: EMAIL_USER/SMTP_USER and EMAIL_PASSWORD/SMTP_PASS');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // Use TLS for Gmail
  auth: {
    user: emailUser || '',
    pass: emailPassword || '',
  },
});

// Verify transporter connection
console.log('🔍 Verifying SMTP transporter...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification FAILED:', error.message);
  } else {
    console.log('✅ SMTP Verification SUCCESS - Ready to send emails');
  }
});

/**
 * Sends a branded HTML email to a user.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} title - Main header title in the card
 * @param {string} bodyHtml - Main HTML message content
 * @param {string} buttonText - Text for the Call-To-Action button (optional)
 * @param {string} buttonUrl - URL for the Call-To-Action button (optional)
 */
export const sendEmail = async ({ to, subject, title, bodyHtml, buttonText, buttonUrl, replyTo }) => {
  const brandColor = '#0052cc';
  const textColor = '#333333';
  const bgColor = '#f4f6f9';

  let ctaButtonHtml = '';
  if (buttonText && buttonUrl) {
    ctaButtonHtml = `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${buttonUrl}" style="background-color: ${brandColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0, 82, 204, 0.2); transition: background-color 0.2s;">
          ${buttonText}
        </a>
      </div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif; background-color: ${bgColor}; margin: 0; padding: 20px; color: ${textColor}; line-height: 1.6;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); margin: 0 auto;">
        <!-- Header -->
        <tr>
          <td style="background-color: ${brandColor}; padding: 40px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">EverActive Physiotherapy</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Restore Movement. Restore Life.</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: ${brandColor}; margin-top: 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f0f4f8; padding-bottom: 10px;">${title}</h2>
            <div style="font-size: 16px; margin-top: 20px; color: #555555;">
              ${bodyHtml}
            </div>
            ${ctaButtonHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #edf2f7;">
            <p style="margin: 0 0 5px 0;">EverActive Physiotherapy Clinic</p>
            <p style="margin: 0 0 5px 0;">Empowering you to stay active, healthy, and pain-free.</p>
            <p style="margin: 10px 0 0 0; font-size: 10px; color: #aaaaaa;">
              This email was sent automatically. Please do not reply directly to this address.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    console.log('📨 SENDING EMAIL:');
    console.log('  To:', to);
    console.log('  Subject:', subject);
    console.log('  From:', emailUser);
    console.log('  Timestamp:', new Date().toISOString());

    const mailOptions = {
      from: `"EverActive Physiotherapy" <${emailUser}>`,
      to,
      replyTo,
      subject,
      html: htmlContent,
    };

    console.log('📤 Initiating transporter.sendMail()...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('  Message ID:', info.messageId);
    console.log('  Response:', info.response);
    console.log('  Timestamp:', new Date().toISOString());
    
    return info;
  } catch (error) {
    console.error('❌ EMAIL SEND FAILED!');
    console.error('  To:', to);
    console.error('  Error Code:', error.code);
    console.error('  Error Message:', error.message);
    console.error('  Error Details:', error);
    console.error('  Stack:', error.stack);
    console.error('  Timestamp:', new Date().toISOString());
    throw error;
  }
};
