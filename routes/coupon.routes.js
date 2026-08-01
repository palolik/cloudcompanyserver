const express = require('express');
const router = express.Router();
const { getCoupon, getCouponShow, addCoupon, deleteCoupon } = require('../controllers/coupon.controller');

router.get('/coupon', getCoupon);
router.get('/couponshow', getCouponShow);
router.post('/addcoupon', addCoupon);
router.delete('/delcoupon/:id', deleteCoupon);

module.exports = router;
