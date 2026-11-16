const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const inbox = require('../services/inbox.service');

const fail = (res, err, label) => {
  console.error(`${label}:`, err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

// ── signed-in user ───────────────────────────────────────────────────────────

const listMine = async (req, res) => {
  try {
    const [page, unread] = await Promise.all([
      inbox.listFor(req.authUser, { limit: req.query.limit, before: req.query.before }),
      inbox.unreadCount(req.authUser),
    ]);
    res.json({ success: true, ...page, unread });
  } catch (err) {
    fail(res, err, 'List notifications error');
  }
};

const getUnreadCount = async (req, res) => {
  try {
    res.json({ success: true, unread: await inbox.unreadCount(req.authUser) });
  } catch (err) {
    fail(res, err, 'Unread count error');
  }
};

const readOne = async (req, res) => {
  try {
    const ok = await inbox.markRead(req.authUser, req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    fail(res, err, 'Mark notification read error');
  }
};

const readAll = async (req, res) => {
  try {
    await inbox.markAllRead(req.authUser);
    res.json({ success: true });
  } catch (err) {
    fail(res, err, 'Mark all notifications read error');
  }
};

const removeOne = async (req, res) => {
  try {
    const ok = await inbox.removeFor(req.authUser, req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    fail(res, err, 'Delete notification error');
  }
};

// ── public ───────────────────────────────────────────────────────────────────

const listPublic = async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ success: true, items: await inbox.listPublic({ limit: req.query.limit }) });
  } catch (err) {
    fail(res, err, 'List public notifications error');
  }
};

// ── admin ────────────────────────────────────────────────────────────────────

// Body: { title, body, url?, audience? } for a broadcast, or
// { title, body, url?, userIds: [...] } for a personal message to chosen
// clients/employees/admins.
const send = async (req, res) => {
  const title = String(req.body?.title || '').trim();
  const body = String(req.body?.body || '').trim();
  const url = typeof req.body?.url === 'string' && req.body.url.trim() ? req.body.url.trim() : null;
  const { audience = 'public', userIds } = req.body || {};

  if (!title || !body) return res.status(400).json({ success: false, message: 'title and body are required' });
  if (title.length > 140 || body.length > 500) {
    return res.status(400).json({ success: false, message: 'title max 140 and body max 500 characters' });
  }
  if (url && !/^(https:\/\/|\/(?!\/))/.test(url)) {
    return res.status(400).json({ success: false, message: 'url must be https:// or a site path starting with /' });
  }

  try {
    if (Array.isArray(userIds) && userIds.length) {
      const ids = [...new Set(userIds.map(String))].filter((id) => ObjectId.isValid(id));
      if (!ids.length || ids.length > 1000) {
        return res.status(400).json({ success: false, message: 'userIds must hold 1–1000 valid ids' });
      }
      const devices = await inbox.notifyUsers(ids, { title, body, type: 'personal', data: { url } });
      return res.json({ success: true, recipients: ids.length, devices });
    }

    if (!inbox.AUDIENCES.includes(audience)) {
      return res.status(400).json({ success: false, message: `audience must be one of ${inbox.AUDIENCES.join(', ')}` });
    }
    const result = await inbox.broadcast({ audience, title, body, url, sentBy: req.authUser.userId });
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err, 'Send notification error');
  }
};

const listSent = async (req, res) => {
  try {
    res.json({ success: true, items: await inbox.listBroadcasts({ limit: req.query.limit }) });
  } catch (err) {
    fail(res, err, 'List sent notifications error');
  }
};

// Single task, so a notification can open its details screen.
const getTask = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
  try {
    const { tasksCollection } = getCollections();
    const task = await tasksCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json(task);
  } catch (err) {
    fail(res, err, 'Get task error');
  }
};

module.exports = { listMine, getUnreadCount, readOne, readAll, removeOne, listPublic, send, listSent, getTask };
