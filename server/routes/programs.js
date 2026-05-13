const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../middleware/activityLogger');

// Get programs for a partner — accessible by admin OR the partner themselves
router.get('/:partnerId', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.params.partnerId;
    // Partner can only fetch their own programs
    if (req.user.role === 'partner' && String(req.user.registrationId) !== String(partnerId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const [rows] = await db.query(
      `SELECT p.*, a.name as created_by_name
       FROM programs p
       LEFT JOIN admin_users a ON p.created_by = a.id
       WHERE p.partner_id = ?
       ORDER BY p.created_at DESC`,
      [partnerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// Add program for a partner
router.post('/', authenticate, requireAdmin, [
  body('partner_id').isInt({ min: 1 }),
  body('program_name').trim().notEmpty(),
  body('credits').isInt({ min: 1 }),
  body('credit_unit_price').isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { partner_id, program_name, credits, credit_unit_price } = req.body;
    const [result] = await db.query(
      'INSERT INTO programs (partner_id, program_name, credits, credit_unit_price, created_by) VALUES (?,?,?,?,?)',
      [partner_id, program_name, credits, credit_unit_price, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM programs WHERE id = ?', [result.insertId]);

    // Fetch partner name for log
    const [[partner]] = await db.query('SELECT company_name FROM partner_registrations WHERE id = ?', [partner_id]);
    await logActivity({
      actorType: 'admin', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'program', action: 'program_added',
      description: `Price card added: ${program_name} for ${partner?.company_name || 'partner'}`,
      entityType: 'program', entityId: result.insertId, entityName: program_name,
      metadata: { partner_id, credits, credit_unit_price },
    });

    res.status(201).json({ success: true, data: rows[0], message: 'Program added successfully' });
  } catch (err) { next(err); }
});

// Update a program
router.put('/:id', authenticate, requireAdmin, [
  body('program_name').optional().trim().notEmpty(),
  body('credits').optional().isInt({ min: 1 }),
  body('credit_unit_price').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { program_name, credits, credit_unit_price } = req.body;
    const [[existing]] = await db.query('SELECT p.*, pr.company_name FROM programs p JOIN partner_registrations pr ON p.partner_id = pr.id WHERE p.id = ?', [req.params.id]);
    await db.query(
      `UPDATE programs SET
         program_name = COALESCE(?, program_name),
         credits = COALESCE(?, credits),
         credit_unit_price = COALESCE(?, credit_unit_price)
       WHERE id = ?`,
      [program_name || null, credits || null, credit_unit_price || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM programs WHERE id = ?', [req.params.id]);

    await logActivity({
      actorType: 'admin', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'program', action: 'program_updated',
      description: `Price card updated: ${existing?.program_name || 'program'} for ${existing?.company_name || 'partner'}`,
      entityType: 'program', entityId: parseInt(req.params.id), entityName: existing?.program_name,
      metadata: { changes: { program_name, credits, credit_unit_price } },
    });

    res.json({ success: true, data: rows[0], message: 'Program updated' });
  } catch (err) { next(err); }
});

// Delete a program
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [[existing]] = await db.query('SELECT p.*, pr.company_name FROM programs p JOIN partner_registrations pr ON p.partner_id = pr.id WHERE p.id = ?', [req.params.id]);
    await db.query('DELETE FROM programs WHERE id = ?', [req.params.id]);

    await logActivity({
      actorType: 'admin', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'program', action: 'program_deleted',
      description: `Price card deleted: ${existing?.program_name || 'program'} for ${existing?.company_name || 'partner'}`,
      entityType: 'program', entityId: parseInt(req.params.id), entityName: existing?.program_name,
    });

    res.json({ success: true, message: 'Program deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
