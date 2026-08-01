const express = require('express');
const router = express.Router();
const {
  sendEmail,
  getSentEmails,
  getInboxEmails,
  getSavedInboxEmails,
  deleteSentEmail,
} = require('../controllers/email.controller');

router.post('/send-email', sendEmail);
router.get('/emails/sent', getSentEmails);
router.get('/emails/inbox', getInboxEmails);
router.get('/emails/inbox/saved', getSavedInboxEmails);
router.delete('/emails/sent/:id', deleteSentEmail);

module.exports = router;
