const { getCollections } = require('../config/db');
const { SITE_URL } = require('../config/env');

const robotsTxt = (req, res) => {
  res.type('text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`User-agent: *
Allow: /

# Block admin, employee, and private/transactional routes
Disallow: /admin
Disallow: /admin/
Disallow: /client
Disallow: /requireddetails
Disallow: /employeesignup
Disallow: /employeeprofile/
Disallow: /clientprofile/
Disallow: /marketerprofile/
Disallow: /paymentgateway
Disallow: /forgot-password-otp
Disallow: /reset-password

Sitemap: ${SITE_URL}/sitemap.xml`);
};

const sitemapXml = async (req, res) => {
  try {
    const { packageCollection, portfolioCollection, blogCollection } = getCollections();
    const [packages, portfolioItems, blogs] = await Promise.all([
      packageCollection.find({ status: { $ne: 'hidden' } }).toArray(),
      portfolioCollection.find({ status: 'visible' }).toArray(),
      blogCollection.find({ status: 'published' }).toArray(),
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
      { url: '/termsandcondition', priority: '0.3', changefreq: 'yearly' },
      { url: '/privacypolicy', priority: '0.3', changefreq: 'yearly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
    ];

    const packageUrls = packages.map((pkg) => ({
      url: `/packdetails/${pkg._id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: pkg.updatedAt
        ? new Date(pkg.updatedAt).toISOString().split('T')[0]
        : today,
    }));

    const portfolioUrls = portfolioItems.map((item) => ({
      url: `/portfolio/${item._id}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: item.updatedAt
        ? new Date(item.updatedAt).toISOString().split('T')[0]
        : today,
    }));

    const blogUrls = blogs.map((post) => ({
      url: `/blog/${post.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: post.updatedAt
        ? new Date(post.updatedAt).toISOString().split('T')[0]
        : today,
    }));

    const allUrls = [...staticPages, ...packageUrls, ...portfolioUrls, ...blogUrls];

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
    res.set('Cache-Control', 'public, max-age=3600');
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
