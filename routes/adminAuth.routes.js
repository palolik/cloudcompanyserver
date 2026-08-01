const express = require('express');
const router = express.Router();
const { adminLogin, clientPing } = require('../controllers/auth.controller');

// Registered after stampActivity in the original file — kept in index2.js's
// "Batch B" (post-stampActivity) group to preserve identical behavior.
router.post('/adminlogin', adminLogin);
router.post('/client-ping', clientPing);

module.exports = router;
