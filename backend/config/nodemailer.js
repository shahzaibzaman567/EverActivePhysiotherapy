import nodemailer from 'nodemailer';

// Env vars — support both naming conventions for backwards compatibility
// Priority: EMAIL_USER > SMTP_USER  |  EMAIL_PASSWORD > SMTP_PASS
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || '';
const emailPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '';

if (!emailUser || !emailPassword) {
  console.warn(
    '[nodemailer] SMTP credentials not configured. ' +
    'Set EMAIL_USER + EMAIL_PASSWORD (or SMTP_USER + SMTP_PASS) in environment variables. ' +
    'Email sending will fail until these are set.'
  );
}

// Lazy transporter — created once, reused across warm serverless invocations
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: true, // TLS on port 465
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    // Prevent hanging connections in serverless
    pool: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  return _transporter;
};

/**
 * Sends a branded HTML email.
 *
 * @param {object} opts
 * @param {string} opts.to           - Recipient address
 * @param {string} opts.subject      - Email subject
 * @param {string} opts.title        - Card header title
 * @param {string} opts.bodyHtml     - Main HTML content
 * @param {string} [opts.buttonText] - CTA button label
 * @param {string} [opts.buttonUrl]  - CTA button URL
 * @param {string} [opts.replyTo]    - Reply-to address
 */
export const sendEmail = async ({ to, subject, title, bodyHtml, buttonText, buttonUrl, replyTo }) => {
  if (!emailUser || !emailPassword) {
    throw new Error('SMTP credentials (EMAIL_USER / EMAIL_PASSWORD) are not configured');
  }

  const brandColor = '#0052cc';
  const bgColor = '#f4f6f9';
  const textColor = '#333333';

  const ctaButtonHtml =
    buttonText && buttonUrl
      ? `<div style="text-align:center;margin:30px 0;">
           <a href="${buttonUrl}"
              style="background-color:${brandColor};color:#ffffff;padding:12px 24px;
                     text-decoration:none;border-radius:6px;font-weight:bold;
                     display:inline-block;box-shadow:0 4px 6px rgba(0,82,204,0.2);">
             ${buttonText}
           </a>
         </div>`
      : '';

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family:'Plus Jakarta Sans','Inter',-apple-system,sans-serif;
             background-color:${bgColor};margin:0;padding:20px;
             color:${textColor};line-height:1.6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
         style="max-width:600px;background-color:#ffffff;border-radius:12px;
                overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);margin:0 auto;">
    <tr>
      <td style="background-color:${brandColor};padding:40px 20px;text-align:center;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">
          EverActive Physiotherapy
        </h1>
        <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Restore Movement. Restore Life.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 30px;">
        <h2 style="color:${brandColor};margin-top:0;font-size:20px;font-weight:600;
                   border-bottom:2px solid #f0f4f8;padding-bottom:10px;">${title}</h2>
        <div style="font-size:16px;margin-top:20px;color:#555555;">
          ${bodyHtml}
        </div>
        ${ctaButtonHtml}
      </td>
    </tr>
    <tr>
      <td style="background-color:#f8fafc;padding:20px;text-align:center;
                 font-size:12px;color:#888888;border-top:1px solid #edf2f7;">
        <p style="margin:0 0 5px;">EverActive Physiotherapy Clinic</p>
        <p style="margin:0 0 5px;">Empowering you to stay active, healthy, and pain-free.</p>
        <p style="margin:10px 0 0;font-size:10px;color:#aaaaaa;">
          This email was sent automatically. Please do not reply directly to this address.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"EverActive Physiotherapy" <${emailUser}>`,
    to,
    subject,
    html: htmlContent,
    ...(replyTo && { replyTo }),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`[nodemailer] Email sent to ${to} | MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[nodemailer] Failed to send email to ${to}:`, error.message);
    // Reset cached transporter so next attempt gets a fresh connection
    _transporter = null;
    throw error;
  }
};
