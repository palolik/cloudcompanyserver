const express = require('express');
const router = express.Router();
const {
  addClientFeedback,
  getClientFeedbacks,
  setClientFeedbackStatus,
} = require('../controllers/clientFeedback.controller');

router.post('/clientfeedbacks', addClientFeedback);
router.get('/clientfeedbacks', getClientFeedbacks);
router.post('/clientfeedbacks/status/:reviewId', setClientFeedbackStatus);

module.exports = router;
