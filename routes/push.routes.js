const express = require('express');
const router = express.Router();
const requireUser = require('../middleware/requireUser');
const { registerToken, unregisterToken } = require('../controllers/push.controller');

router.post('/push/device-token', requireUser, registerToken);
router.delete('/push/device-token', unregisterToken);

module.exports = router;
