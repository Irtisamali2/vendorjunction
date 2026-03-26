const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png|zip/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    allowed.test(ext) ? cb(null, true) : cb(new Error('File type not allowed'));
  }
});

// Get attachments for partner
router.get('/:partnerId', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.name as uploaded_by_name FROM attachments a
       LEFT JOIN admin_users u ON a.uploaded_by = u.id
       WHERE a.partner_id = ? ORDER BY a.uploaded_at DESC`,
      [req.params.partnerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// Upload attachments (one or more files)
router.post('/:partnerId', authenticate, requireAdmin, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files provided' });
    const { partnerId } = req.params;
    for (const file of req.files) {
      await db.query(
        `INSERT INTO attachments (partner_id, original_name, stored_name, file_path, mime_type, file_size, uploaded_by)
         VALUES (?,?,?,?,?,?,?)`,
        [partnerId, file.originalname, file.filename, file.path, file.mimetype, file.size, req.user.id]
      );
    }
    res.status(201).json({ success: true, message: `${req.files.length} file(s) uploaded` });
  } catch (err) { next(err); }
});

// Delete attachment
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM attachments WHERE id = ?', [req.params.id]);
    if (rows.length && fs.existsSync(rows[0].file_path)) fs.unlinkSync(rows[0].file_path);
    await db.query('DELETE FROM attachments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Attachment deleted' });
  } catch (err) { next(err); }
});

// Serve file download
router.get('/download/:id', authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM attachments WHERE id = ?', [req.params.id]);
    if (!rows.length || !fs.existsSync(rows[0].file_path)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.download(rows[0].file_path, rows[0].original_name);
  } catch (err) { next(err); }
});

module.exports = router;
