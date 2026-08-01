const express = require('express');
const router = express.Router();
const { addFeedback, getFeedback, getPartners } = require('../controllers/legacyFeedback.controller');

router.post('/feedback', addFeedback);
router.get('/feedback', getFeedback);
router.get('/partners', getPartners);

module.exports = router;
