const jwt = require('jsonwebtoken');
const { ADMIN_JWT_SECRET } = require('../config/env');

// Requires an admin Bearer token (from /adminlogin) and sets req.admin.
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin login required' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], ADMIN_JWT_SECRET);
    if (!decoded?.userId) throw new Error('Bad token');
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = requireAdmin;
