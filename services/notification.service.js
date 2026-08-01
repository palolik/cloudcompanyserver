const { ObjectId } = require('mongodb');
const { infoTransporter } = require('../config/mailer');
const { getCollections } = require('../config/db');
const { isUserOnline } = require('../sockets/registry');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getMessagePreview(message) {
  if (message.attachments?.length > 0) return '📎 Sent an attachment';
  if (message.text?.startsWith('📎')) return '📎 Sent an attachment';
  return message.text || 'New message';
}

async function getRecipientInfo(recipientType, recipientId, roomId) {
  const { employeeCollection, clientCollection, PsoldCollection, customPackageRequestCollection } = getCollections();

  if (recipientType === 'employee') {
    if (!ObjectId.isValid(recipientId)) return null;

    const employee = await employeeCollection.findOne({
      _id: new ObjectId(recipientId),
    });

    if (!employee?.remail) return null;

    return {
      name: employee.rname || 'Employee',
      email: employee.remail,
    };
  }

  if (recipientType === 'client') {
    let client = null;

    if (ObjectId.isValid(recipientId)) {
      client = await clientCollection.findOne({
        _id: new ObjectId(recipientId),
      });
    }

    if (client?.remail) {
      return {
        name: client.rname || 'Client',
        email: client.remail,
      };
    }

    if (ObjectId.isValid(roomId)) {
      const regularOrder = await PsoldCollection.findOne({
        _id: new ObjectId(roomId),
      });

      if (regularOrder?.email) {
        return {
          name: regularOrder.buyername || 'Client',
          email: regularOrder.email,
        };
      }

      const customOrder = await customPackageRequestCollection.findOne({
        _id: new ObjectId(roomId),
      });

      if (customOrder?.email) {
        return {
          name: customOrder.buyername || 'Client',
          email: customOrder.email,
        };
      }
    }
  }

  return null;
}

async function notifyIfOffline(roomId, recipientId, message, recipientType = 'client') {
  try {
    // Only manager messages should send email
    if (message.sender !== 'manager') return;

    // If recipient is online in this room, skip email
    if (isUserOnline(roomId, recipientId)) {
      console.log('Recipient is online, offline email skipped:', recipientId);
      return;
    }

    const { emailLogCollection } = getCollections();
    const preview = getMessagePreview(message);

    // Duplicate protection
    const existingEmail = await emailLogCollection.findOne({
      type: 'sent',
      chatRoomId: roomId,
      recipientId,
      recipientType,
      messageTime: message.time,
      messagePreview: preview,
    });

    if (existingEmail) {
      console.log('Duplicate offline email skipped:', recipientId);
      return;
    }

    const recipient = await getRecipientInfo(recipientType, recipientId, roomId);

    if (!recipient?.email) {
      console.log('Recipient email not found:', {
        recipientType,
        recipientId,
        roomId,
      });
      return;
    }

    const safeName = escapeHtml(recipient.name);
    const safePreview = escapeHtml(preview);

    const subject = 'New message from Cloud Company';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color:#2563eb; margin-top:0;">New Message Received</h2>

        <p>Hello <strong>${safeName}</strong>,</p>

        <p>You received a new message from Cloud Company while you were offline.</p>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0; color:#334155;">${safePreview}</p>
        </div>

        <p>Please login to your dashboard to reply.</p>

        <br/>
        <p style="color:#64748b; font-size:13px;">
          Best regards,<br/>
          <strong>Cloud Company Team</strong><br/>
          cloudcompany.cc
        </p>
      </div>
    `;

    await infoTransporter.sendMail({
      from: '"Cloud Company" <info@cloudcompany.cc>',
      to: recipient.email,
      subject,
      text: preview,
      html: htmlBody,
    });

    await emailLogCollection.insertOne({
      type: 'sent',
      from: 'info@cloudcompany.cc',
      senderName: 'Cloud Company',
      to: [recipient.email],
      cc: [],
      bcc: [],
      subject,
      body: htmlBody,
      chatRoomId: roomId,
      recipientId,
      recipientType,
      messagePreview: preview,
      messageTime: message.time,
      sentAt: new Date(),
      read: true,
    });

    console.log('Offline email sent to:', recipient.email);

  } catch (err) {
    console.error('Offline email notify error:', err.message);
  }
}

async function notifyCeoOfSupportMessage(message) {
  try {
    // Only notify when the USER sends a message (not the manager/CEO's own replies)
    if (message.sender !== 'user') return;

    const { emailLogCollection } = getCollections();
    const preview = getMessagePreview(message);
    const safeName = escapeHtml(message.bName || 'A user');
    const safePreview = escapeHtml(preview);
    const ceoEmail = 'prottoy.ceo@cloudcompany.cc';

    const subject = `New support message from ${message.bName || 'a user'}`;

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:10px;">
        <h2 style="color:#2563eb;margin-top:0;">New Support Message</h2>
        <p><strong>${safeName}</strong> sent a new message in support chat.</p>
        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0;color:#334155;">${safePreview}</p>
        </div>
        <p style="font-size:13px;color:#64748b;">
          Support ID: ${escapeHtml(message.supportId)}<br/>
          Time: ${escapeHtml(message.time)}
        </p>
        <p>Please login to the dashboard to reply.</p>
        <br/>
        <p style="color:#64748b;font-size:13px;">
          <strong>Cloud Company</strong><br/>cloudcompany.cc
        </p>
      </div>
    `;

    await infoTransporter.sendMail({
      from: '"Cloud Company Support" <info@cloudcompany.cc>',
      to: ceoEmail,
      subject,
      text: `${message.bName || 'A user'}: ${preview}`,
      html: htmlBody,
    });

    await emailLogCollection.insertOne({
      type: 'sent',
      from: 'info@cloudcompany.cc',
      senderName: 'Cloud Company Support',
      to: [ceoEmail],
      cc: [], bcc: [],
      subject,
      body: htmlBody,
      chatRoomId: message.supportId,
      recipientId: 'ceo',
      recipientType: 'ceo',
      messagePreview: preview,
      messageTime: message.time,
      sentAt: new Date(),
      read: true,
    });

    console.log('CEO notified of support message:', message.supportId);
  } catch (err) {
    console.error('CEO support notify error:', err.message);
  }
}

module.exports = {
  escapeHtml,
  getMessagePreview,
  getRecipientInfo,
  notifyIfOffline,
  notifyCeoOfSupportMessage,
};
