const { getCollections } = require('../config/db');
const { SITE_URL } = require('../config/env');

const robotsTxt = (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

# Block admin, employee, and private routes
Disallow: /admin
Disallow: /admin/
Disallow: /client
Disallow: /requireddetails
Disallow: /employeesignup
Disallow: /employeeprofile/
Disallow: /clientprofile/
Disallow: /marketerprofile/

Sitemap: ${SITE_URL}/sitemap.xml`);
};

const sitemapXml = async (req, res) => {
  try {
    const { packageCollection, careerCollection } = getCollections();
    const [packages, careers] = await Promise.all([
      packageCollection.find({ status: { $ne: 'hidden' } }).toArray(),
      careerCollection.find().toArray(),
    ]);

    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/aboutus', priority: '0.8', changefreq: 'monthly' },
      { url: '/ourteam', priority: '0.7', changefreq: 'monthly' },
      { url: '/portfolio', priority: '0.8', changefreq: 'weekly' },
      { url: '/career', priority: '0.7', changefreq: 'weekly' },
      { url: '/buypackage', priority: '0.9', changefreq: 'weekly' },
      { url: '/signin', priority: '0.5', changefreq: 'yearly' },
      { url: '/clientsignin', priority: '0.5', changefreq: 'yearly' },
      { url: '/clientsignup', priority: '0.5', changefreq: 'yearly' },
    ];

    const packageUrls = packages.map((pkg) => ({
      url: `/packdetails/${pkg._id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: pkg.updatedAt
        ? new Date(pkg.updatedAt).toISOString().split('T')[0]
        : today,
    }));

    const careerUrls = careers.map((job) => ({
      url: `/career/${job._id}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: today,
    }));

    const allUrls = [...staticPages, ...packageUrls, ...careerUrls];

    const urlEntries = allUrls
      .map(({ url, priority, changefreq, lastmod }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
};

const home = (req, res) => {
  res.send('Cloud company is running 2.0');
};

module.exports = { robotsTxt, sitemapXml, home };
