// Inserts one placeholder ad per ad location so every slot on the user site can be checked.
// Each placeholder image shows the slot name and its reference size. Placeholders are
// marked { placeholder: true } and are live (status "active") for 30 days from today.
//
//   node scripts/seedPlaceholderAds.js            # replace existing placeholders with fresh ones
//   node scripts/seedPlaceholderAds.js --remove   # delete all placeholders
//   node scripts/seedPlaceholderAds.js --dry-run  # show what would happen, change nothing
//
// Uses MONGO_URI / DB_NAME from .env. Ads you created yourself are never touched.
// Slot sizes must match CCAdmin/src/adminside/Advertise/adSlots.js and
// CCUser/src/userside/userhome/ads/adSlots.js.
require('dotenv').config();
const { MongoClient } = require('mongodb');

const SLOTS = [
  { location: 'Header', label: 'Header banner', width: 1200, height: 150 },
  { location: 'Homepage Banner', label: 'Homepage banner', width: 1200, height: 400 },
  { location: 'Footer', label: 'Footer banner', width: 1200, height: 150 },
  { location: 'hls', label: 'Home left sidebar', width: 160, height: 600 },
  { location: 'hrs', label: 'Home right sidebar', width: 160, height: 600 },
  { location: 'Sidebar', label: 'Both home sidebars', width: 160, height: 600 },
  { location: 'Popup', label: 'Popup', width: 600, height: 600 },
];

const REDIRECT = 'https://cloudcompany.cc';
const LIVE_DAYS = 30;

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// SVG placeholder as a data URI, so no file hosting is needed.
const placeholderImage = ({ label, width, height }) => {
  const tall = height > width * 1.5;
  const big = Math.round(tall ? width * 0.14 : Math.min(height * 0.22, width * 0.09));
  const small = Math.round(tall ? big * 0.55 : Math.min(big * 0.55, width / 30));
  const cx = width / 2;
  const cy = height / 2;
  const lines = tall
    ? [
        { text: 'AD', size: big * 1.4, dy: -big * 2.2, weight: 700 },
        ...label.split(' ').map((w, i, arr) => ({
          text: w,
          size: small,
          dy: (i - (arr.length - 1) / 2) * small * 1.3,
          weight: 600,
        })),
        { text: `${width}×${height}`, size: small, dy: big * 2.2, weight: 700 },
      ]
    : [
        { text: `PLACEHOLDER AD · ${label}`, size: small, dy: -big * 0.75, weight: 600 },
        { text: `${width} × ${height} px`, size: big, dy: big * 0.45, weight: 700 },
      ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><pattern id="s" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="24" fill="#e2e8f0"/></pattern></defs>
<rect width="100%" height="100%" fill="#f1f5f9"/><rect width="100%" height="100%" fill="url(#s)"/>
<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="12 8"/>
${lines
  .map(
    (l) =>
      `<text x="${cx}" y="${cy + l.dy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(l.size)}" font-weight="${l.weight}" fill="#1e3a8a">${escapeXml(l.text)}</text>`
  )
  .join('\n')}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ymd = (d) => d.toISOString().slice(0, 10);

async function main() {
  const remove = process.argv.includes('--remove');
  const dryRun = process.argv.includes('--dry-run');
  const { MONGO_URI, DB_NAME } = process.env;
  if (!MONGO_URI || !DB_NAME) throw new Error('Set MONGO_URI and DB_NAME in .env');

  const host = (MONGO_URI.match(/@([^/?]+)/) || [])[1] || 'unknown host';
  console.log(`Target: ${host} / ${DB_NAME}.advertisement${dryRun ? ' (dry run)' : ''}`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  try {
    const ads = client.db(DB_NAME).collection('advertisement');
    const existing = await ads.countDocuments({ placeholder: true });

    if (remove) {
      console.log(`Removing ${existing} placeholder ad(s).`);
      if (!dryRun) await ads.deleteMany({ placeholder: true });
      return;
    }

    const today = new Date();
    const till = new Date(today.getTime() + LIVE_DAYS * 86400000);
    const docs = SLOTS.map((slot) => ({
      imglink: placeholderImage(slot),
      location: slot.location,
      rdlink: REDIRECT,
      startdate: ymd(today),
      tilldate: ymd(till),
      status: 'active',
      clicks: 0,
      createdAt: today,
      placeholder: true,
    }));

    console.log(`Replacing ${existing} existing placeholder(s) with ${docs.length}:`);
    SLOTS.forEach((s) => console.log(`  ${s.location.padEnd(16)} ${s.width}×${s.height}`));
    console.log(`Live ${ymd(today)} → ${ymd(till)}. Remove later with --remove.`);

    if (!dryRun) {
      await ads.deleteMany({ placeholder: true });
      await ads.insertMany(docs);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
