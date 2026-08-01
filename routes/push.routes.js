const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/push.controller');

router.post('/push/subscribe', subscribe);

module.exports = router;
