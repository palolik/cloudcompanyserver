const express = require('express');
const router = express.Router();
const { getRecruitment, addRecruit, deleteRecruit } = require('../controllers/career.controller');

router.get('/recruitment', getRecruitment);
router.post('/addrecruit', addRecruit);
router.delete('/delrecruit/:id', deleteRecruit);

module.exports = router;
