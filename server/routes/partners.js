const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// ── Public: Submit Registration ─────────────────────────────
router.post('/register', [
  body('title').isIn(['Mr.','Ms.','Mrs.','Dr.','Prof.']),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('job_title').trim().notEmpty(),
  body('mobile').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('company_name').trim().notEmpty(),
  body('company_type').notEmpty(),
  body('address_line1').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('num_employees').isInt({ min: 1 }),
  body('business_sector').notEmpty(),
  body('annual_turnover').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const data = req.body;
    const regCode = 'VJ-' + Date.now().toString().slice(-8);

    await db.query(
      `INSERT INTO partner_registrations (reg_code, title, first_name, last_name, job_title, mobile, email,
        company_name, company_type, address_line1, address_line2, city, country,
        num_branches, num_employees, landline, website, business_sector, business_activities,
        company_reg_no, annual_turnover)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [regCode, data.title, data.first_name, data.last_name, data.job_title, data.mobile, data.email,
       data.company_name, data.company_type, data.address_line1, data.address_line2 || null,
       data.city, data.country, data.num_branches || 0, data.num_employees,
       data.landline || null, data.website || null, data.business_sector,
       data.business_activities || null, data.company_reg_no || null, data.annual_turnover || null]
    );

    // Send welcome email (non-blocking)
    sendEmail({
      to: data.email,
      toName: `${data.first_name} ${data.last_name}`,
      templateKey: 'registration_welcome',
      variables: {
        first_name: data.first_name,
        last_name: data.last_name,
        company_name: data.company_name,
        email: data.email,
        submitted_date: new Date().toLocaleDateString()
      }
    }).catch(console.error);

    res.status(201).json({ success: true, message: 'Application submitted successfully', regCode });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An application with this email already exists.' });
    }
    next(err);
  }
});

// ── Admin: List Partners ───────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { search = '', status, company_type, business_sector, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (pr.company_name LIKE ? OR pr.first_name LIKE ? OR pr.last_name LIKE ? OR pr.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) { where += ' AND pr.status = ?'; params.push(status); }
    if (company_type) { where += ' AND pr.company_type = ?'; params.push(company_type); }
    if (business_sector) { where += ' AND pr.business_sector = ?'; params.push(business_sector); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM partner_registrations pr ${where}`, params);
    const [rows] = await db.query(
      `SELECT pr.id, pr.reg_code, pr.title, pr.first_name, pr.last_name, pr.job_title, pr.email, pr.mobile,
              pr.company_name, pr.company_type, pr.business_sector, pr.city, pr.country,
              pr.website, pr.status, pr.submitted_at
       FROM partner_registrations pr ${where}
       ORDER BY pr.submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

// ── Admin: Dashboard stats ─────────────────────────────────
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [[counts]] = await db.query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(status='pending'), 0) as pending,
        COALESCE(SUM(status='approved'), 0) as approved,
        COALESCE(SUM(status='rejected'), 0) as rejected,
        COALESCE(SUM(status='suspended'), 0) as suspended,
        COALESCE(SUM(DATE(submitted_at) = CURDATE()), 0) as today
      FROM partner_registrations
    `);
    const [recent] = await db.query(
      `SELECT id, title, first_name, last_name, company_name, status, submitted_at, city, country
       FROM partner_registrations ORDER BY submitted_at DESC LIMIT 5`
    );
    const [monthlyData] = await db.query(`
      SELECT DATE_FORMAT(submitted_at, '%Y-%m') as month, COUNT(*) as count
      FROM partner_registrations
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);
    res.json({ success: true, stats: counts, recent, monthlyData });
  } catch (err) { next(err); }
});

// ── Partner: My Profile (must be before /:id) ────────────
router.get('/me/profile', authenticate, async (req, res, next) => {
  try {
    const regId = req.user.registrationId;
    const [rows] = await db.query('SELECT * FROM partner_registrations WHERE id = ?', [regId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// ── Admin: Get Single Partner ─────────────────────────────
router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM partner_registrations WHERE id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// ── Admin: Update Status ───────────────────────────────────
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['approved','rejected','suspended','pending']),
  body('rejection_reason').if(body('status').equals('rejected')).notEmpty().withMessage('Reason required for rejection')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { status, rejection_reason, notes } = req.body;
    const partId = req.params.id;

    const [rows] = await db.query('SELECT * FROM partner_registrations WHERE id = ?', [partId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
    const partner = rows[0];

    await db.query(
      `UPDATE partner_registrations SET status=?, rejection_reason=?, notes=?,
       status_changed_by=?, status_changed_at=NOW() WHERE id=?`,
      [status, rejection_reason || null, notes || null, req.user.id, partId]
    );

    // If approved: create partner user account
    if (status === 'approved') {
      const [existing] = await db.query('SELECT id FROM partner_users WHERE registration_id = ?', [partId]);
      if (!existing.length) {
        const tempPassword = uuidv4().slice(0, 10).replace(/-/g, '') + 'A1!';
        const hash = await bcrypt.hash(tempPassword, 12);
        await db.query(
          'INSERT INTO partner_users (registration_id, email, password_hash) VALUES (?,?,?)',
          [partId, partner.email, hash]
        );
        sendEmail({
          to: partner.email,
          toName: `${partner.first_name} ${partner.last_name}`,
          templateKey: 'status_approved',
          variables: {
            first_name: partner.first_name,
            last_name: partner.last_name,
            company_name: partner.company_name,
            email: partner.email,
            temp_password: tempPassword,
            portal_url: `${process.env.FRONTEND_URL}/partner/login`
          },
          partnerId: parseInt(partId)
        }).catch(console.error);
      }
    } else if (status === 'rejected') {
      sendEmail({
        to: partner.email,
        toName: `${partner.first_name} ${partner.last_name}`,
        templateKey: 'status_rejected',
        variables: {
          first_name: partner.first_name,
          last_name: partner.last_name,
          company_name: partner.company_name,
          rejection_reason: rejection_reason || 'Not specified'
        },
        partnerId: parseInt(partId)
      }).catch(console.error);
    }

    res.json({ success: true, message: `Partner status updated to ${status}` });
  } catch (err) { next(err); }
});


module.exports = router;
