const express = require('express');
const router = express.Router();
const requireAnyUser = require('../middleware/requireAnyUser');
const {
  listMine,
  getUnreadCount,
  readOne,
  readAll,
  removeOne,
  listPublic,
  send,
  listSent,
  getTask,
} = require('../controllers/notifications.controller');

// Public announcements (no login, for signed-out app users and the website).
router.get('/notifications/public', listPublic);

// The signed-in client's, employee's or admin's own list.
router.get('/notifications', requireAnyUser, listMine);
router.get('/notifications/unread-count', requireAnyUser, getUnreadCount);
router.patch('/notifications/read-all', requireAnyUser, readAll);
router.patch('/notifications/:id/read', requireAnyUser, readOne);
router.delete('/notifications/:id', requireAnyUser, removeOne);

// requireAdmin accepts any token signed with JWT_SECRET (clients included),
// so these check the account really is an admin.
const adminOnly = [requireAnyUser, (req, res, next) => (
  req.authUser.userType === 'admin' ? next() : res.status(403).json({ success: false, message: 'Admins only' })
)];

// Admin: broadcast to an audience or message chosen users; broadcast history.
router.post('/admin/notifications', adminOnly, send);
router.get('/admin/notifications', adminOnly, listSent);

// One task by id, for opening a task notification.
router.get('/task/:id', requireAnyUser, getTask);

module.exports = router;
