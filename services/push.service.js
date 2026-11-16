// Firebase Cloud Messaging (push notifications), project "cloudcompany-dbc36".
// Configured by FIREBASE_SERVICE_ACCOUNT_PATH (path to the service-account
// JSON) or FIREBASE_SERVICE_ACCOUNT (the JSON itself, for hosts that only take
// env vars). When neither is set, pushes are a silent no-op, so local dev
// works without Firebase.
//
// Tokens are FCM registration tokens from CCUser (getToken() with the VAPID
// key), one row per device in `devicetokens`. userId is the client or
// employee _id as a string; userType is 'client', 'employee' or 'admin'.
//
// Every token is also subscribed to FCM topics: 'public' (everyone) and one
// per user type ('clients', 'employees', 'admins'), so broadcasts go out as
// one topic message instead of a token scan. The mobile app subscribes to
// 'public' itself while signed out.
//
// Every send is fire-and-forget: it never throws. Failures are only logged.

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getCollections } = require('../config/db');
const { WEB_APP_URL, FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT } = require('../config/env');

// FCM accepts at most 500 tokens per multicast.
const MAX_TOKENS_PER_SEND = 500;
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);
const PLATFORMS = ['web', 'android', 'ios'];
const USER_TYPES = ['client', 'employee', 'admin'];

// FCM topic per audience. 'public' reaches everyone, signed in or not.
const TOPICS = { public: 'public', clients: 'clients', employees: 'employees', admins: 'admins' };
const ROLE_TOPICS = [TOPICS.clients, TOPICS.employees, TOPICS.admins];
const topicFor = (userType) => `${userType}s`;
const MAX_TOKEN_LENGTH = 4096;

let messaging;
let warnedUnconfigured = false;

function loadServiceAccount() {
  if (FIREBASE_SERVICE_ACCOUNT) return JSON.parse(FIREBASE_SERVICE_ACCOUNT);
  if (FIREBASE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8'));
  }
  return null;
}

function getMessaging() {
  if (messaging !== undefined) return messaging;
  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      if (!warnedUnconfigured) {
        console.warn('Firebase not configured (FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_SERVICE_ACCOUNT); push notifications are not sent.');
        warnedUnconfigured = true;
      }
      return (messaging = null);
    }
    const app = admin.apps.length ? admin.app() : admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    messaging = admin.messaging(app);
  } catch (err) {
    console.error('Firebase init failed:', err.message);
    messaging = null;
  }
  return messaging;
}

// Site paths (/clientprofile/...) become absolute links on the public site.
function webAppUrl(url) {
  if (typeof url !== 'string' || !url) return WEB_APP_URL;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/') && !url.startsWith('//')) return `${WEB_APP_URL.replace(/\/+$/, '')}${url}`;
  return WEB_APP_URL;
}

// Where a click on a notification should take each kind of user.
function profilePath(userType, userId, role) {
  if (userType === 'client') return `/clientprofile/${userId}`;
  if (role === 'marketer') return `/marketerprofile/${userId}`;
  return `/employeeprofile/${userId}`;
}

// Returns the cleaned { token, platform } or { error }.
function validateDeviceToken({ token, platform } = {}) {
  if (typeof token !== 'string' || !token.trim() || token.length > MAX_TOKEN_LENGTH) return { error: 'token is required' };
  const p = platform === undefined || platform === '' ? 'web' : platform;
  if (!PLATFORMS.includes(p)) return { error: `platform must be one of ${PLATFORMS.join(', ')}` };
  return { token: token.trim(), platform: p };
}

