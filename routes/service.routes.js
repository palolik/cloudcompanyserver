const express = require('express');
const router = express.Router();
const { getService, addService, deleteService } = require('../controllers/service.controller');

router.get('/service', getService);
router.post('/addservice', addService);
router.delete('/delservice/:id', deleteService);

module.exports = router;
