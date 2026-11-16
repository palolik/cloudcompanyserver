const express = require('express');
const router = express.Router();
const requireAnyUser = require('../middleware/requireAnyUser');
const { registerToken, unregisterToken } = require('../controllers/push.controller');

router.post('/push/device-token', requireAnyUser, registerToken);
router.delete('/push/device-token', unregisterToken);

module.exports = router;
