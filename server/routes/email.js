const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// ── SMTP Config ───────────────────────────────────────────
router.get('/config', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, smtp_host, smtp_port, smtp_user, smtp_encryption, from_name, from_email, is_active FROM email_config LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch (err) { next(err); }
});

router.put('/config', authenticate, requireAdmin, [
  body('smtp_host').trim().notEmpty(),
  body('smtp_port').isInt({ min: 1, max: 65535 }),
  body('smtp_user').trim().notEmpty(),
  body('from_email').isEmail(),
  body('from_name').trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { smtp_host, smtp_port, smtp_user, smtp_password, smtp_encryption, from_name, from_email } = req.body;
    const [existing] = await db.query('SELECT id FROM email_config LIMIT 1');
    if (existing.length) {
      await db.query(
        `UPDATE email_config SET smtp_host=?, smtp_port=?, smtp_user=?,
         smtp_encryption=?, from_name=?, from_email=?, is_active=1
         ${smtp_password ? ', smtp_password=?' : ''} WHERE id=?`,
        smtp_password
          ? [smtp_host, smtp_port, smtp_user, smtp_encryption || 'tls', from_name, from_email, smtp_password, existing[0].id]
          : [smtp_host, smtp_port, smtp_user, smtp_encryption || 'tls', from_name, from_email, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO email_config (smtp_host, smtp_port, smtp_user, smtp_password, smtp_encryption, from_name, from_email) VALUES (?,?,?,?,?,?,?)',
        [smtp_host, smtp_port, smtp_user, smtp_password || '', smtp_encryption || 'tls', from_name, from_email]
      );
    }
    res.json({ success: true, message: 'SMTP configuration saved' });
  } catch (err) { next(err); }
});

// Test SMTP
router.post('/test', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { test_email } = req.body;
    if (!test_email) return res.status(400).json({ success: false, message: 'Test email address required' });
    const sent = await sendEmail({
      to: test_email,
      toName: req.user.name,
      templateKey: 'registration_welcome',
      variables: { first_name: 'Admin', last_name: '', company_name: 'VendorJunction Test', email: test_email, submitted_date: new Date().toLocaleDateString() }
    });
    if (sent) res.json({ success: true, message: 'Test email sent successfully' });
    else res.status(500).json({ success: false, message: 'Failed to send test email. Check SMTP config.' });
  } catch (err) { next(err); }
});

// ── Email Templates ──────────────────────────────────────
router.get('/templates', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_templates ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.put('/templates/:id', authenticate, requireAdmin, [
  body('subject').trim().notEmpty(),
  body('html_body').trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { subject, html_body, template_name } = req.body;
    await db.query(
      'UPDATE email_templates SET subject=?, html_body=?, template_name=COALESCE(?,template_name) WHERE id=?',
      [subject, html_body, template_name || null, req.params.id]
    );
    res.json({ success: true, message: 'Template updated' });
  } catch (err) { next(err); }
});

// ── Email Logs ───────────────────────────────────────────
router.get('/logs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = status ? 'WHERE status = ?' : '';
    const params = status ? [status] : [];
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM email_logs ${where}`, params);
    const [rows] = await db.query(
      `SELECT * FROM email_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

module.exports = router;
