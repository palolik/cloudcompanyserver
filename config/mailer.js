const { getTransporter, listMailboxes } = require('../services/mail');

// Transporters for code that sends directly (orders, tasks, events, password
// reset). Mailbox passwords come from env (.env); see services/mail.js.
// Resolved on each send, so a missing password fails that send with a clear
// error instead of crashing the server at startup.
const lazyTransporter = (mailbox) => ({
  sendMail: (message) => getTransporter(mailbox).sendMail(message),
});

// Mailbox addresses by key: MAIL.info, MAIL.support, MAIL.ceo, MAIL.noreply.
const MAIL = Object.fromEntries(listMailboxes().map((box) => [box.key, box.address]));

// Keyed by address, e.g. transporters[MAIL.support].
const transporters = Object.fromEntries(listMailboxes().map((box) => [box.address, lazyTransporter(box.key)]));

const infoTransporter = transporters[MAIL.info];

module.exports = { transporters, infoTransporter, MAIL };
