const router = require('express').Router()
const db = require('../config/db')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { logActivity, getClientIp } = require('../middleware/activityLogger')

async function generateRefNumber() {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM license_requests WHERE DATE(requested_at) = CURDATE()')
  return `LR-${date}-${String(cnt + 1).padStart(4, '0')}`
}

// ── Partner: Submit license request(s) ────────────────────────────
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'partner') return res.status(403).json({ success: false, message: 'Partners only' })

    const partnerId = req.user.registrationId
    const notes = req.body.notes?.trim() || null

    // Accept batch (items array) or single item for backward compat
    const items = req.body.items
      ? req.body.items
      : [{ program_id: req.body.program_id, requested_licenses: req.body.requested_licenses }]

    if (!items.length) return res.status(400).json({ success: false, message: 'At least one program required' })

    const results = []
    for (const item of items) {
      const { program_id, requested_licenses } = item
      if (!program_id || !requested_licenses || parseInt(requested_licenses) < 1) {
        return res.status(400).json({ success: false, message: 'Each item needs program_id and requested_licenses (min 1)' })
      }

      const [[prog]] = await db.query(
        'SELECT p.*, pr.company_name FROM programs p JOIN partner_registrations pr ON p.partner_id = pr.id WHERE p.id = ? AND p.partner_id = ?',
        [program_id, partnerId]
      )
      if (!prog) return res.status(404).json({ success: false, message: 'Program not found or does not belong to your account' })

      const refNum = await generateRefNumber()

      const [result] = await db.query(
        'INSERT INTO license_requests (reference_number, partner_id, program_id, requested_licenses, notes, is_new) VALUES (?,?,?,?,?,1)',
        [refNum, partnerId, program_id, parseInt(requested_licenses), notes]
      )

      await logActivity({
        actorType: 'partner', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
        actorIp: getClientIp(req), category: 'license', action: 'license_requested',
        description: `License request ${refNum}: ${requested_licenses} licenses for ${prog.program_name} by ${prog.company_name}`,
        entityType: 'license_request', entityId: result.insertId, entityName: prog.program_name,
        metadata: { reference_number: refNum, program_id, requested_licenses: parseInt(requested_licenses), program_name: prog.program_name },
      })

      results.push({ id: result.insertId, reference_number: refNum })
    }

    res.status(201).json({ success: true, message: `${results.length} license request(s) submitted`, results })
  } catch (err) { next(err) }
})

// ── Admin: License stats ───────────────────────────────────────────
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [[s]] = await db.query(`
      SELECT
        COALESCE(SUM(is_new), 0) as new_count,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected
      FROM license_requests
    `)
    res.json({
      success: true,
      stats: {
        new: Number(s.new_count || 0),
        pending: Number(s.pending || 0),
        approved: Number(s.approved || 0),
        rejected: Number(s.rejected || 0),
      },
    })
  } catch (err) { next(err) }
})

// ── Partner: Get own license requests ─────────────────────────────
router.get('/my', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'partner') return res.status(403).json({ success: false, message: 'Partners only' })
    const partnerId = req.user.registrationId
    const [rows] = await db.query(
      `SELECT lr.*, p.program_name, p.credits, p.credit_unit_price, a.name as reviewed_by_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       WHERE lr.partner_id = ?
       ORDER BY lr.requested_at DESC`,
      [partnerId]
    )
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
})

// ── Admin: List all license requests ──────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status = '', search = '', filter = '', page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const params = []
    let where = 'WHERE 1=1'

    if (filter === 'new') {
      where += ' AND lr.is_new = 1'
    } else if (status) {
      where += ' AND lr.status = ?'
      params.push(status)
    }

    if (search) {
      where += ' AND (pr.company_name LIKE ? OR p.program_name LIKE ? OR pr.email LIKE ? OR lr.reference_number LIKE ?)'
      const s = `%${search}%`
      params.push(s, s, s, s)
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM license_requests lr
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       JOIN programs p ON lr.program_id = p.id
       ${where}`, params
    )

    const [rows] = await db.query(
      `SELECT lr.*, pr.company_name, pr.email as partner_email, pr.first_name, pr.last_name,
              p.program_name, p.credits, p.credit_unit_price, a.name as reviewed_by_name
       FROM license_requests lr
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       ${where}
       ORDER BY lr.requested_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    // Mark all new requests as viewed once admin loads the list
    if (rows.some(r => r.is_new)) {
      await db.query('UPDATE license_requests SET is_new=0 WHERE is_new=1')
    }

    res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) { next(err) }
})

// ── Admin: Get license requests for a specific partner ────────────
router.get('/partner/:partnerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT lr.*, p.program_name, p.credits, p.credit_unit_price, a.name as reviewed_by_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       LEFT JOIN admin_users a ON lr.reviewed_by = a.id
       WHERE lr.partner_id = ?
       ORDER BY lr.requested_at DESC`,
      [req.params.partnerId]
    )
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
})

// ── Admin: Approve or reject a license request ────────────────────
router.patch('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const reqId = req.params.id

    const [[lr]] = await db.query(
      `SELECT lr.*, p.program_name, pr.company_name, pr.email as partner_email, pr.first_name
       FROM license_requests lr
       JOIN programs p ON lr.program_id = p.id
       JOIN partner_registrations pr ON lr.partner_id = pr.id
       WHERE lr.id = ?`,
      [reqId]
    )
    if (!lr) return res.status(404).json({ success: false, message: 'Request not found' })

    await db.query(
      'UPDATE license_requests SET status=?, admin_notes=?, reviewed_by=?, reviewed_at=NOW(), is_new=0 WHERE id=?',
      [status, admin_notes || null, req.user.id, reqId]
    )

    await logActivity({
      actorType: 'admin', actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
      actorIp: getClientIp(req), category: 'license', action: `license_${status}`,
      description: `License request ${lr.reference_number || '#' + reqId} ${status}: ${lr.requested_licenses} licenses for ${lr.program_name} by ${lr.company_name}`,
      entityType: 'license_request', entityId: parseInt(reqId), entityName: lr.program_name,
      metadata: { reference_number: lr.reference_number, partner_company: lr.company_name, requested_licenses: lr.requested_licenses, admin_notes },
    })

    res.json({ success: true, message: `License request ${status}` })
  } catch (err) { next(err) }
})

module.exports = router
