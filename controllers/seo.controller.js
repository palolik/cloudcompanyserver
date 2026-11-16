const { getCollections } = require('../config/db');
const { SITE_URL } = require('../config/env');

// Same facts the CCUser build (scripts/seo-build.mjs) publishes, so AI answers stay consistent.
const CONTACT = {
  email: 'support@cloudcompany.cc',
  phoneDisplay: '+880 1841-911105',
  city: 'Dhaka',
  country: 'Bangladesh',
};

const SUMMARY = `Cloud Company is a software development and digital agency based in ${CONTACT.city}, ${CONTACT.country}, founded in 2019. It builds custom websites and web apps, mobile apps, graphic design and brand identity, and runs social media marketing for businesses in Bangladesh and worldwide. Work is sold as fixed-price packages priced in Bangladeshi taka (BDT).`;

// Private and transactional routes kept out of every crawler group.
const PRIVATE_PATHS = [
  '/admin',
  '/client',
  '/requireddetails',
  '/employeesignup',
  '/employeeprofile/',
  '/clientprofile/',
  '/marketerprofile/',
  '/paymentgateway',
  '/forgot-password-otp',
  '/reset-password',
];

// AI search and assistant crawlers. A named group does not inherit the `*` rules,
// so each one repeats the private paths.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
  'Meta-ExternalAgent',
  'DuckAssistBot',
];

// ── helpers ──────────────────────────────────────────────────────────────────

const xmlEsc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

