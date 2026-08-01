const express = require('express');
const router = express.Router();
const { getHomeClient, addHomeClient, deleteHomeClient } = require('../controllers/homeClient.controller');

router.get('/hclient', getHomeClient);
router.post('/addhclient', addHomeClient);
router.delete('/delhclient/:id', deleteHomeClient);

module.exports = router;
