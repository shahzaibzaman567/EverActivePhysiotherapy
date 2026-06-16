import { sendEmail } from '../config/nodemailer.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'shahzaibzaman465@gmail.com').toLowerCase();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => String(value || '').trim();

export const sendContactMessage = async (req, res, next) => {
  try {
    const firstName = clean(req.body.firstName);
    const lastName = clean(req.body.lastName);
    const email = clean(req.body.email).toLowerCase();
    const phone = clean(req.body.phone);
    const service = clean(req.body.service || 'General Enquiry');
    const message = clean(req.body.message);

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and message are required.' });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const htmlMessage = `
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `;

    await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `New Website Enquiry - ${service}`,
      title: 'New Website Enquiry',
      bodyHtml: htmlMessage,
      buttonText: 'Reply to Client',
      buttonUrl: `mailto:${email}`,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will respond within 24–48 hours.',
    });
  } catch (error) {
    next(error);
  }
};
