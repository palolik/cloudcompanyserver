// In-app notification list ("inbox") for clients, employees and admins, kept
// in the `notifications` collection. Every notification is stored here and
// pushed over FCM, so the app's list shows what the phone showed and more
// (pushes are lost when a device has no token or notifications are off).
//
// Two kinds of document:
//   personal   { userId, userType, type, title, body, data, read, createdAt, collapseKey?, count? }
//   broadcast  { audience, type: 'broadcast', title, body, data, readBy: [userId], createdAt, sentBy }
//
// audience is 'public' (everyone, guests too), 'clients', 'employees' or
// 'admins'. Notifications older than RETENTION_DAYS are removed by a TTL index.

const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { sendPushToUsers, sendPushToTopic, TOPICS } = require('./push.service');

const RETENTION_DAYS = 90;
const MAX_PAGE = 50;
const AUDIENCES = Object.keys(TOPICS);
const audiencesFor = (userType) => [TOPICS.public, `${userType}s`];

let indexesReady = null;
function ensureIndexes() {
  if (!indexesReady) {
    const { notificationCollection } = getCollections();
    indexesReady = Promise.all([
      notificationCollection.createIndex({ userId: 1, createdAt: -1 }),
      notificationCollection.createIndex({ userId: 1, collapseKey: 1, read: 1 }),
      notificationCollection.createIndex({ audience: 1, createdAt: -1 }),
      notificationCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 3600 }),
    ]).catch((err) => {
      indexesReady = null;
      console.error('Notification index setup failed:', err.message);
    });
  }
  return indexesReady;
}

// Plain strings only, so the list renders the same everywhere.
const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
function cleanData(data = {}) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)])
  );
}

/**
 * Store a notification for each user and push it to their devices.
 * `type` (or data.type) is 'chat', 'order', 'task', 'campaign', 'personal'...
 * `collapseKey` (e.g. a chat room) merges repeats into the user's existing
 * unread notification with that key instead of adding a new row, so a busy
 * chat shows one entry with a count. Never throws; returns devices reached.
 */
async function notifyUsers(userIds, { title, body, type, data = {}, userType = null, collapseKey = null } = {}) {
  try {
    const kind = type || data.type || 'general';
    const ids = [...new Set([].concat(userIds).filter(Boolean).map(String))];
    if (!ids.length) return 0;

    await ensureIndexes();
    const { notificationCollection } = getCollections();
    const now = new Date();
    const doc = {
      type: kind,
      title: clean(title, 140) || 'Cloud Company',
      body: clean(body, 500),
      data: cleanData(data),
    };

    if (collapseKey) {
      await Promise.all(ids.map((userId) => notificationCollection.updateOne(
        { userId, collapseKey, read: false },
        {
          $set: { ...doc, createdAt: now },
          $inc: { count: 1 },
          $setOnInsert: { userId, userType, read: false },
        },
        { upsert: true }
      )));
    } else {
      await notificationCollection.insertMany(
        ids.map((userId) => ({ ...doc, userId, userType, read: false, count: 1, createdAt: now }))
      );
    }

    return await sendPushToUsers(ids, { title: doc.title, body: doc.body, data: { ...data, type: kind } });
  } catch (err) {
    console.error('Notify users failed:', err.message);
    return 0;
  }
}

/** Store one broadcast for an audience and push it to that audience's topic. */
async function broadcast({ audience = 'public', title, body, url = null, sentBy = null }) {
  if (!AUDIENCES.includes(audience)) throw new Error(`audience must be one of ${AUDIENCES.join(', ')}`);
  await ensureIndexes();
  const { notificationCollection } = getCollections();
  const doc = {
    audience,
    type: 'broadcast',
    title: clean(title, 140),
    body: clean(body, 500),
    data: cleanData({ url }),
    readBy: [],
    sentBy,
    createdAt: new Date(),
  };
  const { insertedId } = await notificationCollection.insertOne(doc);
  const pushed = await sendPushToTopic(TOPICS[audience], {
    title: doc.title,
    body: doc.body,
    data: { ...doc.data, type: 'broadcast', notificationId: insertedId.toString() },
  });
  return { id: insertedId, pushed };
}

