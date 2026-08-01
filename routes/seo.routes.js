const express = require('express');
const router = express.Router();
const { robotsTxt, sitemapXml, home } = require('../controllers/seo.controller');

router.get('/robots.txt', robotsTxt);
router.get('/sitemap.xml', sitemapXml);
router.get('/', home);

module.exports = router;
