const nodemailer = require('nodemailer');
const db = require('../config/db');

async function getSmtpConfig() {
  const [rows] = await db.query('SELECT * FROM email_config WHERE is_active = 1 LIMIT 1');
  return rows[0] || null;
}

async function getTemplate(templateKey) {
  const [rows] = await db.query('SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1', [templateKey]);
  return rows[0] || null;
}

function applyVariables(text, vars) {
  if (!text) return '';
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{{${key}}}`);
}

async function sendEmail({ to, toName, templateKey, variables = {}, partnerId = null }) {
  const config = await getSmtpConfig();
  if (!config) {
    console.warn('[Email] No SMTP config found. Email not sent to:', to);
    await logEmail({ to, toName, subject: 'N/A', templateKey, status: 'failed', error: 'No SMTP config', partnerId });
    return false;
  }

  const template = await getTemplate(templateKey);
  if (!template) {
    console.warn('[Email] Template not found:', templateKey);
    await logEmail({ to, toName, subject: 'N/A', templateKey, status: 'failed', error: 'Template not found', partnerId });
    return false;
  }

  const subject = applyVariables(template.subject, variables);
  const htmlBody = applyVariables(template.html_body, variables);

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_encryption === 'ssl',
    auth: { user: config.smtp_user, pass: config.smtp_password },
    tls: config.smtp_encryption === 'tls' ? { rejectUnauthorized: false } : undefined
  });

  try {
    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: toName ? `"${toName}" <${to}>` : to,
      subject,
      html: htmlBody
    });
    await logEmail({ to, toName, subject, templateKey, status: 'sent', partnerId });
    return true;
  } catch (err) {
    console.error('[Email] Send error:', err.message);
    await logEmail({ to, toName, subject, templateKey, status: 'failed', error: err.message, partnerId });
    return false;
  }
}

async function logEmail({ to, toName, subject, templateKey, status, error, partnerId }) {
  try {
    await db.query(
      `INSERT INTO email_logs (to_email, to_name, subject, template_key, status, error_message, sent_at, partner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [to, toName || null, subject, templateKey || null, status, error || null, status === 'sent' ? new Date() : null, partnerId || null]
    );
  } catch (e) {
    console.error('[Email] Log error:', e.message);
  }
}

module.exports = { sendEmail };
