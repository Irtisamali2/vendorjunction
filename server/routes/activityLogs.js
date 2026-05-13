const router = require('express').Router();
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/activity-logs  — Admin only, with search + filters + pagination
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const {
      search = '', category = '', actor_type = '',
      date_from = '', date_to = '',
      page = 1, limit = 50,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      where += ' AND (al.actor_name LIKE ? OR al.actor_email LIKE ? OR al.description LIKE ? OR al.entity_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (category) { where += ' AND al.category = ?'; params.push(category); }
    if (actor_type) { where += ' AND al.actor_type = ?'; params.push(actor_type); }
    if (date_from) { where += ' AND DATE(al.created_at) >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND DATE(al.created_at) <= ?'; params.push(date_to); }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM activity_logs al ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT al.id, al.actor_type, al.actor_id, al.actor_name, al.actor_email, al.actor_ip,
              al.category, al.action, al.description, al.entity_type, al.entity_id, al.entity_name,
              al.metadata, al.created_at
       FROM activity_logs al ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true, data: rows, total,
      page: parseInt(page), pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
});

module.exports = router;
