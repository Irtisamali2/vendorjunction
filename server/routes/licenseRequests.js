const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../middleware/activityLogger');

// ── Partner: Submit a license request ─────────────────────────
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'partner') {
      return res.status(403).json({ success: false, message: 'Partners only' });
    }
    const { program_id, requested_licenses, notes } = req.body;
    if (!program_id || !requested_licenses || requested_licenses < 1) {
      return res.status(400).json({ success: false, message: 'program_id and requested_licenses (min 1) are required' });
    }

    const partnerId = req.user.registrationId;

    // Verify the program belongs to this partner
    const [[prog]] = await db.query(
      'SELECT p.*, pr.company_name FROM programs p JOIN partner_registrations pr ON p.partner_id = pr.id WHERE p.id = ? AND p.partner_id = ?',
      [program_id, partnerId]
    );
    if (!prog) {
      return res.status(404).json({ success: false, message: 'Program not found or does not belong to your account' });
    }

    const [result] = await db.query(
      'INSERT INTO license_requests (partner_id, program_id, requested_licenses, notes) VALUES (?,?,?,?)',
      [partnerId, program_id, requested_licenses, notes || null]
    );

    await logActivity({
      actorType: 'partner', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'license', action: 'license_requested',
      description: `License request submitted: ${requested_licenses} licenses for ${prog.program_name} by ${prog.company_name}`,
      entityType: 'license_request', entityId: result.insertId, entityName: prog.program_name,
      metadata: { program_id, requested_licenses, program_name: prog.program_name },
    });

    res.status(201).json({ success: true, message: 'License request submitted successfully', id: result.insertId });
  } catch (err) { next(err); }
});

// ── Partner: Get own license requests ─────────────────────────
router.get('/my', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'partner') {
      return res.status(403).json({ success: false, message: 'Partners only' });
    }
    const partnerId = req.user.registrationId;
    const [rows] = await db.query(
      `SELECT lr.*, p.program_name, p.credits, p.credit_unit_price,
              a.name as reviewed_by_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       WHERE lr.partner_id = ?
       ORDER BY lr.requested_at DESC`,
      [partnerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// ── Admin: List all license requests ──────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status = '', search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (status) { where += ' AND lr.status = ?'; params.push(status); }
    if (search) {
      where += ' AND (pr.company_name LIKE ? OR p.program_name LIKE ? OR pr.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM license_requests lr
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       JOIN programs p ON lr.program_id = p.id
       ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT lr.*, pr.company_name, pr.email as partner_email, pr.first_name, pr.last_name,
              p.program_name, p.credits, p.credit_unit_price,
              a.name as reviewed_by_name
       FROM license_requests lr
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       ${where}
       ORDER BY lr.requested_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

// ── Admin: Get license requests for a specific partner ────────
router.get('/partner/:partnerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT lr.*, p.program_name, p.credits, p.credit_unit_price,
              a.name as reviewed_by_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       WHERE lr.partner_id = ?
       ORDER BY lr.requested_at DESC`,
      [req.params.partnerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// ── Admin: Approve or reject a license request ────────────────
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['approved', 'rejected']),
  body('admin_notes').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { status, admin_notes } = req.body;
    const reqId = req.params.id;

    const [[lr]] = await db.query(
      `SELECT lr.*, p.program_name, pr.company_name, pr.email as partner_email, pr.first_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       WHERE lr.id = ?`,
      [reqId]
    );
    if (!lr) return res.status(404).json({ success: false, message: 'Request not found' });

    await db.query(
      'UPDATE license_requests SET status=?, admin_notes=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?',
      [status, admin_notes || null, req.user.id, reqId]
    );

    await logActivity({
      actorType: 'admin', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'license', action: `license_${status}`,
      description: `License request ${status}: ${lr.requested_licenses} licenses for ${lr.program_name} by ${lr.company_name}`,
      entityType: 'license_request', entityId: parseInt(reqId), entityName: lr.program_name,
      metadata: { partner_company: lr.company_name, requested_licenses: lr.requested_licenses, admin_notes },
    });

    res.json({ success: true, message: `License request ${status}` });
  } catch (err) { next(err); }
});

module.exports = router;
