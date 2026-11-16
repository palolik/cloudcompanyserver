const express = require('express');
const router = express.Router();
const { robotsTxt, sitemapXml, llmsTxt, llmsFullTxt, home } = require('../controllers/seo.controller');

router.get('/robots.txt', robotsTxt);
router.get('/sitemap.xml', sitemapXml);
router.get('/llms.txt', llmsTxt);
router.get('/llms-full.txt', llmsFullTxt);
router.get('/', home);

module.exports = router;
