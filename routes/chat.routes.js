const express = require('express');
const router = express.Router();
const { uploadchatfile, uploadechatfile } = require('../config/multer');
const {
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
} = require('../controllers/chat.controller');

router.post('/addclichat/files', uploadchatfile.array('files', 10), addClientChatFiles);
router.post('/addempchat/files', uploadechatfile.array('files', 10), addEmployeeChatFiles);
router.post('/empchat/mark-read/:taskId', markEmployeeChatRead);
router.post('/addempchat', addEmployeeChat);
router.get('/empchat/:taskId', getEmployeeChat);
router.post('/addclichat', addClientChat);
router.post('/clichat/mark-read/:orderId', markClientChatRead);
router.get('/clichat/:orderId', getClientChat);
router.post('/addschat', addSupportChat);
router.get('/schat/:supportId', getSupportChat);
router.post('/schat/mark-read/:supportId', markSupportChatRead);
router.get('/admin/support', getAdminSupportList);

module.exports = router;
