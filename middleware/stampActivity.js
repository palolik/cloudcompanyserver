const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { JWT_SECRET } = require('../config/env');
const { getCollections } = require('../config/db');

// NOTE: in the original monolithic file, this middleware was registered with
// app.use(stampActivity) partway through route registration, so only routes
// defined AFTER it ever ran through it. That split is intentionally preserved
// in index2.js (see the two-batch router mounting there) rather than made
// global, to keep behavior identical to the original file.
const stampActivity = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.userId) return next();

    const { clientCollection, employeeCollection } = getCollections();
    const id = new ObjectId(decoded.userId);
    const role = decoded.role?.toLowerCase();

    if (role === 'client') {
      clientCollection.updateOne({ _id: id }, { $set: { lastActive: new Date() } }).catch(() => {});
    } else if (role === 'emp' || role === 'employee') {
      employeeCollection.updateOne({ _id: id }, { $set: { lastActive: new Date() } }).catch(() => {});
    }
  } catch {
    // invalid/expired token — just continue
  }
  next();
};

module.exports = stampActivity;
