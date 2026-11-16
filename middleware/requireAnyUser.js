const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { JWT_SECRET } = require('../config/env');
const { getCollections } = require('../config/db');

// Requires a client, employee or admin Bearer token and sets
// req.authUser = { userId, userType, role }.
//
// Client and employee tokens carry `role` ('client', 'emp', 'marketer', ...).
// Admin tokens (from /adminlogin or /login) have no role, so the id is looked
// up in the admin roles collection.
const requireAnyUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!decoded?.userId) throw new Error('Bad token');
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  const userId = String(decoded.userId);
  const role = decoded.role ? String(decoded.role).toLowerCase() : null;
  if (role) {
    req.authUser = { userId, userType: role === 'client' ? 'client' : 'employee', role };
    return next();
  }

  try {
    const { rolesCollection } = getCollections();
    const admin = ObjectId.isValid(userId)
      ? await rolesCollection.findOne({ _id: new ObjectId(userId) }, { projection: { _id: 1 } })
      : null;
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    req.authUser = { userId, userType: 'admin', role: 'admin' };
    next();
  } catch (err) {
    console.error('Auth lookup failed:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = requireAnyUser;
