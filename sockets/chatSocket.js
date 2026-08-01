const WebSocket = require('ws');
const { getCollections } = require('../config/db');
const { clients, broadcastMessage } = require('./registry');
const { notifyIfOffline, notifyCeoOfSupportMessage } = require('../services/notification.service');

// Constructed with noServer so it never auto-attaches to an http.Server;
// upgrades are wired manually via attachWebSocketServer() once the real
// listening server exists (see index2.js). This is functionally identical
// to the original file, which passed `{ server }` to a plain http.Server
// that was never actually .listen()-ed — that automatic wiring never fired,
// and the real upgrade handling happened only through the manual
// server.on('upgrade', ...) + wss.handleUpgrade(...) call kept here.
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const taskId = url.searchParams.get('taskId');
  const orderId = url.searchParams.get('orderId');
  const supportId = url.searchParams.get('supportId');
  const userId = url.searchParams.get('userId'); // ← TAG: pass this from frontend

  const roomId = taskId || orderId || supportId;
  if (!roomId) return ws.close();

  // Tag the socket with userId so we can check it later
  ws.userId = userId;

  if (!clients.has(roomId)) clients.set(roomId, []);
  clients.get(roomId).push(ws);

  const { employeechatCollection, clientchatCollection, schatCollection } = getCollections();

  // Send existing messages
  if (taskId) {
    employeechatCollection.find({ taskId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  } else if (orderId) {
    clientchatCollection.find({ orderId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  } else if (supportId) {
    schatCollection.find({ supportId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  }

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);
      let newMessage;

      if (msg.taskId) {
        newMessage = {
          taskId: msg.taskId, empId: msg.empId, empName: msg.empName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await employeechatCollection.findOne({
          taskId: msg.taskId, empId: msg.empId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await employeechatCollection.insertOne(newMessage);
          broadcastMessage(msg.taskId, newMessage);
          // Notify the employee if offline (sender is manager, recipient is empId)
          await notifyIfOffline(msg.taskId, msg.empId, newMessage, 'employee');
        }

      } else if (msg.orderId) {
        newMessage = {
          orderId: msg.orderId, bId: msg.bId, bName: msg.bName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await clientchatCollection.findOne({
          orderId: msg.orderId, bId: msg.bId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await clientchatCollection.insertOne(newMessage);
          broadcastMessage(msg.orderId, newMessage);
          // Notify the client if offline
          await notifyIfOffline(msg.orderId, msg.bId, newMessage, 'client');
        }

      } else if (msg.supportId) {
        newMessage = {
          supportId: msg.supportId, bId: msg.bId, bName: msg.bName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await schatCollection.findOne({
          supportId: msg.supportId, bId: msg.bId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await schatCollection.insertOne(newMessage);
          broadcastMessage(msg.supportId, newMessage);
          await notifyIfOffline(msg.supportId, msg.bId, newMessage, 'client');
          await notifyCeoOfSupportMessage(newMessage);
        }
      }
    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  ws.on('close', () => {
    if (clients.has(roomId)) {
      clients.set(roomId, clients.get(roomId).filter(c => c !== ws));
      if (clients.get(roomId).length === 0) clients.delete(roomId);
    }
  });
});

function attachWebSocketServer(httpServer) {
  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
}

module.exports = { attachWebSocketServer };
