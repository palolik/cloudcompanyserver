const express = require('express');
const router = express.Router();
const { clientLogin, employeeLogin, employeePing } = require('../controllers/auth.controller');

// These three are registered before the app-wide stampActivity middleware in
// the original file, so they are intentionally mounted in index2.js's
// "Batch A" (pre-stampActivity) group. See controllers/adminAuth.controller.js
// for /adminlogin and /client-ping, which were registered after it.
router.post('/clientlogin', clientLogin);
router.post('/employeelogin', employeeLogin);
router.post('/employee-ping', employeePing);

module.exports = router;
