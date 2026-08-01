const express = require('express');
const router = express.Router();
const {
  getMarketing,
  generateMarketerCodes,
  getMarketerCodes,
  followReferralLink,
  incrementCouponUsage,
} = require('../controllers/marketing.controller');

router.get('/marketing', getMarketing);
router.post('/marketer/:userId/generate-codes', generateMarketerCodes);
router.get('/marketer/:userId/codes', getMarketerCodes);
router.get('/ref/:code', followReferralLink);
router.put('/marketer/coupon/:code', incrementCouponUsage);

module.exports = router;
