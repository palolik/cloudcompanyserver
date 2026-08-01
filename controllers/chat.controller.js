const { getCollections } = require('../config/db');
const { getFileUrl, geteFileUrl } = require('../config/multer');
const { broadcastMessage } = require('../sockets/registry');
const { notifyIfOffline, notifyCeoOfSupportMessage } = require('../services/notification.service');

const addClientChatFiles = async (req, res) => {
  const { clientchatCollection } = getCollections();
  const { orderId, bId, bName, sender, time, text } = req.body;

  if (!orderId || !bId || !bName || !sender || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const attachments = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: getFileUrl(orderId, file.filename),
    }));

    const newMessage = {
      orderId,
      bId,
      bName,
      text: text?.trim() || `📎 ${req.files.map((f) => f.originalname).join(', ')}`,
      sender,
      time,
      attachments,
      read: false
    };

    // Persist to MongoDB
    await clientchatCollection.insertOne(newMessage);
    setTimeout(async () => {
      broadcastMessage(orderId, newMessage);

      if (newMessage.sender === 'manager') {
        await notifyIfOffline(orderId, bId, newMessage, 'client');
      }
    }, 0);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving file message:', error);
    res.status(500).json({ message: 'Error saving file message' });
  }
};

const addEmployeeChatFiles = async (req, res) => {
  const { employeechatCollection } = getCollections();
  const { taskId, empId, empName, sender, time, text } = req.body;

  if (!taskId || !empId || !empName || !sender || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const attachments = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: geteFileUrl(taskId, file.filename),
    }));

    const newMessage = {
      taskId,
      empId,
      empName,
      text: text?.trim() || `📎 ${req.files.map(f => f.originalname).join(', ')}`,
      sender,
      time,
      attachments,
      read: false
    };

    await employeechatCollection.insertOne(newMessage);

    setTimeout(async () => {
      broadcastMessage(taskId, newMessage);

      if (newMessage.sender === 'manager') {
        await notifyIfOffline(taskId, empId, newMessage, 'employee');
      }
    }, 0);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving emp file message:', error);
    res.status(500).json({ message: 'Error saving file message' });
  }
};

const markEmployeeChatRead = async (req, res) => {
  try {
    const { employeechatCollection } = getCollections();
    const { taskId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ message: 'sender is required' });

    await employeechatCollection.updateMany(
      { taskId, sender, read: false },
      { $set: { read: true } }
    );

    broadcastMessage(taskId, { type: 'read_update', taskId, sender });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error marking as read' });
  }
};

const addEmployeeChat = async (req, res) => {
  const { employeechatCollection } = getCollections();
  const { taskId, empId, empName, text, time, sender } = req.body;

  if (!taskId || !empId || !empName || !text || !time || !sender) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingMessage = await employeechatCollection.findOne({ taskId, empId, text, time, sender });
    if (existingMessage) {
      return res.status(400).json({ message: 'Duplicate message' });
    }

    const newMessage = { taskId, empId, empName, text, time, sender, read: false };
    await employeechatCollection.insertOne(newMessage);

    res.status(201).json(newMessage);

    setTimeout(async () => {
      broadcastMessage(taskId, newMessage);

      if (newMessage.sender === 'manager') {
        await notifyIfOffline(taskId, empId, newMessage, 'employee');
      }
    }, 0);
  } catch (error) {
    console.error('Error adding employee message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
};

const getEmployeeChat = async (req, res) => {
  const { employeechatCollection } = getCollections();
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  try {
    const messages = await employeechatCollection.find({ taskId }).toArray();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching employee chat messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const addClientChat = async (req, res) => {
  const { clientchatCollection } = getCollections();
  const { orderId, bId, bName, text, time, sender } = req.body;

  if (!orderId || !bId || !bName || !text || !time || !sender) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingMessage = await clientchatCollection.findOne({ orderId, bId, text, time, sender });
    if (existingMessage) {
      return res.status(400).json({ message: 'Duplicate message' });
    }

    const newMessage = { orderId, bId, bName, text, time, sender, read: false };
    await clientchatCollection.insertOne(newMessage);

    res.status(201).json(newMessage);

    setTimeout(async () => {
      broadcastMessage(orderId, newMessage);

      if (newMessage.sender === 'manager') {
        await notifyIfOffline(orderId, bId, newMessage, 'client');
      }
    }, 0);

  } catch (error) {
    console.error('Error adding client message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
};

const markClientChatRead = async (req, res) => {
  try {
    const { clientchatCollection } = getCollections();
    const { orderId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ message: 'sender is required' });

    await clientchatCollection.updateMany(
      { orderId, sender, read: false },
      { $set: { read: true } }
    );

    broadcastMessage(orderId, { type: 'read_update', orderId, sender });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error marking as read' });
  }
};

const getClientChat = async (req, res) => {
  const { clientchatCollection } = getCollections();
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const messages = await clientchatCollection.find({ orderId }).toArray();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching client chat messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const addSupportChat = async (req, res) => {
  const { schatCollection } = getCollections();
  const { supportId, bId, bName, text, time, sender } = req.body;

  if (!supportId || !bId || !bName || !text || !time || !sender) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingMessage = await schatCollection.findOne({ supportId, bId, text, time, sender });
    if (existingMessage) {
      return res.status(400).json({ message: 'Duplicate message' });
    }
    const newMessage = {
      supportId,
      bId,
      bName,
      text,
      time,
      sender,
      read: false,
    };

    await schatCollection.insertOne(newMessage);
    res.status(201).json(newMessage);

    setTimeout(() => {
      broadcastMessage(supportId, newMessage);
      notifyCeoOfSupportMessage(newMessage);
    }, 0);
  } catch (error) {
    console.error('Error adding client message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
};

const getSupportChat = async (req, res) => {
  const { schatCollection } = getCollections();
  const { supportId } = req.params;
  if (!supportId) return res.status(400).json({ message: 'Support ID is required' });

  try {
    const messages = await schatCollection.find({ supportId }).toArray();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const markSupportChatRead = async (req, res) => {
  try {
    const { schatCollection } = getCollections();
    const { supportId } = req.params;
    const { sender } = req.body; // "user" or "manager"

    if (!sender) return res.status(400).json({ message: 'sender is required' });

    await schatCollection.updateMany(
      { supportId, sender, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error marking as read' });
  }
};

const getAdminSupportList = async (req, res) => {
  try {
    const { schatCollection } = getCollections();
    const supports = await schatCollection
      .aggregate([
        {
          $group: {
            _id: '$supportId',
            bName: { $first: '$bName' },
            bId: { $first: '$bId' },
            lastMessage: { $last: '$text' },
            lastTime: { $last: '$time' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$sender', 'user'] },
                      { $eq: ['$read', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { lastTime: -1 } }
      ])
      .toArray(); // 👈 VERY IMPORTANT

    res.status(200).json(supports);
  } catch (err) {
    console.error('Error fetching support list:', err);
    res.status(500).json({
      message: 'Error fetching support list',
      error: err.message || err,
    });
  }
};

module.exports = {
  addClientChatFiles,
  addEmployeeChatFiles,
  markEmployeeChatRead,
  addEmployeeChat,
  getEmployeeChat,
  addClientChat,
  markClientChatRead,
  getClientChat,
  addSupportChat,
  getSupportChat,
  markSupportChatRead,
  getAdminSupportList,
};
