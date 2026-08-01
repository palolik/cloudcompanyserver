const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const {
  buyPackage,
  getOrders,
  getOrdersByUserId,
  getClientOrders,
  getOrderById,
  getPaidClientOrders,
  updateOrderContents,
  updateOrderCustomContents,
  setOrderStatus,
  setOrderPaymentStatus,
  testEmail,
  updatePackageStatus,
} = require('../controllers/orders.controller');

router.post('/buypackage', upload.array('mainPics'), buyPackage);
router.get('/orders', getOrders);
router.get('/clientorders/:id', getClientOrders);
router.get('/getorder/:id', getOrderById);
router.get('/paidclientorders/:id', getPaidClientOrders);
router.put('/updateordercontents/:orderId', updateOrderContents);
router.put('/updateordercustomcontents/:orderId', updateOrderCustomContents);
router.get('/orders/:userid', getOrdersByUserId);
router.post('/orderstatus/:orderid', setOrderStatus);
router.post('/orderpaymentstatus/:orderid', setOrderPaymentStatus);
router.get('/test-email', testEmail);
router.put('/updatePackageStatus/:orderId', updatePackageStatus);

module.exports = router;
