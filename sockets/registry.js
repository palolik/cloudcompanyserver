const WebSocket = require('ws');

// roomId -> array of tagged WebSocket connections
const clients = new Map();

function broadcastMessage(identifier, message) {
  if (clients.has(identifier)) {
    clients.get(identifier).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

function isUserOnline(roomId, userId) {
  const roomClients = clients.get(roomId) || [];
  return roomClients.some(
    (ws) => ws.userId === userId && ws.readyState === WebSocket.OPEN
  );
}

module.exports = { clients, broadcastMessage, isUserOnline };
