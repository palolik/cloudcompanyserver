const express = require('express');
const router = express.Router();
const { getMap, addMap, deleteMap } = require('../controllers/map.controller');

router.get('/map', getMap);
router.post('/addmap', addMap);
router.delete('/delmap/:id', deleteMap);

module.exports = router;
