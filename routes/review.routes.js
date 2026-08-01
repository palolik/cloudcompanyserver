const express = require('express');
const router = express.Router();
const { getReview, addReview, deleteReview } = require('../controllers/review.controller');

router.get('/review', getReview);
router.post('/addreview', addReview);
router.delete('/delreview/:id', deleteReview);

module.exports = router;
