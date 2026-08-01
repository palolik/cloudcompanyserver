const express = require('express');
const router = express.Router();
const { getSocialMedia, addSocial, deleteSocial } = require('../controllers/social.controller');

router.get('/socialmedia', getSocialMedia);
router.post('/addsocials', addSocial);
router.delete('/delsocial/:id', deleteSocial);

module.exports = router;
