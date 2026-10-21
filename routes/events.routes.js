const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { deliverNotification, getDashboardLink } = require('../controllers/events.controller');

router.post('/events/deliver', deliverNotification);
router.get('/admin/eventsdashboardlink', requireAdmin, getDashboardLink);

module.exports = router;
