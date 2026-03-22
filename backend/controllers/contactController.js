import { sendMail } from '../utils/mailer.js';

export async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, message: 'name, email and message are required' });
    }

    const admin = process.env.CONTACT_ADMIN_EMAIL || 'jabir6k17@gmail.com';

    const subject = `Contact form: ${name} <${email}>`;
    const text = `Message from ${name} <${email}>:\n\n${message}`;

    const mailResult = await sendMail({ to: admin, subject, text });

    return res.status(200).json({ ok: true, mail: mailResult });
  } catch (err) {
    console.error('contact submit error', err?.message || err);
    return res.status(500).json({ ok: false, message: 'Internal error' });
  }
}
