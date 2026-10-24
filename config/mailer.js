const { getTransporter } = require('../services/mail');

// Transporters for code that sends directly (orders, tasks, events, password
// reset). Mailbox passwords come from env (.env); see services/mail.js.
// Resolved on each send, so a missing password fails that send with a clear
// error instead of crashing the server at startup.
const lazyTransporter = (mailbox) => ({
  sendMail: (message) => getTransporter(mailbox).sendMail(message),
});

const transporters = {
  'prottoy.ceo@cloudcompany.cc': lazyTransporter('ceo'),
  'info@cloudcompany.cc': lazyTransporter('info'),
  'support@cloudcompany.cc': lazyTransporter('support'),
  'noreply@cloudcompany.cc': lazyTransporter('noreply'),
};

const infoTransporter = transporters['info@cloudcompany.cc'];

module.exports = { transporters, infoTransporter };
