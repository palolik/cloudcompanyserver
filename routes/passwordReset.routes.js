const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, resetPassword } = require('../controllers/passwordReset.controller');

router.post('/forgot-password/send-otp', sendOtp);
router.post('/forgot-password/verify-otp', verifyOtp);
router.post('/forgot-password/reset-password', resetPassword);

module.exports = router;
