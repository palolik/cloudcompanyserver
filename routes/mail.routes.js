const express = require('express');
const { ObjectId } = require('mongodb');
const requireAdmin = require('../middleware/requireAdmin');
const mail = require('../services/mail');

// Admin panel mail: company mailboxes, compose/send, inbox + sent logs.
// Only admins send from here, so the HTML body is sent as written.

// Express 4 doesn't catch rejected promises; turn them into JSON errors here.
// 4xx and exposed 5xx (bad mailbox password, SMTP down) keep their message.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    const status = err.status >= 400 && err.status <= 599 ? err.status : 500;
    if (status >= 500 && !err.expose) console.error(`${req.method} ${req.originalUrl}`, err);
    if (res.headersSent) return;
    res.status(status).json({
      success: false,
      message: status >= 500 && !err.expose ? 'Internal server error' : err.message,
    });
  }
};

const requireId = (id) => {
  if (!ObjectId.isValid(id)) throw mail.httpError(400, 'Invalid id');
  return new ObjectId(id);
};

const router = express.Router();

router.get('/mail/mailboxes', requireAdmin, (req, res) => {
  res.json({ success: true, data: mail.listMailboxes() });
});

router.post('/mail/mailboxes/:mailbox/verify', requireAdmin, handle(async (req, res) => {
  const result = await mail.verifyMailbox(req.params.mailbox);
  res.json({ success: result.success, data: result });
}));

// Body: { from: 'info' | 'support' | 'ceo', to, cc?, bcc?, subject, html?, text?, senderName? }
router.post('/mail/send', requireAdmin, handle(async (req, res) => {
  const { from, to, cc, bcc, subject, html, text, senderName } = req.body || {};
  const email = await mail.sendMail({
    from, to, cc, bcc, subject, html, text, senderName,
    sentBy: req.admin.userId,
  });
  const { html: _omit, ...data } = email;
  res.status(201).json({ success: true, message: 'Email sent', data });
}));

// Body: { mailbox, limit? }
router.post('/mail/inbox/sync', requireAdmin, handle(async (req, res) => {
  const result = await mail.syncInbox(req.body?.mailbox, req.body?.limit);
  res.json({ success: true, data: result });
}));

// ?page&limit&q&type=sent|inbox&mailbox&status=sent|failed
router.get('/mail/emails', requireAdmin, handle(async (req, res) => {
  res.json({ success: true, ...(await mail.listEmails(req.query)) });
}));

router.get('/mail/emails/:id', requireAdmin, handle(async (req, res) => {
  res.json({ success: true, data: await mail.getEmail(requireId(req.params.id)) });
}));

// Body: { read?: boolean } (default true)
router.patch('/mail/emails/:id/read', requireAdmin, handle(async (req, res) => {
  const read = req.body?.read === undefined ? true : req.body.read === true;
  res.json({ success: true, data: await mail.setRead(requireId(req.params.id), read) });
}));

router.delete('/mail/emails/:id', requireAdmin, handle(async (req, res) => {
  await mail.deleteEmail(requireId(req.params.id));
  res.json({ success: true, message: 'Email deleted' });
}));

module.exports = router;