// Shape sent to apps: no readBy list, `read` worked out for this user.
function toItem(doc, userId) {
  const isBroadcast = !doc.userId;
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    data: doc.data || {},
    count: doc.count || 1,
    audience: doc.audience || null,
    read: isBroadcast ? Boolean(userId && (doc.readBy || []).includes(userId)) : Boolean(doc.read),
    createdAt: doc.createdAt,
  };
}

const visibleTo = ({ userId, userType }) => ({
  $or: [{ userId }, { audience: { $in: audiencesFor(userType) } }],
});

/** Newest first; `before` (ISO date of the last item seen) pages back. */
async function listFor(user, { limit = 20, before } = {}) {
  const { notificationCollection } = getCollections();
  const query = visibleTo(user);
  const beforeDate = before ? new Date(before) : null;
  if (beforeDate && !Number.isNaN(beforeDate.getTime())) query.createdAt = { $lt: beforeDate };
  const n = Math.min(Math.max(Number(limit) || 20, 1), MAX_PAGE);

  const docs = await notificationCollection.find(query).sort({ createdAt: -1 }).limit(n + 1).toArray();
  return {
    items: docs.slice(0, n).map((d) => toItem(d, user.userId)),
    hasMore: docs.length > n,
  };
}

async function unreadCount({ userId, userType }) {
  const { notificationCollection } = getCollections();
  const [personal, broadcasts] = await Promise.all([
    notificationCollection.countDocuments({ userId, read: false }),
    notificationCollection.countDocuments({ audience: { $in: audiencesFor(userType) }, readBy: { $ne: userId } }),
  ]);
  return personal + broadcasts;
}

/** Mark one notification read. Returns false when the user can't see it. */
async function markRead(user, id) {
  if (!ObjectId.isValid(id)) return false;
  const { notificationCollection } = getCollections();
  const _id = new ObjectId(id);
  const own = await notificationCollection.updateOne({ _id, userId: user.userId }, { $set: { read: true } });
  if (own.matchedCount) return true;
  const shared = await notificationCollection.updateOne(
    { _id, audience: { $in: audiencesFor(user.userType) } },
    { $addToSet: { readBy: user.userId } }
  );
  return shared.matchedCount > 0;
}

async function markAllRead({ userId, userType }) {
  const { notificationCollection } = getCollections();
  await Promise.all([
    notificationCollection.updateMany({ userId, read: false }, { $set: { read: true } }),
    notificationCollection.updateMany(
      { audience: { $in: audiencesFor(userType) }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    ),
  ]);
}

/** Users can only delete their own notifications, not broadcasts. */
async function removeFor({ userId }, id) {
  if (!ObjectId.isValid(id)) return false;
  const { notificationCollection } = getCollections();
  const res = await notificationCollection.deleteOne({ _id: new ObjectId(id), userId });
  return res.deletedCount > 0;
}

/** Public announcements for signed-out visitors. */
async function listPublic({ limit = 20 } = {}) {
  const { notificationCollection } = getCollections();
  const n = Math.min(Math.max(Number(limit) || 20, 1), MAX_PAGE);
  const docs = await notificationCollection.find({ audience: TOPICS.public }).sort({ createdAt: -1 }).limit(n).toArray();
  return docs.map((d) => toItem(d, null));
}

/** Broadcast history for admins. */
async function listBroadcasts({ limit = 50 } = {}) {
  const { notificationCollection } = getCollections();
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const docs = await notificationCollection
    .find({ type: 'broadcast' }, { projection: { readBy: 0 } })
    .sort({ createdAt: -1 })
    .limit(n)
    .toArray();
  return docs.map((d) => ({ ...toItem(d, null), sentBy: d.sentBy || null }));
}

module.exports = {
  AUDIENCES,
  notifyUsers,
  broadcast,
  listFor,
  unreadCount,
  markRead,
  markAllRead,
  removeFor,
  listPublic,
  listBroadcasts,
};
