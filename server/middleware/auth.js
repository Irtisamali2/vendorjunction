const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'superadmin' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const requirePartner = (req, res, next) => {
  if (!req.user || req.user.role !== 'partner') {
    return res.status(403).json({ success: false, message: 'Partner access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requirePartner };
