const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { infoTransporter, MAIL } = require('../config/mailer');
const { CC_EVENTS_WEBHOOK_SECRET, CC_EVENTS_DASHBOARD_URL } = require('../config/env');
const { escapeHtml } = require('../services/notification.service');
const { sendPushToUsers, profilePath } = require('../services/push.service');

// CC Events delivery webhook. When a notification rule fires, CC Events
// renders the personalised message and POSTs it here, HMAC-signed with
// CC_EVENTS_WEBHOOK_SECRET; Cloud Company sends it as email or FCM push.
// CC Events decides who gets what; Cloud Company owns the mailbox, the device
// tokens and the user's real email address (never taken from the payload).
//
// Once the signature checks out it always answers 200 with { delivered }, so
// CC Events records why a message didn't go out.

const MAX_SKEW_SECONDS = 5 * 60;
const MAILBOXES = {
  info: `"Cloud Company" <${MAIL.info}>`,
};

// X-CC-Events-Signature: sha256=HMAC(secret, `${timestamp}.${rawBody}`), and
// X-CC-Events-Timestamp within 5 minutes so captured requests can't be replayed.
// req.rawBody is kept by the JSON parser in index2.js for this path.
function verifySignature(req) {
  if (!CC_EVENTS_WEBHOOK_SECRET) return { ok: false, status: 503, message: 'Delivery webhook is not configured' };

  const timestamp = req.get('X-CC-Events-Timestamp') || '';
  const signature = (req.get('X-CC-Events-Signature') || '').replace(/^sha256=/, '');
  if (!/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature) || !req.rawBody) {
    return { ok: false, status: 401, message: 'Missing or malformed signature' };
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_SKEW_SECONDS) {
    return { ok: false, status: 401, message: 'Stale timestamp' };
  }

  const expected = crypto.createHmac('sha256', CC_EVENTS_WEBHOOK_SECRET).update(`${timestamp}.`).update(req.rawBody).digest();
  const given = Buffer.from(signature, 'hex');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return { ok: false, status: 401, message: 'Bad signature' };
  }
  return { ok: true };
}

const safeUrl = (url) => (typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null);
const sitePath = (url) => (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : null);
const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const notDelivered = (reason) => ({ delivered: false, reason });

// externalId is the client or employee _id (see analytics/eventRules.js);
// admin: and anon: ids don't parse as ObjectIds and are skipped.
async function findRecipient(externalId) {
  if (!ObjectId.isValid(externalId)) return null;
  const { clientCollection, employeeCollection } = getCollections();
  const _id = new ObjectId(externalId);
  const projection = { rname: 1, remail: 1, role: 1 };

  const client = await clientCollection.findOne({ _id }, { projection });
  if (client) return { ...client, userType: 'client' };
  const employee = await employeeCollection.findOne({ _id }, { projection });
  if (employee) return { ...employee, userType: 'employee' };
  return null;
}

function renderEmail({ heading, body, link }) {
  const paragraphs = body.trim().split(/\n{2,}/)
    .map((p) => `<p style="color:#334155;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  const button = link
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(link)}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Open</a></p>`
    : '';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color:#2563eb; margin-top:0;">${escapeHtml(heading)}</h2>
      ${paragraphs}
      ${button}
      <br/>
      <p style="color:#64748b; font-size:13px;">
        Best regards,<br/>
        <strong>Cloud Company Team</strong><br/>
        cloudcompany.cc
      </p>
    </div>
  `;
}

async function deliver(payload = {}) {
  if (payload.type === 'ping') return { delivered: true, pong: true };
  if (payload.type !== 'notification.deliver') return notDelivered(`Unknown type "${payload.type}"`);

  const { channel, externalId, content = {}, rule = {}, id } = payload;
  if (channel !== 'email' && channel !== 'push') return notDelivered(`Channel "${String(channel)}" is not supported by Cloud Company`);
  if (typeof content.body !== 'string' || !content.body.trim()) return notDelivered('Empty message');

  const user = await findRecipient(externalId);
  if (!user) return notDelivered('Not a registered client or employee');
  const userId = user._id.toString();
  const link = safeUrl(content.url) || sitePath(content.url) || profilePath(user.userType, userId, user.role);

  if (channel === 'push') {
    const sent = await sendPushToUsers(userId, {
      title: content.title || content.subject || 'Cloud Company',
      body: content.body,
      data: {
        type: 'campaign',
        url: link,
        ...(rule.id ? { ruleId: String(rule.id) } : {}),
        ...(id ? { ccEventsNotificationId: String(id) } : {}),
      },
    });
    if (!sent) return notDelivered('User has no registered device');
    return { delivered: true, channel, devices: sent };
  }

  if (!isEmail(user.remail)) return notDelivered('User has no email');

  const { emailLogCollection } = getCollections();
  const from = MAILBOXES[content.from] || MAILBOXES.info;
  const subject = String(content.subject || content.title || 'Cloud Company');
  // Rule-authored HTML is sent as is; plain text gets the standard layout.
  const html = typeof content.html === 'string' && content.html.trim()
    ? content.html
    : renderEmail({ heading: content.title || subject, body: content.body, link: safeUrl(link) || null });

  try {
    await infoTransporter.sendMail({ from, to: user.remail.trim(), subject, text: content.body, html });
    const log = await emailLogCollection.insertOne({
      type: 'sent',
      from: MAIL.info,
      senderName: 'Cloud Company',
      to: [user.remail.trim()],
      cc: [],
      bcc: [],
      subject,
      body: html,
      recipientId: userId,
      recipientType: user.userType,
      ccEventsNotificationId: id ? String(id) : null,
      sentAt: new Date(),
      read: true,
    });
    return { delivered: true, channel, emailLogId: log.insertedId };
  } catch (err) {
    return notDelivered(err.message);
  }
}

const deliverNotification = async (req, res) => {
  const check = verifySignature(req);
  if (!check.ok) return res.status(check.status).json({ success: false, message: check.message });
  try {
    res.json({ success: true, ...(await deliver(req.body)) });
  } catch (err) {
    console.error('CC Events delivery failed:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// CC Events view-only dashboard link for the CCAdmin sidebar. Served by the
// API instead of the admin bundle because the link itself grants access.
const getDashboardLink = (req, res) => {
  res.json({ success: true, url: CC_EVENTS_DASHBOARD_URL || null });
};

module.exports = { deliverNotification, getDashboardLink };
