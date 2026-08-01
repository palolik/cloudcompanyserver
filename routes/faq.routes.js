const express = require('express');
const router = express.Router();
const { getFaq, addFaq, deleteFaq } = require('../controllers/faq.controller');

router.get('/faq', getFaq);
router.post('/addfaq', addFaq);
router.delete('/delfaq/:id', deleteFaq);

module.exports = router;
