import dotenv from 'dotenv';
import { sendMail } from '../utils/mailer.js';

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--to' && args[i+1]) { out.to = args[++i]; }
    else if (a === '--subject' && args[i+1]) { out.subject = args[++i]; }
    else if (a === '--text' && args[i+1]) { out.text = args[++i]; }
  }
  return out;
}

(async () => {
  const { to, subject, text } = parseArgs();
  const toAddr = to || process.env.SMTP_TEST_TO;
  if (!toAddr) {
    console.error('Usage: node sendTestEmail.js --to you@example.com');
    process.exit(1);
  }

  const payload = {
    to: toAddr,
    subject: subject || 'HavenBridge SMTP test',
    text: text || `This is a test email from HavenBridge. Time: ${new Date().toISOString()}`,
    html: `<p>This is a test email from <b>HavenBridge</b>.</p><p>Time: <code>${new Date().toISOString()}</code></p>`,
  };

  try {
    const res = await sendMail(payload);
    console.log('sendMail result:', res);
    if (res.delivered) console.log('Email reported delivered by transporter.');
    else if (res.skipped) console.log('Email sending skipped (test or MAIL_MODE=silent).');
    else if (res.logged) console.log('Email logged to console (no SMTP configured).');
    else if (res.failed) console.log('Email failed to send:', res.error);
    process.exit(0);
  } catch (e) {
    console.error('sendMail threw:', e);
    process.exit(2);
  }
})();
