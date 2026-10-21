const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Requires a client or employee Bearer token (from /clientlogin or
// /employeelogin) and sets req.authUser = { userId, userType, role }.
const requireUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const role = decoded?.role?.toLowerCase();
    if (!decoded?.userId || !role) throw new Error('Bad token');

    const userType = role === 'client' ? 'client' : 'employee';
    req.authUser = { userId: String(decoded.userId), userType, role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = requireUser;
