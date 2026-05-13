const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../middleware/activityLogger');

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid email or password format', errors: errors.array() });
    }
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const [rows] = await db.query('SELECT * FROM admin_users WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length) {
      await logActivity({ actorType: 'system', actorIp: ip, category: 'auth', action: 'login_failed', description: `Failed admin login attempt for email: ${email}`, metadata: { email } });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      await logActivity({ actorType: 'admin', actorId: admin.id, actorName: admin.name, actorEmail: admin.email, actorIp: ip, category: 'auth', action: 'login_failed', description: `Failed login attempt for admin: ${admin.email}` });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);
    await logActivity({ actorType: 'admin', actorId: admin.id, actorName: admin.name, actorEmail: admin.email, actorIp: ip, category: 'auth', action: 'login', description: `Admin logged in: ${admin.email}` });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ success: true, token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) { next(err); }
});

// Partner Login
router.post('/partner/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid email or password format' });
    }
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const [rows] = await db.query(
      `SELECT pu.*, pr.first_name, pr.last_name, pr.company_name, pr.status
       FROM partner_users pu
       JOIN partner_registrations pr ON pu.registration_id = pr.id
       WHERE pu.email = ? AND pu.is_active = 1`,
      [email]
    );
    if (!rows.length) {
      await logActivity({ actorType: 'system', actorIp: ip, category: 'auth', action: 'login_failed', description: `Failed partner login attempt for email: ${email}`, metadata: { email } });
      return res.status(401).json({ success: false, message: 'Invalid credentials or account not activated' });
    }
    const partner = rows[0];
    if (partner.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
    }
    const valid = await bcrypt.compare(password, partner.password_hash);
    if (!valid) {
      await logActivity({ actorType: 'partner', actorId: partner.id, actorName: `${partner.first_name} ${partner.last_name}`, actorEmail: partner.email, actorIp: ip, category: 'auth', action: 'login_failed', description: `Failed login attempt for partner: ${partner.email}` });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    await db.query('UPDATE partner_users SET last_login = NOW() WHERE id = ?', [partner.id]);
    await logActivity({ actorType: 'partner', actorId: partner.id, actorName: `${partner.first_name} ${partner.last_name}`, actorEmail: partner.email, actorIp: ip, category: 'auth', action: 'login', description: `Partner logged in: ${partner.email} (${partner.company_name})`, entityType: 'partner', entityId: partner.registration_id, entityName: partner.company_name });
    const token = jwt.sign(
      { id: partner.id, email: partner.email, role: 'partner', registrationId: partner.registration_id, name: `${partner.first_name} ${partner.last_name}`, companyName: partner.company_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({
      success: true, token,
      user: { id: partner.id, email: partner.email, name: `${partner.first_name} ${partner.last_name}`, companyName: partner.company_name, role: 'partner' }
    });
  } catch (err) { next(err); }
});

// Logout (log it server-side)
router.post('/logout', authenticate, async (req, res) => {
  const ip = getClientIp(req);
  const { role, id, name, email } = req.user;
  await logActivity({
    actorType: role === 'partner' ? 'partner' : 'admin',
    actorId: id, actorName: name, actorEmail: email, actorIp: ip,
    category: 'auth', action: 'logout', description: `${role === 'partner' ? 'Partner' : 'Admin'} logged out: ${email}`,
  });
  res.json({ success: true, message: 'Logged out' });
});

// Verify token
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
