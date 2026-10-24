// Company mail: the cPanel mailboxes on cloudcompany.cc.
// Sends over SMTP (nodemailer), pulls inboxes over IMAP for the admin panel,
// and logs sent and synced email in the `emaillog` collection.
//
// Passwords live only in env (.env, see .env.example). A mailbox
// without a password is reported as unconfigured and refuses to send.
//
// Older code (orders, tasks, events, chat notifications) still writes logs in
// the legacy shape { from, body, sentAt } / { body, receivedAt }; listEmails
// and getEmail read both shapes.

const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { getCollections } = require('../config/db');

const DOMAIN = 'cloudcompany.cc';
const BRAND = 'Cloud Company';

const MAILBOXES = [
  { key: 'info', address: `info@${DOMAIN}`, name: BRAND, passwordEnv: 'MAIL_INFO_PASSWORD' },
  { key: 'support', address: `support@${DOMAIN}`, name: `${BRAND} Support`, passwordEnv: 'MAIL_SUPPORT_PASSWORD' },
  { key: 'ceo', address: `prottoy.ceo@${DOMAIN}`, name: BRAND, passwordEnv: 'MAIL_CEO_PASSWORD' },
  { key: 'noreply', address: `noreply@${DOMAIN}`, name: BRAND, passwordEnv: 'MAIL_NOREPLY_PASSWORD' },
];

// Inbox logs saved before mailboxes were tracked all came from this mailbox.
const LEGACY_INBOX_MAILBOX = `prottoy.ceo@${DOMAIN}`;

const MAX_RECIPIENTS = 50;
const MAX_INBOX_SYNC = 200;
const MAX_PAGE_SIZE = 100;
const EMAIL_RE = /^[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[^\s@<>(),;:]+$/;

// An Error carrying an HTTP status. `expose` marks 502/503s meant for the
// admin (bad password, SMTP down) so routes show their message as is.
const httpError = (status, message, expose = status < 500) =>
  Object.assign(new Error(message), { status, expose });

const host = () => process.env.MAIL_HOST || DOMAIN;
const smtpPort = () => Number(process.env.MAIL_SMTP_PORT || 465);
const imapPort = () => Number(process.env.MAIL_IMAP_PORT || 993);
const tls = () => ({ rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== 'false' });

const logs = () => getCollections().emailLogCollection;

const isConfigured = (box) => Boolean(process.env[box.passwordEnv]);

// Accepts a mailbox key ('support') or its address ('support@...').
const findMailbox = (keyOrAddress) => {
  const value = String(keyOrAddress || '').trim().toLowerCase();
  return MAILBOXES.find((b) => b.key === value || b.address === value);
};

const resolveMailbox = (keyOrAddress) => {
  const box = findMailbox(keyOrAddress);
  if (!box) throw httpError(400, `Unknown mailbox "${keyOrAddress}"`);
  if (!isConfigured(box)) throw httpError(503, `Mailbox ${box.address} has no password configured (${box.passwordEnv})`, true);
  return box;
};

const listMailboxes = () =>
  MAILBOXES.map((box) => ({ key: box.key, address: box.address, name: box.name, configured: isConfigured(box) }));

const transporters = new Map();

const getTransporter = (keyOrAddress) => {
  const box = resolveMailbox(keyOrAddress);
  if (!transporters.has(box.address)) {
    transporters.set(box.address, nodemailer.createTransport({
      host: host(),
      port: smtpPort(),
      secure: smtpPort() === 465,
      auth: { user: box.address, pass: process.env[box.passwordEnv] },
      tls: tls(),
    }));
  }
  return transporters.get(box.address);
};

const toList = (value) => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : String(value).split(/[,;\n]/);
  return items.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
};

const assertEmails = (list, field) => {
  const bad = list.find((e) => !EMAIL_RE.test(e));
  if (bad) throw httpError(400, `Invalid email in ${field}: ${bad}`);
};

const htmlToText = (html) =>
  html.replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Inline base64 images (from the rich text editor) become CID attachments,
// which mail clients render far more reliably than data: URLs.
const inlineImages = (html) => {
  const attachments = [];
  const out = html.replace(/src="data:(image\/[a-zA-Z+.-]+);base64,([^"]+)"/g, (match, contentType, content) => {
    const cid = `img${attachments.length}@${DOMAIN}`;
    attachments.push({ cid, encoding: 'base64', content, contentType });
    return `src="cid:${cid}"`;
  });
  return { html: out, attachments };
};