// HTML to one line of plain text.
const plain = (html = '') =>
  decodeEntities(
    String(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s = '', n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const taka = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `৳${n.toLocaleString('en-US')}` : null;
};

const ymd = (d) => {
  const t = d ? new Date(d) : new Date();
  return Number.isNaN(t.getTime()) ? new Date().toISOString().slice(0, 10) : t.toISOString().slice(0, 10);
};

const packagePath = (pkg) => `/packdetails/${pkg.slug || pkg._id}`;

const packageSummary = (p) =>
  p.metaDescription || truncate(plain(p.packageDetails), 200) || `${p.packageName} by Cloud Company.`;

const sendText = (res, body) => {
  res.type('text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(body.replace(/\n{3,}/g, '\n\n'));
};

// Public content shared by llms.txt and llms-full.txt.
const loadPublicContent = async () => {
  const { packageCollection, serviceCollection, faqCollection, blogCollection, socialCollection } = getCollections();
  const [packages, services, faqs, blogs, social] = await Promise.all([
    packageCollection.find({ status: 'approved' }).toArray(),
    serviceCollection.find().toArray(),
    faqCollection.find().toArray(),
    blogCollection
      .find({ status: 'published' }, { projection: { title: 1, slug: 1, shortDescription: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray(),
    socialCollection.find().toArray(),
  ]);

  return {
    packages: packages.filter((p) => p.packageName),
    services: services.filter((s) => s.serviceTitle),
    faqs: faqs
      .map((f) => ({ q: plain(f.faqquestion), a: plain(f.faqanswer) }))
      .filter((f) => f.q && f.a),
    blogs: blogs.filter((b) => b.slug && b.title),
    sameAs: social
      .map((s) => s.link)
      .filter((l) => /^https?:\/\//.test(l || '') && !/wa\.me|whatsapp/i.test(l)),
  };
};

const categoriesOf = (packages) => [...new Set(packages.map((p) => p.category || 'Other'))];

const header = (sameAs) => `# Cloud Company

> ${SUMMARY}

- Website: ${SITE_URL}
- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.phoneDisplay}
${sameAs.map((l) => `- ${l}`).join('\n')}
`;

const keyPages = `## Key pages

- [All packages](${SITE_URL}/buypackage)
- [About us](${SITE_URL}/aboutus)
- [Portfolio](${SITE_URL}/portfolio)
- [Blog](${SITE_URL}/blog)
- [Careers](${SITE_URL}/career)
`;

// ── robots.txt ───────────────────────────────────────────────────────────────

const robotsTxt = (req, res) => {
  const disallow = PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join('\n');
  res.type('text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`# Search engines and AI assistants are welcome to read and cite public pages.
# Plain-language summary for AI assistants: ${SITE_URL}/llms.txt (full version: ${SITE_URL}/llms-full.txt)
User-agent: *
Allow: /
${disallow}

# AI search and assistant crawlers (explicitly allowed; private paths still blocked)
${AI_CRAWLERS.map((ua) => `User-agent: ${ua}`).join('\n')}
Allow: /
${disallow}

Sitemap: ${SITE_URL}/sitemap.xml`);
};

// ── sitemap.xml ──────────────────────────────────────────────────────────────

const sitemapXml = async (req, res) => {
  try {
    const { packageCollection, portfolioCollection, blogCollection } = getCollections();
    const [packages, portfolioItems, blogs] = await Promise.all([
      packageCollection.find({ status: 'approved' }).toArray(),
      portfolioCollection.find({ status: 'visible' }).toArray(),
      blogCollection.find({ status: 'published' }).toArray(),
    ]);

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/buypackage', priority: '0.9', changefreq: 'weekly' },
      { url: '/aboutus', priority: '0.8', changefreq: 'monthly' },
      { url: '/portfolio', priority: '0.8', changefreq: 'weekly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
      { url: '/ourteam', priority: '0.7', changefreq: 'monthly' },
      { url: '/career', priority: '0.7', changefreq: 'weekly' },
      { url: '/termsandcondition', priority: '0.3', changefreq: 'yearly' },
      { url: '/privacypolicy', priority: '0.3', changefreq: 'yearly' },
    ];

    const packageUrls = packages.map((pkg) => ({
      url: packagePath(pkg),
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: pkg.updatedAt || pkg.createdAt,
    }));

    const portfolioUrls = portfolioItems.map((item) => ({
      url: `/portfolio/${item._id}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: item.updatedAt || item.createdAt,
    }));

    const blogUrls = blogs
      .filter((post) => post.slug)
      .map((post) => ({
        url: `/blog/${post.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: post.updatedAt || post.createdAt,
      }));

    const urlEntries = [...staticPages, ...packageUrls, ...portfolioUrls, ...blogUrls]
      .map(({ url, priority, changefreq, lastmod }) => `
  <url>
    <loc>${xmlEsc(`${SITE_URL}${url}`)}</loc>
    <lastmod>${ymd(lastmod)}</lastmod>
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

// ── llms.txt (https://llmstxt.org) ───────────────────────────────────────────
// Live version of the file the CCUser build writes, so new packages and posts
// reach AI assistants without a frontend redeploy.

const llmsTxt = async (req, res) => {
  try {
    const { packages, services, faqs, blogs, sameAs } = await loadPublicContent();

    const body = `${header(sameAs)}
${services.length ? `## Services

${services.map((s) => `- **${plain(s.serviceTitle)}**: ${truncate(plain(s.serviceDescription), 220)}`).join('\n')}
` : ''}
${packages.length ? `## Packages and prices

${categoriesOf(packages)
    .map((c) => `### ${c}

${packages
    .filter((p) => (p.category || 'Other') === c)
    .map((p) => {
      const bits = [taka(p.packagePrice), p.deliveryTime && `${p.deliveryTime} days`].filter(Boolean).join(', ');
      return `- [${plain(p.packageName)}](${SITE_URL}${packagePath(p)})${bits ? ` (${bits})` : ''}: ${plain(packageSummary(p))}`;
    })
    .join('\n')}`)
    .join('\n\n')}
` : ''}
${faqs.length ? `## Frequently asked questions

${faqs.map((f) => `- **${f.q}** ${f.a}`).join('\n')}
` : ''}
${blogs.length ? `## Articles

${blogs.map((b) => `- [${plain(b.title)}](${SITE_URL}/blog/${b.slug}): ${plain(b.shortDescription)}`).join('\n')}
` : ''}
${keyPages}
## Optional

- [Full package details and FAQs](${SITE_URL}/llms-full.txt)
`;

    sendText(res, body);
  } catch (error) {
    console.error('llms.txt generation error:', error);
    res.status(500).send('Error generating llms.txt');
  }
};

// Every package with full details, delivery options and its own FAQ, for
// assistants that want the complete picture in one fetch.
const llmsFullTxt = async (req, res) => {
  try {
    const { packages, services, faqs, blogs, sameAs } = await loadPublicContent();

    const packageBlock = (p) => {
      const facts = [
        taka(p.packagePrice) && `- Price: ${taka(p.packagePrice)} (BDT)`,
        p.deliveryTime && `- Delivery: ${p.deliveryTime} days`,
        p.category && `- Category: ${p.category}`,
        `- Page: ${SITE_URL}${packagePath(p)}`,
        `- Last updated: ${ymd(p.updatedAt || p.createdAt)}`,
      ].filter(Boolean);
      const pkgFaqs = (p.faqs || []).filter((f) => f?.q && f?.a);
      return `### ${plain(p.packageName)}

${facts.join('\n')}

${plain(p.packageDetails) || plain(packageSummary(p))}
${pkgFaqs.length ? `
#### Questions about ${plain(p.packageName)}

${pkgFaqs.map((f) => `**Q: ${plain(f.q)}**\nA: ${plain(f.a)}`).join('\n\n')}
` : ''}`;
    };

    const body = `${header(sameAs)}
## About

Cloud Company works with clients worldwide. Every service is sold as a fixed-price package with a stated delivery time; clients order online at ${SITE_URL}/buypackage, pay, and track progress from their client dashboard.

${services.length ? `## Services

${services.map((s) => `### ${plain(s.serviceTitle)}\n\n${plain(s.serviceDescription)}`).join('\n\n')}
` : ''}
${packages.length ? `${categoriesOf(packages)
    .map((c) => `## ${c} packages\n\n${packages.filter((p) => (p.category || 'Other') === c).map(packageBlock).join('\n')}`)
    .join('\n\n')}
` : ''}
${faqs.length ? `## Frequently asked questions

${faqs.map((f) => `**Q: ${f.q}**\nA: ${f.a}`).join('\n\n')}
` : ''}
${blogs.length ? `## Articles

${blogs.map((b) => `- [${plain(b.title)}](${SITE_URL}/blog/${b.slug}) (${ymd(b.updatedAt || b.createdAt)}): ${plain(b.shortDescription)}`).join('\n')}
` : ''}
${keyPages}`;

    sendText(res, body);
  } catch (error) {
    console.error('llms-full.txt generation error:', error);
    res.status(500).send('Error generating llms-full.txt');
  }
};

const home = (req, res) => {
  res.send('Cloud company is running 2.0');
};

module.exports = { robotsTxt, sitemapXml, llmsTxt, llmsFullTxt, home };
