const { ObjectId } = require('mongodb');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { getCollections } = require('../config/db');
const { transporters } = require('../config/mailer');

const sendEmail = async (req, res) => {
  const { from, to, cc, bcc, subject, body, senderName } = req.body;
  try {
    const { emailLogCollection } = getCollections();
    const selectedTransporter = transporters[from] || transporters['prottoy.ceo@cloudcompany.cc'];

    const attachments = [];
    let htmlBody = body;
    let cidIndex = 0;

    const base64Regex = /src="data:(image\/[a-zA-Z]+);base64,([^"]+)"/g;
    htmlBody = body.replace(base64Regex, (match, mimeType, base64Data) => {
      const cid = `image${cidIndex++}@cloudcompany.cc`;
      attachments.push({ cid, encoding: 'base64', content: base64Data, contentType: mimeType });
      return `src="cid:${cid}"`;
    });

    await selectedTransporter.sendMail({
      from: senderName ? `"${senderName}" <${from}>` : from,
      to: to.join(', '),
      cc: cc?.join(', '),
      bcc: bcc?.join(', '),
      subject,
      text: htmlBody.replace(/<[^>]*>/g, ''),
      html: htmlBody,
      attachments,
    });

    await emailLogCollection.insertOne({
      type: 'sent', from, senderName, to,
      cc: cc || [], bcc: bcc || [],
      subject, body: htmlBody,
      sentAt: new Date(), read: true,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSentEmails = async (req, res) => {
  try {
    const { emailLogCollection } = getCollections();
    const emails = await emailLogCollection
      .find({ type: 'sent' })
      .sort({ sentAt: -1 })
      .limit(100)
      .toArray();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInboxEmails = async (req, res) => {
  const { emailLogCollection } = getCollections();
  const limit = parseInt(req.query.limit) || 50;

  const imap = new Imap({
    user: 'prottoy.ceo@cloudcompany.cc',
    password: 'prottoylovessamia2441139',
    host: 'cloudcompany.cc',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    connTimeout: 10000,
    authTimeout: 10000,
    autotls: 'always',
  });

  const emails = [];
  let responded = false;

  const safeError = (err) => {
    if (!responded) {
      responded = true;
      res.status(500).json({ error: err.message });
    }
  };

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) { imap.end(); return safeError(err); }

      const total = box.messages.total;
      if (total === 0) {
        imap.end();
        responded = true;
        return res.json([]);
      }

      const start = Math.max(1, total - limit + 1);
      const fetch = imap.seq.fetch(`${start}:${total}`, {
        bodies: '', struct: true, markSeen: false,
      });

      const pending = [];

      fetch.on('message', (msg) => {
        let buffer = '';
        let attrs = {};

        msg.on('body', (stream) => {
          stream.on('data', chunk => buffer += chunk.toString('utf8'));
        });
        msg.once('attributes', (a) => { attrs = a; });
        msg.once('end', () => {
          pending.push({ buffer, attrs });
        });
      });

      fetch.once('end', async () => {
        imap.end();

        // Parse all messages
        for (const { buffer, attrs } of pending) {
          try {
            const parsed = await simpleParser(buffer);
            emails.push({
              uid: attrs.uid,
              type: 'inbox',
              from: parsed.from?.text || '',
              to: parsed.to?.text || '',
              subject: parsed.subject || '(no subject)',
              body: parsed.html || parsed.textAsHtml || parsed.text || '',
              textBody: parsed.text || '',
              receivedAt: parsed.date || new Date(),
              read: attrs.flags?.includes('\\Seen'),
              flags: attrs.flags || [],
            });
          } catch (e) {
            console.error('Parse error:', e);
          }
        }

        emails.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

        // Upsert to DB using uid
        if (emails.length > 0) {
          try {
            const ops = emails.map(email => ({
              updateOne: {
                filter: { type: 'inbox', uid: email.uid },
                update: { $set: email },   // ✅ $set not $setOnInsert — updates read status too
                upsert: true,
              },
            }));
            await emailLogCollection.bulkWrite(ops);
          } catch (e) {
            console.error('Inbox DB save error:', e);
          }
        }

        responded = true;
        res.json(emails);
      });

      fetch.once('error', safeError);
    });
  });

  imap.once('error', safeError);
  imap.once('end', () => console.log('IMAP connection ended'));
  imap.connect();
};

const getSavedInboxEmails = async (req, res) => {
  try {
    const { emailLogCollection } = getCollections();
    const emails = await emailLogCollection
      .find({ type: 'inbox' })
      .sort({ receivedAt: -1 })
      .limit(100)
      .toArray();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSentEmail = async (req, res) => {
  try {
    const { emailLogCollection } = getCollections();
    const result = await emailLogCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendEmail, getSentEmails, getInboxEmails, getSavedInboxEmails, deleteSentEmail };