// Save a device's token for a user. Re-registering moves the token to this
// user (the device was signed in as someone else before).
async function registerDeviceToken({ userId, userType, role, token, platform }) {
  if (!USER_TYPES.includes(userType)) throw new Error(`userType must be one of ${USER_TYPES.join(', ')}`);
  const { deviceTokenCollection } = getCollections();
  const now = new Date();
  await deviceTokenCollection.updateOne(
    { token },
    { $set: { userId: String(userId), userType, role: role || null, platform, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  syncTopics(token, userType);
}

// Forget a device's token (logout). It stays on 'public' so a signed-out
// device still gets public announcements.
async function removeDeviceToken(token) {
  const { deviceTokenCollection } = getCollections();
  await deviceTokenCollection.deleteOne({ token });
  syncTopics(token, null);
}

// Put a token on 'public' plus its user type's topic, and off the others.
// Fire-and-forget like every other FCM call here.
async function syncTopics(token, userType) {
  const fcm = getMessaging();
  if (!fcm) return;
  try {
    const keep = userType ? topicFor(userType) : null;
    await fcm.subscribeToTopic(token, TOPICS.public);
    if (keep) await fcm.subscribeToTopic(token, keep);
    await Promise.all(ROLE_TOPICS.filter((t) => t !== keep).map((t) => fcm.unsubscribeFromTopic(token, t)));
  } catch (err) {
    console.error('Topic sync failed:', err.message);
  }
}

// FCM data values must be strings.
function stringifyData(data = {}) {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]));
}

/**
 * Push to every device of one or more users (client or employee ids).
 * `data.url` (a site path such as /clientprofile/<id>) is where a click on
 * the notification opens. Always resolves; callers don't need to await it.
 * Returns the number of devices the message was sent to.
 */
async function sendPushToUsers(userIds, { title, body, data = {} } = {}) {
  try {
    const fcm = getMessaging();
    if (!fcm) return 0;

    const ids = [...new Set([].concat(userIds).filter(Boolean).map(String))];
    if (!ids.length) return 0;

    const { deviceTokenCollection } = getCollections();
    const devices = await deviceTokenCollection.find({ userId: { $in: ids } }, { projection: { token: 1 } }).toArray();
    const tokens = devices.map((d) => d.token);
    let sent = 0;

    for (let i = 0; i < tokens.length; i += MAX_TOKENS_PER_SEND) {
      const batch = tokens.slice(i, i + MAX_TOKENS_PER_SEND);
      const res = await fcm.sendEachForMulticast({ tokens: batch, ...messageOptions({ title, body, data }) });
      sent += res.successCount;

      const dead = batch.filter((_, idx) => DEAD_TOKEN_CODES.has(res.responses[idx].error?.code));
      if (dead.length) await deviceTokenCollection.deleteMany({ token: { $in: dead } });
    }
    return sent;
  } catch (err) {
    console.error('Push send failed:', err.message);
    return 0;
  }
}

// Shared FCM message options for every platform.
function messageOptions({ title, body, data = {} }) {
  const link = webAppUrl(data.url);
  return {
    notification: { title, body },
    data: stringifyData(data),
    webpush: {
      notification: { icon: webAppUrl('/assets/febicon.svg') },
      ...(link.startsWith('https://') ? { fcmOptions: { link } } : {}),
    },
    android: { priority: 'high', notification: { sound: 'default', channelId: 'cloudcompany_default' } },
    apns: { payload: { aps: { sound: 'default' } } },
  };
}

/**
 * Push to everyone on an FCM topic ('public', 'clients', 'employees',
 * 'admins'). Always resolves; returns true when FCM accepted the message.
 */
async function sendPushToTopic(topic, message = {}) {
  try {
    const fcm = getMessaging();
    if (!fcm || !Object.values(TOPICS).includes(topic)) return false;
    await fcm.send({ topic, ...messageOptions(message) });
    return true;
  } catch (err) {
    console.error('Topic push failed:', err.message);
    return false;
  }
}

module.exports = {
  TOPICS,
  sendPushToTopic,
  getMessaging,
  profilePath,
  validateDeviceToken,
  registerDeviceToken,
  removeDeviceToken,
  sendPushToUsers,
};
