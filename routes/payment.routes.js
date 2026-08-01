const express = require('express');
const router = express.Router();
const {
  getPayments,
  addPayment,
  deletePayment,
  updateOrderPayment,
  updateCustomOrderPayment,
} = require('../controllers/payment.controller');

router.get('/payment', getPayments);
router.post('/addpayment', addPayment);
router.delete('/delpayment/:id', deletePayment);
router.put('/updateorderpayment/:id', updateOrderPayment);
router.put('/updatecustomorderpayment/:id', updateCustomOrderPayment);

module.exports = router;
