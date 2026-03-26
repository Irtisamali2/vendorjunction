const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get programs for a partner
router.get('/:partnerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, a.name as created_by_name
       FROM programs p
       LEFT JOIN admin_users a ON p.created_by = a.id
       WHERE p.partner_id = ?
       ORDER BY p.created_at DESC`,
      [req.params.partnerId]
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
    await db.query(
      `UPDATE programs SET
         program_name = COALESCE(?, program_name),
         credits = COALESCE(?, credits),
         credit_unit_price = COALESCE(?, credit_unit_price)
       WHERE id = ?`,
      [program_name || null, credits || null, credit_unit_price || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0], message: 'Program updated' });
  } catch (err) { next(err); }
});

// Delete a program
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM programs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Program deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