/**
 * Send an email from one of the company mailboxes and log it. Throws an
 * httpError on bad input (400), an unconfigured mailbox (503) or an SMTP
 * failure (502). Returns the saved log document.
 */
const sendMail = async ({ from, to, cc, bcc, subject, html, text, senderName, sentBy } = {}) => {
  const box = resolveMailbox(from || 'info');
  const toArr = toList(to);
  const ccArr = toList(cc);
  const bccArr = toList(bcc);

  if (!toArr.length) throw httpError(400, 'At least one recipient is required');
  if (toArr.length + ccArr.length + bccArr.length > MAX_RECIPIENTS) {
    throw httpError(400, `Too many recipients (max ${MAX_RECIPIENTS} per email)`);
  }
  assertEmails(toArr, 'to');
  assertEmails(ccArr, 'cc');
  assertEmails(bccArr, 'bcc');
  if (typeof subject !== 'string' || !subject.trim()) throw httpError(400, 'Subject is required');
  if (!html && !text) throw httpError(400, 'Body is required');

  const name = String(senderName || box.name).replace(/["\r\n]/g, '');
  const { html: htmlBody, attachments } = inlineImages(String(html || ''));
  const textBody = text ? String(text) : htmlToText(htmlBody);

  const log = {
    type: 'sent',
    mailbox: box.address,
    from: box.address,
    senderName: name,
    to: toArr,
    cc: ccArr,
    bcc: bccArr,
    subject: subject.trim(),
    html: htmlBody,
    text: textBody,
    date: new Date(),
    read: true,
    sentBy: sentBy ? String(sentBy) : null,
  };

  try {
    const info = await getTransporter(box.address).sendMail({
      from: `"${name}" <${box.address}>`,
      to: toArr.join(', '),
      cc: ccArr.length ? ccArr.join(', ') : undefined,
      bcc: bccArr.length ? bccArr.join(', ') : undefined,
      subject: log.subject,
      text: textBody,
      html: htmlBody || undefined,
      attachments,
    });
    const doc = { ...log, status: 'sent', messageId: info.messageId };
    const { insertedId } = await logs().insertOne(doc);
    return { ...doc, _id: insertedId };
  } catch (err) {
    if (err.status) throw err;
    await logs().insertOne({ ...log, status: 'failed', error: err.message }).catch(() => {});
    throw httpError(502, `Failed to send email: ${err.message}`, true);
  }
};

// Checks SMTP login for a mailbox without sending anything.
const verifyMailbox = async (keyOrAddress) => {
  const box = resolveMailbox(keyOrAddress);
  try {
    await getTransporter(box.address).verify();
    return { mailbox: box.address, success: true };
  } catch (err) {
    return { mailbox: box.address, success: false, message: err.message };
  }
};

/**
 * Pull the latest `limit` messages from a mailbox's INBOX over IMAP and upsert
 * them into emaillog by (mailbox, uid). Local read state survives a re-sync.
 */
const syncInbox = async (keyOrAddress, limit = 50) => {
  const box = resolveMailbox(keyOrAddress);
  const count = Math.min(Math.max(Number(limit) || 50, 1), MAX_INBOX_SYNC);

  const client = new ImapFlow({
    host: host(),
    port: imapPort(),
    secure: true,
    auth: { user: box.address, pass: process.env[box.passwordEnv] },
    tls: tls(),
    logger: false,
  });

  const fetched = [];
  try {
    await client.connect();
  } catch (err) {
    throw httpError(502, `IMAP login failed for ${box.address}: ${err.message}`, true);
  }
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const total = client.mailbox.exists;
      if (total > 0) {
        const start = Math.max(1, total - count + 1);
        for await (const msg of client.fetch(`${start}:*`, { uid: true, flags: true, source: true })) {
          fetched.push({ uid: msg.uid, seen: msg.flags?.has('\\Seen') ?? false, source: msg.source });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }

  const ops = [];
  for (const msg of fetched) {
    const parsed = await simpleParser(msg.source);
    ops.push({
      updateOne: {
        filter: { type: 'inbox', mailbox: box.address, uid: msg.uid },
        update: {
          $set: {
            from: parsed.from?.text || '',
            senderName: parsed.from?.value?.[0]?.name || '',
            to: toList(parsed.to?.value?.map((a) => a.address)),
            cc: toList(parsed.cc?.value?.map((a) => a.address)),
            subject: parsed.subject || '(no subject)',
            html: parsed.html || '',
            text: parsed.text || '',
            date: parsed.date || new Date(),
            messageId: parsed.messageId,
          },
          $setOnInsert: { read: msg.seen },
        },
        upsert: true,
      },
    });
  }
  if (ops.length) await logs().bulkWrite(ops);

  return { mailbox: box.address, synced: ops.length };
};

// Legacy inbox logs have no mailbox; tag them so a re-sync updates them
// instead of adding duplicates. Safe to run on every start.
const migrateLegacyLogs = () =>
  logs().updateMany({ type: 'inbox', mailbox: { $exists: false } }, { $set: { mailbox: LEGACY_INBOX_MAILBOX } });

// Legacy logs keep their date in sentAt/receivedAt, their HTML in body and
// their sender only in `from` (sometimes as '"Name" <address>').
const NORMALIZE = {
  $addFields: {
    date: { $ifNull: ['$date', '$sentAt', '$receivedAt'] },
    mailbox: {
      $ifNull: ['$mailbox', {
        $toLower: {
          $trim: {
            input: { $arrayElemAt: [{ $split: [{ $arrayElemAt: [{ $split: [{ $ifNull: ['$from', ''] }, '<'] }, -1] }, '>'] }, 0] },
          },
        },
      }],
    },
    status: { $ifNull: ['$status', 'sent'] },
  },
};

const normalizeEmail = (doc) => {
  const { body, textBody, sentAt, receivedAt, ...rest } = doc;
  const html = doc.html ?? body ?? '';
  return {
    ...rest,
    html,
    text: doc.text ?? textBody ?? '',
    date: doc.date || sentAt || receivedAt || null,
  };
};

// Filtering old logs should still work if a mailbox loses its password.
const mailboxAddress = (keyOrAddress) => findMailbox(keyOrAddress)?.address || String(keyOrAddress).trim().toLowerCase();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Admin list: ?page&limit&q plus ?type=sent|inbox, ?mailbox, ?status=sent|failed.
const listEmails = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), MAX_PAGE_SIZE);
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  const match = {};
  if (['sent', 'inbox'].includes(query.type)) match.type = query.type;
  if (typeof query.mailbox === 'string' && query.mailbox) match.mailbox = mailboxAddress(query.mailbox);
  if (['sent', 'failed'].includes(query.status)) match.status = query.status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    match.$or = [{ subject: rx }, { from: rx }, { to: rx }];
  }

  const [result] = await logs().aggregate([
    NORMALIZE,
    { $match: match },
    {
      $facet: {
        items: [
          { $sort: { date: -1, _id: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { html: 0, body: 0 } },
        ],
        total: [{ $count: 'n' }],
        unread: [{ $match: { read: false } }, { $count: 'n' }],
      },
    },
  ]).toArray();

  const total = result.total[0]?.n || 0;
  return {
    items: result.items.map(normalizeEmail),
    total,
    unread: result.unread[0]?.n || 0,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

const getEmail = async (id) => {
  const [email] = await logs().aggregate([{ $match: { _id: id } }, NORMALIZE]).toArray();
  if (!email) throw httpError(404, 'Email not found');
  return normalizeEmail(email);
};

const setRead = async (id, read = true) => {
  const email = await logs().findOneAndUpdate(
    { _id: id },
    { $set: { read: Boolean(read) } },
    { returnDocument: 'after', projection: { html: 0, body: 0 } }
  );
  if (!email) throw httpError(404, 'Email not found');
  return normalizeEmail(email);
};

const deleteEmail = async (id) => {
  const result = await logs().deleteOne({ _id: id });
  if (!result.deletedCount) throw httpError(404, 'Email not found');
};

module.exports = {
  BRAND,
  httpError,
  listMailboxes,
  getTransporter,
  sendMail,
  verifyMailbox,
  syncInbox,
  migrateLegacyLogs,
  listEmails,
  getEmail,
  setRead,
  deleteEmail,
};
