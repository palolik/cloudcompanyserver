const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStats,
  incrementVisitorCount,
  getVisitorCount,
  getHomeCritical,
  getHomeSecondary,
} = require('../controllers/dashboard.controller');

router.get('/admindashboard', getAdminDashboard);
router.get('/stats', getStats);
router.post('/vcount', incrementVisitorCount);
router.get('/vcount', getVisitorCount);
router.get('/home/critical', getHomeCritical);
router.get('/home/secondary', getHomeSecondary);

module.exports = router;
