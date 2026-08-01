const express = require('express');
const router = express.Router();
const {
  getAdvertise,
  addAdvertise,
  deleteAdvertise,
  incrementAdClicks,
  setAdStatus,
} = require('../controllers/advertise.controller');

router.get('/advertise', getAdvertise);
router.post('/addadvertise', addAdvertise);
router.delete('/deladvertise/:id', deleteAdvertise);
router.post('/adclicks/:adid', incrementAdClicks);
router.post('/adstatus/:adid', setAdStatus);

module.exports = router;
