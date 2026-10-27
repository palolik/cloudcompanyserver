# Package Catalog Plan (BDT)

Draft for review. Nothing in the database has changed yet. **Prices are approved.**

- All prices are in **BDT (৳)**. VAT is not included.
- Prices are stored as plain numbers in `packagePrice` / `expressDeliveryPrice` (for example `"18000"`).
- `deliveryTime` / `expressDeliveryTime` are in days.
- **Action** values: `MODIFY` updates the existing doc and keeps its `_id`, `clicks` and `tsold`. `NEW` inserts a new doc. `MOVE` changes its category. `DELETE` removes the doc.
- **Format on insert:** each package's **Details** section below is written in Markdown for easy review. When it's applied, it gets converted to HTML (`<h3>`, `<p>`, `<ul>`, `<ol>`) and saved to `packageDetails`, the same format your rich-text editor already saves. **Requirements** is saved as an `<ol>` list in `packageRequirements`.
- **SEO fields** (`slug`, `metaTitle`, `metaDescription`, `keywords` as an array, and `faqs` as an array of `{q, a}`) are saved on each package doc. The FAQ is shown on the page and also output as FAQPage schema.
- There are no cover images yet. Upload them later through `PUT /updatepackage/:id`.

---

## Categories

| Category | Status |
|---|---|
| Web packages | keep |
| Start Up packages | keep |
| Student packages | keep |
| Social media packages | **add to `category` collection** (already used by packages, missing from collection) |
| E-commerce packages | **NEW** |
| Branding & Design | **NEW** |

---

## Summary

| # | Action | Category | Package | Price ৳ | Days | Express |
|---|---|---|---|---|---|---|
| 1 | MODIFY | Social media | Facebook Page Starter | 6,000 | 7 | 3d / +2,000 |
| 2 | MODIFY | Social media | Instagram Growth Plan (monthly) | 12,000 | 30 | — |
| 3 | MODIFY | Social media | TikTok Content Pack | 10,000 | 10 | 5d / +3,000 |
| 4 | MODIFY | Social media | LinkedIn Profile & Content | 7,500 | 7 | 3d / +2,000 |
| 5 | NEW | Social media | Business Social Media Management (monthly) | 20,000 | 30 | — |
| 6 | NEW | Web | Landing Page | 8,000 | 4 | 2d / +2,500 |
| 7 | MODIFY | Web | Basic Business Website | 18,000 | 10 | 5d / +5,000 |
| 8 | MODIFY | Web | Blog Website + SEO Setup | 15,000 | 7 | 3d / +4,000 |
| 9 | MODIFY | Web | Corporate Website | 55,000 | 20 | 12d / +12,000 |
| 10 | NEW | Web | Monthly SEO Care | 12,000 | 30 | — |
| 11 | NEW | E-commerce | F-commerce Starter Shop | 25,000 | 12 | 7d / +6,000 |
| 12 | NEW | E-commerce | E-commerce Pro | 60,000 | 25 | 15d / +15,000 |
| 13 | NEW | Branding | Logo Design | 4,000 | 3 | 1d / +1,500 |
| 14 | MODIFY + MOVE | Branding | Brand Identity Kit | 20,000 | 10 | 5d / +5,000 |
| 15 | NEW | Start Up | Micro Startup Kit | 20,000 | 10 | 5d / +5,000 |
| 16 | MODIFY | Start Up | Business Launch Essentials | 65,000 | 30 | 18d / +15,000 |
| 17 | MODIFY | Start Up | Investor Pitch Pack | 35,000 | 14 | 7d / +8,000 |
| 18 | NEW | Start Up | Startup MVP Build | 1,50,000 | 45 | 30d / +40,000 |
| 19 | NEW | Student | CV / Resume Makeover | 800 | 2 | 1d / +300 |
| 20 | NEW | Student | Student Portfolio Website | 3,500 | 5 | 2d / +1,000 |
| 21 | MODIFY | Student | Career Counseling | 1,500 | 7 | 2d / +500 |
| 22 | MODIFY | Student | Internship Starter | 2,500 | 7 | 3d / +800 |
| 23 | MODIFY | Student | Basic Coding Course (8 weeks) | 4,500 | 56 | — |
| 24 | NEW | Student | Final Year Project Mentoring | 6,000 | 30 | — |
| 25 | MODIFY | Student | Study Abroad Guidance | 8,000 | 21 | 10d / +2,500 |
| 26 | DELETE | Start Up | Test package goes here | — | — | — |

"—" means there's no express option. It's stored as `"0"` / `"0"` (see Open questions).

---

# Social media packages

## 1. Facebook Page Starter
`MODIFY 66e1adaf9639ace72c0a26e1` (was "Facebook Engagement Starter", 30) · **৳6,000** · 7 days · Express 3 days +৳2,000

**SEO:**
- `slug`: facebook-page-setup-bangladesh
- `metaTitle`: Facebook Page Setup & Design in Bangladesh – ৳6,000
- `metaDescription`: Professional Facebook page setup in Bangladesh: branded profile, cover, 12 post designs and captions. Only ৳6,000, ready in 7 days. Get started today.
- `keywords`: facebook page setup bangladesh, facebook page design price in bd, facebook business page create, f-commerce page setup dhaka, facebook post design bangladesh, facebook page kivabe sajabo

**Contents:** Page Setup & Optimization, Profile + Cover Design, 12 Post Designs, Captions & Hashtags, Insights Report

**Details:**

### Turn your Facebook page into a real business page
In Bangladesh, most customers first find a business on Facebook. If your page looks empty or unprofessional, they'll scroll past. Our Facebook page setup service in Bangladesh gives your page a complete, branded setup and a full month of ready-to-post content, so you look trustworthy from day one.

### Who this is for
- New businesses opening their first Facebook page
- F-commerce sellers whose page looks unfinished
- Shops, restaurants, salons, coaching centres and service providers who want a cleaner presence

### What's included
- **Page setup & optimization:** category, About section, contact info, location, business hours, WhatsApp button, call-to-action button and a custom username
- **Profile picture & cover design:** sized correctly for mobile and desktop, matching your brand colors
- **12 post designs:** a mix of product / service posts, offers, testimonials and engagement posts
- **Captions & hashtags:** written in Bangla, English or a mix of both, to suit your audience
- **Content calendar:** when to post each design for the best reach (usually 7–10 PM)
- **Insights report:** a short report after setup explaining your audience and what to post more of

### How it works
1. You fill in a short brief and share your logo and page access.
2. We set up and optimize the page within 2 days.
3. We send the 12 post designs and captions for your review.
4. You get 2 rounds of revisions, then the final files and calendar.

### Good to know
- Posting is done by you, or add our monthly management for ৳20,000/month.
- Facebook ad (boost) budget isn't included.
- We never sell fake likes or followers. All growth is organic.

**FAQ:**
- **Q:** How much does Facebook page setup cost in Bangladesh?
  **A:** Our Facebook Page Starter costs ৳6,000. It includes full page setup, profile and cover design, and 12 post designs with captions.
- **Q:** How long does it take?
  **A:** Regular delivery is 7 days. Express delivery is 3 days for an extra ৳2,000.
- **Q:** Can you create a new page if I don't have one?
  **A:** Yes. Give us permission and we'll create and set up a new business page for you.
- **Q:** Do you sell likes or followers?
  **A:** No. We only do organic growth, because bought likes can get your page restricted.

**Requirements:**
1. Facebook page link (admin access) or permission to create a new page
2. Logo and brand colors (if you have them)
3. Business info: services / products, prices, address, phone number
4. Product / service photos (optional)

---

## 2. Instagram Growth Plan
`MODIFY 66e1adaf9639ace72c0a26e2` (was "Instagram Influencer Pack", 120) · **৳12,000 / month** · 30 days · No express

**SEO:**
- `slug`: instagram-marketing-service-bangladesh
- `metaTitle`: Instagram Marketing Service in Bangladesh – ৳12,000/mo
- `metaDescription`: Monthly Instagram marketing in Bangladesh: 15 post designs, 8 reels edits, hashtag research and a growth report for ৳12,000/month. Grow with real followers.
- `keywords`: instagram marketing bangladesh, instagram management service bd, instagram growth service dhaka, instagram reels editing bangladesh, instagram post design price in bd, instagram follower barano

**Contents:** Profile Optimization, 15 Post Designs, 8 Reels / Story Edits, Hashtag Research, Monthly Report

**Details:**

### Grow your Instagram the right way, every month
Instagram rewards accounts that post consistently, use reels and look visually consistent. This monthly Instagram marketing service in Bangladesh handles the hard part: planning, designing and editing your content, so your profile keeps growing with real followers who actually care about your brand.

### Who this is for
- Fashion, beauty, food and lifestyle brands
- Influencers and content creators who want a professional feed
- Businesses that sell to a young, urban audience

### What's included every month
- **Profile optimization:** bio, highlights covers, link-in-bio setup and username review (first month)
- **15 post designs:** carousels, single images and quote posts in a consistent visual style
- **8 reels / story edits:** edited from your raw footage, with trending audio, text and transitions
- **Hashtag research:** a custom hashtag set for your niche, updated monthly
- **Content calendar:** a planned posting schedule for the full month
- **Monthly report:** follower growth, reach, top posts and next month's recommendations

### How it works
1. Kick-off call to understand your brand, audience and goals.
2. We plan the month's content and share the calendar for approval.
3. Designs and edits are delivered weekly so you can post on time.
4. At month end you get the report and next month's plan.

### Good to know
- This is a monthly subscription. You can cancel before the next month starts.
- Photo / video shooting isn't included. You send the raw content.
- No bought followers. Growth comes from content and consistency.

**FAQ:**
- **Q:** How much does Instagram management cost in Bangladesh?
  **A:** The Instagram Growth Plan is ৳12,000 per month and includes 15 post designs, 8 reels or story edits, hashtag research and a monthly report.
- **Q:** Is there a minimum contract?
  **A:** No. It's a monthly subscription, and you can cancel before the next month starts.
- **Q:** Do you shoot photos and videos?
  **A:** Shooting isn't included. You send raw photos and clips, and we design and edit them.
- **Q:** Can I pay with bKash or Nagad?
  **A:** Yes. You can pay using the mobile banking options shown at checkout.

**Requirements:**
1. Instagram handle (and login, if you want us to post)
2. Brand assets: logo, colors, fonts
3. Raw photos and videos for reels each month
4. Your target audience and goals

---

## 3. TikTok Content Pack
`MODIFY 66e1adaf9639ace72c0a26e4` (was "TikTok Viral Boost", 150) · **৳10,000** · 10 days · Express 5 days +৳3,000

**SEO:**
- `slug`: tiktok-video-editing-bangladesh
- `metaTitle`: TikTok Video Editing Service in Bangladesh – ৳10,000
- `metaDescription`: 8 trend-ready TikTok videos edited with hooks, subtitles and trending audio, plus hashtags and a posting plan. ৳10,000, delivered in 10 days in Bangladesh.
- `keywords`: tiktok video editing bangladesh, tiktok marketing service bd, short video editing price in bd, reels editing service dhaka, tiktok content creator bangladesh, tiktok video edit kore dibo

**Contents:** 8 Short Video Edits, Trend Research, Captions & Hashtags, Posting Schedule

**Details:**

### Short videos edited to perform
TikTok is the fastest way to reach a large audience in Bangladesh, but only if your videos hook people in the first 2 seconds. Our TikTok video editing service turns your raw clips into eight trend-ready short videos with captions, audio and hooks built for the algorithm. They can also be reused on Facebook Reels and YouTube Shorts.

### Who this is for
- Brands and shops starting on TikTok
- Creators who shoot content but don't have time to edit
- Businesses that want reusable short videos across platforms

### What's included
- **8 short video edits (15–60 seconds):** hook, cuts, subtitles, text overlays and trending audio
- **Trend research:** current trends and sounds that fit your niche
- **Captions & hashtags:** written for each video
- **Posting schedule:** the best days and times to post for your audience
- **Cross-platform export:** files sized for TikTok, Reels and Shorts

### How it works
1. You share your raw clips (or we send you a simple shooting guide first).
2. We research trends and plan a hook for each video.
3. The first 4 edits are delivered for feedback, then the remaining 4.
4. You get 1 round of revisions per video.

### Good to know
- Filming isn't included. You can shoot on your phone using our guide.
- We don't sell views, likes or shares. Bought engagement can get accounts restricted.

**FAQ:**
- **Q:** How much does TikTok video editing cost?
  **A:** The TikTok Content Pack is ৳10,000 for 8 edited short videos, with trend research, captions, hashtags and a posting schedule.
- **Q:** Can I shoot the videos on my phone?
  **A:** Yes. Phone footage works well, and we can send you a simple shooting guide first.
- **Q:** Can I use the videos on Facebook Reels too?
  **A:** Yes. We export every video sized for TikTok, Facebook / Instagram Reels and YouTube Shorts.
- **Q:** How many revisions do I get?
  **A:** You get 1 round of revisions for each video.

**Requirements:**
1. TikTok profile link
2. Raw video clips (phone footage is fine)
3. Logo and brand colors
4. Any products / offers you want to highlight

---

## 4. LinkedIn Profile & Content
`MODIFY 66e1adaf9639ace72c0a26e3` (was "LinkedIn Professional Growth", 100) · **৳7,500** · 7 days · Express 3 days +৳2,000

**SEO:**
- `slug`: linkedin-profile-optimization-bangladesh
- `metaTitle`: LinkedIn Profile Optimization in Bangladesh – ৳7,500
- `metaDescription`: Get a rewritten LinkedIn profile, custom banner and 8 ready-to-post drafts. LinkedIn profile optimization in Bangladesh for ৳7,500, delivered in 7 days.
- `keywords`: linkedin profile optimization bangladesh, linkedin profile writing service bd, linkedin banner design, linkedin profile kivabe banabo, linkedin branding dhaka, linkedin content writing bangladesh

**Contents:** Profile Rewrite, Banner Design, Headline & About Section, 8 Post Drafts

**Details:**

### Make LinkedIn work for your career or business
Recruiters, clients and investors check LinkedIn before they reply to you. With our LinkedIn profile optimization service in Bangladesh, we rewrite your profile so it clearly shows your value, and give you a month of post drafts to build visibility in your industry.

### Who this is for
- Professionals looking for a new job or a promotion
- Founders and consultants who want inbound clients
- Freelancers targeting foreign clients

### What's included
- **Headline & About section:** keyword-rich and written to convert profile visits into messages
- **Experience section rewrite:** achievements with numbers, not just job duties
- **Custom banner design:** matches your personal or company brand
- **Skills & featured section setup:** the right skills for search, plus featured work
- **8 post drafts:** ready-to-post content on your expertise, with a posting plan
- **Networking tips:** how to connect and engage without being spammy

### How it works
1. You share your CV and goals through a short form.
2. We send the full profile rewrite and banner within 4 days.
3. After revisions, you receive the 8 post drafts.

### Good to know
- We don't sell connections or profile views. Growth comes from a strong profile and regular posting.
- Students: see **Internship Starter** for a cheaper student version.

**FAQ:**
- **Q:** How much does LinkedIn profile optimization cost?
  **A:** It costs ৳7,500, including a full profile rewrite, a banner design and 8 post drafts.
- **Q:** How long does it take?
  **A:** The profile rewrite and banner arrive within 4 days, and the full package within 7 days. Express delivery is 3 days for ৳2,000 extra.
- **Q:** Do I need to share my LinkedIn password?
  **A:** No. We send you the new text and banner, and you update the profile yourself.
- **Q:** Is there a cheaper option for students?
  **A:** Yes. The Internship Starter package (৳2,500) includes LinkedIn optimization along with a CV makeover and a mock interview.

**Requirements:**
1. LinkedIn profile link
2. Updated CV
3. Career or business goals
4. A professional photo (optional, we can advise)

---

## 5. Business Social Media Management
`NEW` · Social media packages · **৳20,000 / month** · 30 days · No express

**SEO:**
- `slug`: social-media-management-bangladesh
- `metaTitle`: Social Media Management in Bangladesh – ৳20,000/month
- `metaDescription`: Full Facebook & Instagram management in Bangladesh: 20 designs, 4 reels, ad setup, inbox replies and monthly reports for ৳20,000/month. Hand it over to us.
- `keywords`: social media management bangladesh, facebook page management service bd, social media marketing agency dhaka, facebook ads management bangladesh, digital marketing agency in bangladesh, facebook marketing price in bd

**Contents:** Facebook + Instagram, 20 Post Designs, 4 Reels, Ad Campaign Setup, Inbox / Comment Replies, Monthly Report

**Details:**

### Hand over your social media and focus on your business
Running Facebook and Instagram properly takes hours every day: designing, posting, replying, running ads. With our monthly social media management service in Bangladesh, our team handles all of it, so your pages stay active, your customers get quick replies and your ad money is spent wisely.

### Who this is for
- Small and medium businesses without an in-house marketing team
- Restaurants, clinics, real estate, education and retail brands
- F-commerce businesses that get lots of inbox messages

### What's included every month
- **Facebook + Instagram management:** posting for you on both platforms
- **20 post designs:** offers, products, educational and engagement content
- **4 reels:** edited from your footage
- **Ad campaign setup & monitoring:** targeting, creatives and weekly budget optimization
- **Inbox & comment replies:** during business hours, using an approved reply guide
- **Monthly report:** reach, engagement, ad results, cost per message / lead, and next steps

### How it works
1. Onboarding call: goals, audience, tone of voice and FAQ for replies.
2. A content calendar is shared at the start of each month for approval.
3. Our team posts, replies and runs ads throughout the month.
4. Monthly review call with the report.

### Good to know
- The **ad budget is paid separately** by you, directly to Meta. We recommend at least ৳5,000/month to start.
- Monthly subscription. Cancel any time before the next billing month.
- Photo / video shoots can be arranged for an extra cost.

**FAQ:**
- **Q:** How much does social media management cost in Bangladesh?
  **A:** Our plan is ৳20,000 per month for Facebook and Instagram, including 20 designs, 4 reels, ad setup, inbox replies and a monthly report.
- **Q:** Is the Facebook ad budget included?
  **A:** No. You pay the ad budget directly to Meta. We recommend starting with at least ৳5,000 per month.
- **Q:** Do you reply to customer messages?
  **A:** Yes. We reply to inbox messages and comments during business hours, using a reply guide you approve.
- **Q:** Can I cancel any time?
  **A:** Yes. It's a monthly subscription, and you can cancel before the next billing month.

**Requirements:**
1. Admin access to the Facebook page and Instagram account
2. Brand assets: logo, colors, fonts
3. Monthly ad budget and business goals
4. Product / service info and common customer questions

---

# Web packages

## 6. Landing Page
`NEW` · Web packages · **৳8,000** · 4 days · Express 2 days +৳2,500

**SEO:**
- `slug`: landing-page-design-bangladesh
- `metaTitle`: Landing Page Design in Bangladesh – ৳8,000
- `metaDescription`: High-converting landing page design in Bangladesh with an order form, WhatsApp button and Facebook Pixel. Only ৳8,000, live in 4 days. Boost your ad sales.
- `keywords`: landing page design bangladesh, landing page price in bd, sales page design dhaka, facebook ads landing page, single page website bangladesh, landing page banate koto taka lage

**Contents:** 1 Page Design, Responsive, Contact / Order Form, Facebook Pixel Setup

**Details:**

### One page, one goal: more orders
A landing page is a single focused page built to turn visitors into buyers or leads. Our landing page design service in Bangladesh works best with Facebook and Google ads, because visitors land on a page made only for your offer, with no distractions.

### Who this is for
- Sellers running Facebook ads for a single product
- Campaigns, events, webinars and course launches
- Businesses that need a quick, low-cost web presence

### What's included
- **1 custom page design:** headline, benefits, product images, testimonials, FAQ and call-to-action
- **Mobile-first, responsive layout:** most of your visitors are on phones
- **Contact or order form:** orders sent to your email (or Google Sheet)
- **WhatsApp / Messenger button:** for instant conversations
- **Facebook Pixel & Google Analytics setup:** track ad results properly
- **Speed optimization:** loads fast even on mobile data

### How it works
1. You share your product details and offer.
2. We write the page structure and design it within 2–3 days.
3. You review, we revise (2 rounds), then we publish it live.

### Good to know
- A domain and hosting can be added for about ৳2,500/year, or we can publish it on your existing site.
- Copywriting help is included. We polish your text for sales.

**FAQ:**
- **Q:** How much does a landing page cost in Bangladesh?
  **A:** Our landing page package costs ৳8,000, including design, an order form, a WhatsApp button and Facebook Pixel setup.
- **Q:** How fast can it go live?
  **A:** Regular delivery is 4 days. Express delivery is 2 days for an extra ৳2,500.
- **Q:** Are a domain and hosting included?
  **A:** Not by default. We can add them for about ৳2,500 per year, or publish the page on your existing website.
- **Q:** How many revisions do I get?
  **A:** You get 2 rounds of revisions before the page goes live.

**Requirements:**
1. Product or offer details (price, features, benefits)
2. Product images and logo
3. Customer reviews / testimonials (if any)
4. Domain (if you already have one)

---

## 7. Basic Business Website
`MODIFY 66e1adaf9639ace72c0a26f1` (was "Basic Website Design", 200, status `pending` → `approved`) · **৳18,000** · 10 days · Express 5 days +৳5,000

**SEO:**
- `slug`: website-design-bangladesh
- `metaTitle`: Website Design in Bangladesh – 5 Pages from ৳18,000
- `metaDescription`: Professional 5-page business website in Bangladesh with .com domain, 1 year hosting, SSL and basic SEO included. ৳18,000, ready in 10 days. Get yours now.
- `keywords`: website design bangladesh, website design price in bangladesh, business website dhaka, wordpress website bd, website banate koto taka lage, web design company in bangladesh, small business website bd

**Contents:** 5 Pages, Responsive Design, .com Domain + 1 Year Hosting, Contact Form & Google Map, Basic SEO

**Details:**

### A professional website for your small business
A website makes your business look established and lets customers find you on Google. This website design package for small businesses in Bangladesh gives you a clean, modern 5-page website with your domain and hosting included, so there's nothing else to buy.

### Who this is for
- Small businesses, shops and local service providers
- Professionals: doctors, lawyers, consultants, architects
- Businesses that only have a Facebook page today

### What's included
- **5 pages:** Home, About, Services / Products, Gallery or Blog, Contact
- **Responsive design:** looks great on mobile, tablet and desktop
- **.com domain + 1 year hosting:** with a free SSL certificate (https)
- **Contact form & Google Map:** plus WhatsApp and social media links
- **Basic SEO:** page titles, descriptions, sitemap and Google Search Console setup
- **Easy content editing:** update text and images yourself (WordPress)
- **1 month free support:** small fixes and help after launch

### How it works
1. Discovery: we gather your content and look at sites you like.
2. Design: we share the homepage design for approval.
3. Development: we build all pages and connect the domain.
4. Review & launch: 2 rounds of revisions, then go live, plus a short training video on editing.

### Good to know
- Renewal of domain + hosting after the first year is about ৳4,000/year.
- Content writing for all pages can be added for ৳3,000.

**FAQ:**
- **Q:** How much does a website cost in Bangladesh?
  **A:** Our Basic Business Website is ৳18,000 for 5 pages, including a .com domain, 1 year of hosting, SSL and basic SEO.
- **Q:** How long does it take to build?
  **A:** Regular delivery is 10 days. Express delivery is 5 days for an extra ৳5,000.
- **Q:** Can I update the website myself?
  **A:** Yes. It's built on WordPress, and we give you a short training video on editing text and images.
- **Q:** What does it cost after the first year?
  **A:** Domain and hosting renewal is about ৳4,000 per year.

**Requirements:**
1. Company logo
2. Page content (text about your business and services)
3. Photos of your work, products or office
4. Preferred domain name

---

## 8. Blog Website + SEO Setup
`MODIFY 66e1adaf9639ace72c0a26f3` (was "SEO Optimized Blog", 300) · **৳15,000** · 7 days · Express 3 days +৳4,000

**SEO:**
- `slug`: seo-blog-website-bangladesh
- `metaTitle`: SEO Blog Website Design in Bangladesh – ৳15,000
- `metaDescription`: SEO-ready blog website with keyword research for 20 keywords, sitemap and Search Console setup. ৳15,000, delivered in 7 days in Bangladesh. Start ranking.
- `keywords`: blog website bangladesh, seo blog setup bd, wordpress blog design dhaka, blog site banano, adsense blog website bangladesh, keyword research service bd

**Contents:** Blog Setup, SEO Plugin & Sitemap, Keyword Research (20 keywords), Google Search Console

**Details:**

### A blog built to rank on Google
Writing great content isn't enough if Google can't find it. We build a fast, SEO-ready blog website for Bangladeshi writers and businesses, and give you keyword research, so every article you write has a real chance of bringing in free traffic.

### Who this is for
- Bloggers and writers starting out
- Influencers and creators building their own platform
- Businesses using content marketing to attract customers

### What's included
- **Blog website setup:** clean, fast theme with categories, tags and author pages
- **SEO plugin configuration:** meta titles, descriptions, schema and an XML sitemap
- **Keyword research:** 20 target keywords with search volume and difficulty
- **Google Search Console & Analytics:** connected and verified
- **Speed & mobile optimization:** important for Google rankings
- **Article template:** an SEO-friendly structure for your future posts
- **AdSense-ready layout:** spaces prepared for ads if you want to monetize

### How it works
1. You tell us your topic, audience and preferred design style.
2. We build the blog and do the keyword research in parallel.
3. We deliver the blog, a keyword sheet and a short SEO writing guide.

### Good to know
- Domain + hosting is about ৳4,000/year if you don't have one.
- Ongoing SEO is available in **Monthly SEO Care**.

**FAQ:**
- **Q:** How much does an SEO blog website cost?
  **A:** The Blog Website + SEO Setup is ৳15,000, including blog setup, SEO configuration and keyword research for 20 keywords.
- **Q:** Is the blog ready for Google AdSense?
  **A:** Yes. The layout has ad spaces prepared, so you can apply for AdSense once you have enough content.
- **Q:** Are a domain and hosting included?
  **A:** No. If you don't have them, a domain and hosting cost about ৳4,000 per year.
- **Q:** Do you write the articles?
  **A:** This package doesn't include articles, but you get an SEO article template and writing guide. Monthly SEO Care includes 4 articles per month.

**Requirements:**
1. Blog topic and niche
2. Target audience
3. Preferred domain name
4. Logo (optional)

---

## 9. Corporate Website
`MODIFY 66e1adaf9639ace72c0a26f4` (was 800) · **৳55,000** · 20 days · Express 12 days +৳12,000

**SEO:**
- `slug`: corporate-website-development-bangladesh
- `metaTitle`: Corporate Website Development in Bangladesh – ৳55,000
- `metaDescription`: Custom corporate website in Bangladesh: 10–15 pages, unique UI design, advanced SEO, GA4 and 3 months of support. ৳55,000, delivered in 20 days. Talk to us.
- `keywords`: corporate website development bangladesh, company website design dhaka, corporate website price in bd, custom website design bangladesh, web development company dhaka, garments buying house website

**Contents:** 10–15 Pages, Custom UI Design, Advanced SEO, Google Analytics 4, Blog / News Section, 3 Months Support

**Details:**

### A website that matches the size of your company
For established companies, the website is often the first meeting with a client, investor or partner. As a corporate website development team in Bangladesh, we design and build a custom website that reflects your brand, explains your business clearly and performs well on Google.

### Who this is for
- Established companies, factories and group of companies
- Garment buyers' houses, real estate, NGOs and educational institutions
- Businesses working with foreign clients and partners

### What's included
- **10–15 pages:** Home, About, Leadership, Services, Projects / Portfolio, Clients, Careers, News, Contact and more
- **Custom UI design:** designed from scratch to match your brand, not a ready-made template
- **Advanced SEO:** keyword mapping, schema markup, speed optimization and local SEO
- **Google Analytics 4 & Search Console:** with conversion tracking for forms
- **Blog / news section:** publish company updates and press releases
- **Careers section:** job posts with an application form
- **Security setup:** SSL, backups, firewall and spam protection
- **3 months free support:** fixes, small updates and monitoring

### How it works
1. Discovery meeting: goals, sitemap and content plan.
2. UI design of key pages in Figma for approval.
3. Development, content upload and SEO setup.
4. Testing on all devices, training session, and launch.

### Good to know
- Domain + premium hosting can be arranged (about ৳8,000–12,000/year).
- Bangla + English bilingual version can be added on request.
- Professional content writing and photography are available at extra cost.

**FAQ:**
- **Q:** How much does a corporate website cost in Bangladesh?
  **A:** Our Corporate Website package is ৳55,000 for 10–15 pages with custom UI design, advanced SEO, GA4 and 3 months of support.
- **Q:** How long does development take?
  **A:** Regular delivery is 20 days. Express delivery is 12 days for an extra ৳12,000.
- **Q:** Can the website be in both Bangla and English?
  **A:** Yes. A bilingual version can be added on request.
- **Q:** Is hosting included?
  **A:** Domain and premium hosting can be arranged separately, for about ৳8,000–12,000 per year.

**Requirements:**
1. Company profile and service details
2. Content for each page (or a content brief)
3. Branding guidelines / logo files
4. Photos of projects, team and office

---

## 10. Monthly SEO Care
`NEW` · Web packages · **৳12,000 / month** · 30 days · No express

**SEO:**
- `slug`: seo-service-bangladesh
- `metaTitle`: SEO Service in Bangladesh – Monthly Plan ৳12,000
- `metaDescription`: Monthly SEO service in Bangladesh: technical fixes, 4 SEO articles, local SEO on Google Maps and ranking reports for ৳12,000/month. Grow free Google traffic.
- `keywords`: seo service bangladesh, seo company in dhaka, seo price in bangladesh, local seo bangladesh, google business profile optimization bd, website ranking service bd, seo expert bangladesh

**Contents:** Technical SEO Audit, On-page Fixes, 4 SEO Articles, Local SEO (Google Business Profile), Monthly Ranking Report

**Details:**

### Climb Google rankings month by month
SEO is a long-term investment. Every month you rank higher, you get more free visitors who are already searching for what you sell. This monthly SEO service in Bangladesh keeps your website improving steadily with technical fixes, content and local SEO.

### Who this is for
- Businesses with a website that gets little or no traffic
- Local businesses that want to appear on Google Maps
- E-commerce shops that want to reduce ad spending

### What's included every month
- **Technical SEO audit:** speed, broken links, indexing and mobile issues fixed
- **On-page optimization:** titles, headings, internal links and images
- **4 SEO articles:** keyword-researched articles (800–1,000 words each)
- **Local SEO:** Google Business Profile optimization, posts and review strategy
- **Keyword tracking:** monitor rankings for your target keywords
- **Monthly report:** traffic, rankings, work done and next month's plan

### How it works
1. Month 1: full audit, keyword strategy and quick technical fixes.
2. Ongoing months: content, optimization and local SEO.
3. Monthly report and review call.

### Good to know
- Results usually show in **3–6 months**. We recommend a minimum of 3 months.
- No guaranteed #1 ranking. Nobody honest can guarantee that.
- Backlink building can be added separately.

**FAQ:**
- **Q:** How much does SEO cost in Bangladesh?
  **A:** Our Monthly SEO Care plan is ৳12,000 per month, including technical fixes, 4 SEO articles, local SEO and a ranking report.
- **Q:** How long does SEO take to show results?
  **A:** Results usually show in 3–6 months, so we recommend at least 3 months.
- **Q:** Can you guarantee a #1 ranking on Google?
  **A:** No. Nobody can honestly guarantee rankings, but we focus on steady, measurable growth in traffic and positions.
- **Q:** Will my business show on Google Maps?
  **A:** Local SEO with Google Business Profile optimization is included every month to improve your Maps visibility.

**Requirements:**
1. Website admin access
2. Google Analytics & Search Console access (or we set them up)
3. Target keywords / service areas
4. Competitor websites (optional)

---

# E-commerce packages (new category)

## 11. F-commerce Starter Shop
`NEW` · E-commerce packages · **৳25,000** · 12 days · Express 7 days +৳6,000

**SEO:**
- `slug`: ecommerce-website-for-facebook-sellers-bd
- `metaTitle`: E-commerce Website for Facebook Sellers in BD – ৳25,000
- `metaDescription`: Move your Facebook shop to your own website: up to 50 products, COD, bKash / Nagad, order dashboard, domain and hosting. ৳25,000, ready in 12 days.
- `keywords`: f-commerce website bangladesh, ecommerce website price in bd, online shop website dhaka, facebook page theke website, cash on delivery website bd, bkash nagad ecommerce website, small ecommerce website bangladesh

**Contents:** Shop Website, Up to 50 Products, Cash on Delivery, bKash / Nagad (manual), Order Management, Domain + 1 Year Hosting

**Details:**

### Move your Facebook shop to your own website
Taking orders through Messenger is slow and messy. Customers ask the same questions again and again, and orders get lost. An e-commerce website built for Facebook sellers in Bangladesh lets customers browse, choose and order by themselves, while you manage everything from one dashboard.

### Who this is for
- Facebook / Instagram sellers (clothing, cosmetics, gadgets, food, crafts)
- Home-based businesses ready to grow
- Sellers who want to look more trustworthy than a page-only shop

### What's included
- **Online shop website:** home, shop, product, cart, checkout and order tracking pages
- **Up to 50 products uploaded:** with images, prices, sizes / colors
- **Cash on Delivery:** with Inside Dhaka / Outside Dhaka delivery charges
- **bKash / Nagad payment (manual):** customers enter the transaction ID at checkout
- **Order management dashboard:** see, update and print orders
- **Order notifications:** by email (SMS can be added)
- **.com domain + 1 year hosting:** with SSL
- **Facebook Pixel setup:** for retargeting ads

### How it works
1. You send your product list and photos.
2. We design and build the shop, then upload the products.
3. A test order is placed together with you.
4. Launch, plus a training session on managing orders and adding products.

### Good to know
- Automatic payment gateway and courier integration are in **E-commerce Pro**.
- Renewal of domain + hosting after the first year is about ৳5,000/year.
- More than 50 products uploaded: ৳1,000 per extra 25 products.

**FAQ:**
- **Q:** How much does an e-commerce website cost for a Facebook seller?
  **A:** The F-commerce Starter Shop is ৳25,000, including up to 50 products, COD, bKash / Nagad payment, an order dashboard, and a domain and hosting for 1 year.
- **Q:** Can customers pay with bKash or Nagad?
  **A:** Yes. Customers send money to your number and enter the transaction ID at checkout. Cash on Delivery is also supported.
- **Q:** What if I have more than 50 products?
  **A:** We upload extra products at ৳1,000 per 25 products, or you can add them yourself after training.
- **Q:** Is courier integration included?
  **A:** Not in this package. Automatic courier booking with Steadfast / Pathao is included in E-commerce Pro.

**Requirements:**
1. Product list with names, prices, sizes / colors
2. Product photos
3. Logo and shop name
4. Delivery charges and bKash / Nagad merchant or personal numbers

---

## 12. E-commerce Pro
`NEW` · E-commerce packages · **৳60,000** · 25 days · Express 15 days +৳15,000

**SEO:**
- `slug`: ecommerce-website-development-bangladesh
- `metaTitle`: E-commerce Website Development in Bangladesh – ৳60,000
- `metaDescription`: Full e-commerce website in Bangladesh with SSLCommerz / bKash gateway, Steadfast / Pathao courier integration, inventory and admin dashboard. ৳60,000.
- `keywords`: ecommerce website development bangladesh, ecommerce website price in bangladesh, sslcommerz integration, bkash payment gateway website, online shop development dhaka, courier integration steadfast pathao, ecommerce company in bangladesh

**Contents:** Unlimited Products, SSLCommerz / bKash Payment Gateway, Courier Integration (Steadfast / Pathao), Admin Dashboard, Coupons & Inventory, 3 Months Support

**Details:**

### A complete online store that runs like a real business
For growing brands, manual work slows everything down. Our e-commerce website development in Bangladesh automates payments, courier booking and stock, so you can handle hundreds of orders without extra staff.

### Who this is for
- Established online brands with regular daily orders
- Retail shops opening an online store
- Brands planning to scale with ads

### What's included
- **Custom-designed store:** brand-focused design, not a basic template
- **Unlimited products:** with variants, categories, filters and search
- **Payment gateway:** SSLCommerz (cards, bKash, Nagad, Rocket) or direct bKash checkout
- **Courier integration:** Steadfast / Pathao / RedX. Book parcels and track delivery from the dashboard
- **Admin dashboard:** orders, customers, sales reports and staff roles
- **Coupons & discounts:** codes, flash sales and free-delivery offers
- **Inventory management:** low-stock alerts and stock sync
- **Customer accounts:** order history, wishlist and reorder
- **SMS / email notifications:** order confirmation and delivery updates
- **SEO & speed optimization, Pixel and GA4**
- **3 months free support**

### How it works
1. Discovery: products, workflows, payment and courier choice.
2. Store design for approval.
3. Development, integrations and product import.
4. Full testing with real test orders, staff training, and launch.

### Good to know
- A **trade license** and bank account are needed to activate a payment gateway. We help with the application.
- Gateway charges (about 1.5–2.5% per transaction) are paid to the provider.
- SMS credits are bought separately.

**FAQ:**
- **Q:** How much does a full e-commerce website cost in Bangladesh?
  **A:** E-commerce Pro is ৳60,000, including a payment gateway, courier integration, an admin dashboard, inventory and 3 months of support.
- **Q:** Do I need a trade license for the payment gateway?
  **A:** Yes. SSLCommerz and bKash merchant gateways need a trade license and a bank account, and we help with the application.
- **Q:** Which couriers can be integrated?
  **A:** Steadfast, Pathao and RedX, so you can book parcels and track delivery right from your dashboard.
- **Q:** Who owns the website?
  **A:** You do. The store, its data and your customer list all belong to your business.

**Requirements:**
1. Product catalog (Excel / CSV) with photos
2. Trade license and bank details (for the payment gateway)
3. Courier merchant accounts (or we help you open them)
4. Branding: logo, colors, fonts

---

# Branding & Design (new category)

## 13. Logo Design
`NEW` · Branding & Design · **৳4,000** · 3 days · Express 1 day +৳1,500

**SEO:**
- `slug`: logo-design-bangladesh
- `metaTitle`: Logo Design in Bangladesh – 3 Concepts for ৳4,000
- `metaDescription`: Original logo design in Bangladesh: 3 concepts, 2 revisions and all source files (AI, SVG, PNG) with full ownership. Only ৳4,000, delivered in 3 days.
- `keywords`: logo design bangladesh, logo design price in bd, logo design dhaka, professional logo designer bd, business logo banano, company logo design bangladesh

**Contents:** 3 Concepts, 2 Revisions, Source Files (AI / SVG / PNG)

**Details:**

### A logo people remember
Your logo appears everywhere: your page, packaging, shop sign and website. Our logo design service in Bangladesh creates an original logo (no templates, no clip-art) that fits your business and works at any size.

### Who this is for
- New businesses and startups
- F-commerce shops that need a proper brand mark
- Businesses refreshing an outdated logo

### What's included
- **3 original logo concepts:** different directions to choose from
- **2 rounds of revisions:** on your chosen concept
- **Color & black / white versions:** for every use case
- **All source files:** AI, SVG, PDF, PNG (transparent) and JPG
- **Social media sizes:** profile picture versions for Facebook, Instagram and more
- **Full ownership:** the copyright is yours

### How it works
1. You fill in a short brief: name, business, style and colors you like.
2. We research your industry and competitors.
3. 3 concepts are delivered. You pick one.
4. Revisions, then the final file package.

### Good to know
- Need business cards, colors and a full brand system too? See **Brand Identity Kit**.

**FAQ:**
- **Q:** How much does logo design cost in Bangladesh?
  **A:** Our Logo Design package is ৳4,000, with 3 concepts, 2 revisions and all source files.
- **Q:** How fast can I get my logo?
  **A:** Regular delivery is 3 days. Express delivery is 1 day for an extra ৳1,500.
- **Q:** Will I own the copyright?
  **A:** Yes. You get full ownership and all source files (AI, SVG, PDF, PNG, JPG).
- **Q:** Do you use templates?
  **A:** No. Every logo is designed from scratch for your business.

**Requirements:**
1. Business name (and tagline, if any)
2. Industry and what you sell
3. Style preferences and logos you like
4. Colors you like or want to avoid

---

## 14. Brand Identity Kit
`MODIFY + MOVE 66e1adaf9639ace72c0a2704` (was Start Up, 500) · Category: Start Up packages → **Branding & Design** · **৳20,000** · 10 days · Express 5 days +৳5,000

**SEO:**
- `slug`: brand-identity-design-bangladesh
- `metaTitle`: Brand Identity Design in Bangladesh – ৳20,000
- `metaDescription`: Complete brand identity in Bangladesh: logo, colors, Bangla + English fonts, stationery, social media kit and a brand guideline PDF. ৳20,000 in 10 days.
- `keywords`: brand identity design bangladesh, branding agency dhaka, branding package price in bd, business card and letterhead design, brand guideline design, corporate branding bangladesh

**Contents:** Logo Design, Color Palette & Typography, Business Card & Letterhead, Social Media Kit, Brand Guideline PDF

**Details:**

### Look like one brand everywhere
A strong brand looks the same on your Facebook page, your packaging and your business card. This brand identity design package for Bangladeshi businesses gives you a complete visual system and a guideline book, so anyone who designs for you stays on brand.

### Who this is for
- Startups preparing to launch
- Growing businesses whose look is inconsistent
- Companies rebranding

### What's included
- **Logo design:** 3 concepts, revisions and all variations (primary, secondary, icon)
- **Color palette:** primary and secondary colors with HEX, RGB and CMYK codes
- **Typography:** brand fonts for headings and body text (Bangla + English)
- **Business card & letterhead:** print-ready files
- **Email signature:** HTML signature for Gmail / Outlook
- **Social media kit:** profile picture, cover, and 5 post templates (editable in Canva)
- **Brand guideline PDF:** rules for logo use, colors, fonts and do's & don'ts
- **Mockups:** see your brand on signboards, bags, shirts and screens

### How it works
1. Brand workshop: values, audience, competitors and personality.
2. Logo concepts, then selection and revisions.
3. The full identity system is built around the logo.
4. Final handover of all files and the guideline book.

### Good to know
- Printing costs aren't included, but we can connect you with trusted printers.
- Packaging design can be added on request.

**FAQ:**
- **Q:** How much does a brand identity package cost?
  **A:** The Brand Identity Kit is ৳20,000, including logo, colors, typography, stationery, a social media kit and a brand guideline PDF.
- **Q:** What's the difference from the Logo Design package?
  **A:** Logo Design gives you just the logo. The Brand Identity Kit builds a full visual system around it, including business cards, templates and a guideline book.
- **Q:** Is printing included?
  **A:** No, but you get print-ready files, and we can connect you with trusted printers.
- **Q:** Can I edit the social media templates myself?
  **A:** Yes. The post templates are editable in Canva.

**Requirements:**
1. Brand values and personality
2. Target audience
3. Competitors and brands you admire
4. Existing logo (if rebranding)

---

# Start Up packages

## 15. Micro Startup Kit
`NEW` · Start Up packages · **৳20,000** · 10 days · Express 5 days +৳5,000

**SEO:**
- `slug`: startup-branding-package-bangladesh
- `metaTitle`: Startup Package for Small Business in Bangladesh – ৳20,000
- `metaDescription`: Launch your small business in Bangladesh with a logo, Facebook page setup, 10 post designs, a landing page and business card, all for ৳20,000 in 10 days.
- `keywords`: startup package bangladesh, small business branding bd, new business setup dhaka, home business logo and page, startup branding price in bd, notun business shuru korte ki lage

**Contents:** Logo Design, Facebook Page Setup, 10 Post Designs, 1 Landing Page, Business Card Design

**Details:**

### Everything a small startup needs, in one budget-friendly kit
Starting small doesn't mean looking small. This startup package for small businesses in Bangladesh bundles the essentials (logo, Facebook page, launch content and a landing page) at a lower price than buying them separately, so you can launch with confidence.

### Who this is for
- Home-based and online businesses just starting out
- Students and young entrepreneurs launching their first venture
- Small shops and service providers going digital

### What's included
- **Logo design:** 2 concepts, 2 revisions, all source files
- **Facebook page setup:** full optimization, profile picture and cover design
- **10 launch post designs:** introduction, product / service and offer posts with captions
- **1 landing page:** a simple page with your offer, contact form and WhatsApp button
- **Business card design:** print-ready
- **Launch checklist:** a step-by-step plan for your first 30 days

### How it works
1. Short brief and kick-off call.
2. Logo first. Everything else is built on your chosen logo.
3. Page setup, posts and landing page are delivered together.
4. Final review, handover, and your launch plan.

### Good to know
- Separately these services cost about ৳26,000. You save around ৳6,000.
- Domain + hosting for the landing page is about ৳2,500/year if needed.

**FAQ:**
- **Q:** What does a small startup need to launch online?
  **A:** At minimum: a logo, a professional Facebook page, launch content and a simple landing page. This kit includes all of them for ৳20,000.
- **Q:** How much do I save compared to buying separately?
  **A:** Bought separately, these services cost about ৳26,000, so you save around ৳6,000.
- **Q:** How long does it take?
  **A:** Regular delivery is 10 days. Express delivery is 5 days for an extra ৳5,000.
- **Q:** Is a domain included for the landing page?
  **A:** Not by default. A domain and hosting cost about ৳2,500 per year if you need them.

**Requirements:**
1. Business idea and name
2. Products / services and prices
3. Preferred colors and style
4. Phone number and address for the page

---

## 16. Business Launch Essentials
`MODIFY 66e1adaf9639ace72c0a2701` (was 1000) · **৳65,000** · 30 days · Express 18 days +৳15,000

**SEO:**
- `slug`: business-launch-package-bangladesh
- `metaTitle`: Business Launch Package in Bangladesh – ৳65,000
- `metaDescription`: Complete business launch package in Bangladesh: brand identity, website with hosting, social media setup, 1 month management and a business plan. ৳65,000.
- `keywords`: business launch package bangladesh, startup branding and website bd, new company setup dhaka, branding website social media package, startup agency bangladesh, business plan outline bd

**Contents:** Brand Identity Kit, 5–7 Page Website + Hosting, Facebook & Instagram Setup, 1 Month Social Media Management, Business Plan Outline

**Details:**

### Launch your business with everything ready
This is our complete business launch package for Bangladesh. In one month you get a full brand, a professional website, social media pages set up and managed for the first month, and a business plan outline. That's everything you need to open your doors properly.

### Who this is for
- Funded startups and new companies
- Entrepreneurs who want one team to handle the whole launch
- Existing businesses relaunching under a new brand

### What's included
- **Brand Identity Kit:** logo, colors, typography, stationery, social kit and guideline PDF
- **5–7 page website:** responsive, with .com domain, 1 year hosting and basic SEO
- **Facebook & Instagram setup:** fully optimized and branded pages
- **1 month social media management:** 15 posts, 2 reels and ad campaign setup
- **Business plan outline:** business model, target market, pricing review and a 6-month action plan
- **Launch campaign plan:** what to post and promote in launch week

### How it works
1. Week 1: discovery workshop and brand identity.
2. Week 2–3: website design and development, plus social media setup.
3. Week 3–4: business plan outline and launch campaign.
4. Launch, then 1 month of managed social media.

### Good to know
- Separately these services cost about ৳80,000+.
- The ad budget for the launch campaign is paid separately.

**FAQ:**
- **Q:** What's included in the Business Launch Essentials package?
  **A:** A full brand identity, a 5–7 page website with hosting, Facebook and Instagram setup, 1 month of social media management and a business plan outline, all for ৳65,000.
- **Q:** How long does the full launch take?
  **A:** Regular delivery is 30 days. Express delivery is 18 days for an extra ৳15,000.
- **Q:** Is the ad budget included?
  **A:** No. The ad budget for your launch campaign is paid separately, directly to Meta.
- **Q:** How much do I save versus buying separately?
  **A:** Bought separately, these services cost about ৳80,000 or more.

**Requirements:**
1. Business idea and model
2. Branding preferences
3. Target market and competitors
4. Website content and product / service details

---

## 17. Investor Pitch Pack
`MODIFY 66e1adaf9639ace72c0a2703` (was 1200) · **৳35,000** · 14 days · Express 7 days +৳8,000

**SEO:**
- `slug`: pitch-deck-design-bangladesh
- `metaTitle`: Pitch Deck Design in Bangladesh – Investor Pack ৳35,000
- `metaDescription`: Investor-ready pitch deck design in Bangladesh: 12–15 slides, TAM / SAM / SOM market sizing, a financial model and an executive summary. ৳35,000 in 14 days.
- `keywords`: pitch deck design bangladesh, investor pitch deck bd, startup pitch deck dhaka, financial projection for startup, market size research bangladesh, startup competition pitch deck

**Contents:** 12–15 Slide Pitch Deck, Market Size (TAM / SAM / SOM), Financial Projection Template, One-page Executive Summary

**Details:**

### Pitch with confidence
Investors see hundreds of pitches. A clear story, solid numbers and professional design make yours stand out. Our pitch deck design service in Bangladesh works with you to shape your story, research your market and design a deck that's ready for investors, incubators and startup competitions.

### Who this is for
- Startups raising pre-seed or seed funding
- Founders applying to incubators and accelerators
- Teams joining startup competitions and pitch events

### What's included
- **12–15 slide pitch deck:** problem, solution, market, product, business model, traction, competition, team, financials and the ask
- **Storyline workshop:** a 1-hour session to shape your pitch narrative
- **Market sizing:** TAM / SAM / SOM research with sources, focused on Bangladesh and your target markets
- **Competitor analysis:** a comparison table and positioning
- **Financial projection template:** a 3-year revenue, cost and profit model (Excel / Google Sheets)
- **One-page executive summary:** to send before meetings
- **Editable files:** PowerPoint / Google Slides and PDF

### How it works
1. Storyline workshop and data collection.
2. Market research and financial model.
3. Deck writing and design, plus first review.
4. 2 rounds of revisions and final delivery, with pitch practice tips.

### Good to know
- We don't guarantee funding. We make sure your pitch is clear and professional.
- Pitch rehearsal sessions can be added on request.

**FAQ:**
- **Q:** How much does a pitch deck cost?
  **A:** The Investor Pitch Pack is ৳35,000, including a 12–15 slide deck, market sizing, a financial projection template and a one-page summary.
- **Q:** Do you guarantee that I'll get funding?
  **A:** No. Funding decisions are up to investors, but we make sure your pitch is clear, data-backed and professional.
- **Q:** Will I get editable files?
  **A:** Yes. You get PowerPoint / Google Slides files, a PDF, and the financial model in Excel / Google Sheets.
- **Q:** How many revisions are included?
  **A:** 2 rounds of revisions are included before final delivery.

**Requirements:**
1. Company info and product details
2. Traction numbers (users, revenue, growth)
3. Funding amount and planned use of funds
4. Team details

---

## 18. Startup MVP Build
`NEW` · Start Up packages · **৳1,50,000** · 45 days · Express 30 days +৳40,000

**SEO:**
- `slug`: mvp-development-bangladesh
- `metaTitle`: MVP Web App Development in Bangladesh – ৳1,50,000
- `metaDescription`: Turn your startup idea into a working MVP web app in Bangladesh: UI/UX, up to 5 core features, admin panel and deployment, with full code ownership.
- `keywords`: mvp development bangladesh, startup app development dhaka, web app development company bd, custom software development bangladesh, saas development bangladesh, startup tech partner bd

**Contents:** Web App MVP (up to 5 core features), Admin Panel, User Auth, Deployment, 1 Month Bug Fix Support

**Details:**

### Turn your idea into a working product
An MVP (Minimum Viable Product) is the simplest version of your product that real users can use. It's how you test your idea, win your first customers and show investors something real. As an MVP development team in Bangladesh, we help you cut the idea down to what matters, then design, build and launch it.

### Who this is for
- Founders with an idea who need a technical team
- Startups validating a product before raising money
- Businesses digitizing an internal process

### What's included
- **Discovery & scoping:** we turn your idea into a clear feature list and user flows
- **UI/UX design:** clickable design of the main screens
- **Web app with up to 5 core features:** for example booking, listings, payments, chat or dashboards
- **User authentication:** sign up, login, password reset and roles
- **Admin panel:** manage users, content and data
- **Deployment:** live on a cloud server with a domain and SSL
- **Source code ownership:** the full code is handed over to you
- **1 month bug fix support** after launch

### How it works
1. Discovery call and scope document (scope is fixed before work starts).
2. UI/UX design and approval.
3. Development in weekly sprints, with demos every week.
4. Testing, deployment and handover.

### Good to know
- Payment is split into milestones: 40% at start, 30% after design approval, 30% at delivery.
- Extra features beyond the scope are quoted separately.
- Mobile app versions (Android / iOS) are available as a separate quote.
- Server costs (about ৳1,500–5,000/month) are paid by you.

**FAQ:**
- **Q:** How much does MVP development cost in Bangladesh?
  **A:** Our Startup MVP Build is ৳1,50,000 for a web app with up to 5 core features, an admin panel, user authentication and deployment.
- **Q:** Do I own the source code?
  **A:** Yes. The full source code is handed over to you at delivery.
- **Q:** How is payment structured?
  **A:** In three milestones: 40% at the start, 30% after design approval and 30% at delivery.
- **Q:** Can you build a mobile app too?
  **A:** Yes. Android and iOS versions are available as a separate quote.

**Requirements:**
1. Feature list or idea description
2. User flow, sketches or reference apps
3. Discovery call availability
4. Branding (logo, colors), if ready

---

# Student packages

All student packages can get an extra **10% off with a valid student ID** (suggested; this needs a coupon in `coupons`).

## 19. CV / Resume Makeover
`NEW` · Student packages · **৳800** · 2 days · Express 1 day +৳300

**SEO:**
- `slug`: cv-writing-service-bangladesh
- `metaTitle`: CV Writing Service in Bangladesh – ATS-friendly CV ৳800
- `metaDescription`: Professional, ATS-friendly CV writing service in Bangladesh for students and fresh graduates, with a cover letter template included. Only ৳800 in 2 days.
- `keywords`: cv writing service bangladesh, cv making price in bd, resume writing dhaka, ats friendly cv bangladesh, fresher cv format bd, cv banano, professional cv for job in bangladesh

**Contents:** ATS-friendly CV, Cover Letter Template, 1 Revision

**Details:**

### A CV that gets you interviews
Most companies, including big Bangladeshi employers and multinationals, filter CVs with software before a human reads them. Our CV writing service in Bangladesh rewrites your CV so it passes these filters and clearly shows your skills, projects and achievements, even if you have little work experience.

### Who this is for
- University students and fresh graduates
- Students applying for internships, part-time jobs or scholarships
- Anyone whose CV hasn't been updated in years

### What's included
- **ATS-friendly CV:** clean format that application software can read
- **Content rewrite:** strong summary, skills, projects, achievements and activities
- **Keyword matching:** tuned to the job or field you're targeting
- **Cover letter template:** an editable letter you can adapt for each application
- **Files in Word and PDF**
- **1 revision round**

### How it works
1. You send your current CV or fill in our details form.
2. We rewrite and design your CV within 2 days.
3. You review, we revise, and you get the final files.

### Good to know
- Want LinkedIn and interview practice too? See **Internship Starter**.

**FAQ:**
- **Q:** How much does CV writing cost in Bangladesh?
  **A:** Our CV / Resume Makeover is ৳800, including an ATS-friendly CV, a cover letter template and 1 revision.
- **Q:** What is an ATS-friendly CV?
  **A:** It's a CV formatted so the screening software many companies use can read it correctly, which gives you a better chance of reaching a recruiter.
- **Q:** I'm a fresher with no experience. Can you still help?
  **A:** Yes. We highlight your projects, skills, activities and achievements, so your CV stays strong without work experience.
- **Q:** Can I edit the CV later?
  **A:** Yes. You get both Word and PDF files.

**Requirements:**
1. Current CV, or your education, skills and activities
2. Target job, internship or field
3. Projects, certificates and achievements

---

## 20. Student Portfolio Website
`NEW` · Student packages · **৳3,500** · 5 days · Express 2 days +৳1,000

**SEO:**
- `slug`: portfolio-website-for-students-bangladesh
- `metaTitle`: Student Portfolio Website in Bangladesh – ৳3,500
- `metaDescription`: Personal portfolio website for students in Bangladesh: projects, skills and a CV download, with free hosting on GitHub Pages / Netlify. ৳3,500 in 5 days.
- `keywords`: portfolio website bangladesh, student portfolio website bd, personal website for cse students, portfolio website price in bd, github pages portfolio, nijer portfolio website banano

**Contents:** 1 Page Portfolio, Projects & Skills Section, Free Hosting (GitHub Pages / Netlify), CV Download Link

**Details:**

### Show your work, not just your CV
A student portfolio website shows recruiters and universities what you can actually do. It's especially powerful for CSE, design, architecture and media students in Bangladesh. Share one link in every application and stand out from hundreds of CVs.

### Who this is for
- CSE / software engineering students
- Design, architecture, photography and media students
- Students applying abroad or for competitive internships

### What's included
- **1 page portfolio website:** about, skills, projects, experience and contact sections
- **Project showcase:** screenshots, descriptions and links to GitHub or live demos
- **CV download button**
- **Responsive design:** looks good on phones and laptops
- **Free hosting:** on GitHub Pages or Netlify, so no yearly hosting bill
- **Contact form:** messages go straight to your email

### How it works
1. You send your projects, photo and CV.
2. We design and build the site within 3–4 days.
3. 1 round of revisions, then we publish it and send you the link.

### Good to know
- A custom domain (yourname.com) can be added for about ৳1,500/year.
- You get the source code, so you can update it yourself later.

**FAQ:**
- **Q:** How much does a student portfolio website cost?
  **A:** It's ৳3,500 for a 1-page portfolio with projects, skills, a CV download and free hosting.
- **Q:** Do I have to pay for hosting every year?
  **A:** No. It's hosted free on GitHub Pages or Netlify. A custom domain is optional, at about ৳1,500 per year.
- **Q:** Can I update the site myself later?
  **A:** Yes. You get the source code, so you can add new projects any time.
- **Q:** I'm not a CSE student. Is this still useful?
  **A:** Yes. It works well for design, architecture, photography and media students too.

**Requirements:**
1. Your projects (links, screenshots, descriptions)
2. A professional photo
3. Updated CV
4. Social / GitHub / Behance links

---

## 21. Career Counseling
`MODIFY 66e1adaf9639ace72c0a2712` (was 50) · **৳1,500** · 7 days · Express 2 days +৳500

**SEO:**
- `slug`: career-counseling-bangladesh
- `metaTitle`: Career Counseling in Bangladesh for Students – ৳1,500
- `metaDescription`: One-on-one career counseling in Bangladesh: 2 online sessions, CV review and a personal 6–12 month career roadmap. Only ৳1,500. Plan your future with clarity.
- `keywords`: career counseling bangladesh, career guidance for students bd, career counselor dhaka, job naki higher study, career planning after graduation, career advice bangla

**Contents:** 2 One-on-One Sessions (45 min), CV Review, Career Roadmap

**Details:**

### Not sure what to do after graduation? Let's plan it together
Choosing between a job, higher studies, BCS, freelancing or starting a business is confusing. Our career counseling for students in Bangladesh helps you, in two personal sessions, understand your strengths, look at real options in the Bangladeshi and global job market, and leave with a clear written plan.

### Who this is for
- University students choosing a career direction
- Fresh graduates confused about next steps
- HSC students choosing a subject or university

### What's included
- **2 one-on-one sessions (45 minutes each):** online, via Google Meet or Zoom
- **Strengths & interests review:** a simple self-assessment before the first session
- **Career options explained:** salaries, required skills and growth in each path
- **CV review:** written feedback on your current CV
- **Personal career roadmap:** a written 6–12 month plan with skills, courses and steps

### How it works
1. Book your sessions and fill in a short pre-session form.
2. Session 1: explore your goals, strengths and options.
3. We prepare your roadmap and CV feedback.
4. Session 2: walk through the roadmap and answer your questions.

### Good to know
- Sessions can be in Bangla or English.
- Parents are welcome to join the second session.

**FAQ:**
- **Q:** How much does career counseling cost?
  **A:** It's ৳1,500 for 2 one-on-one sessions, a CV review and a written career roadmap.
- **Q:** Are the sessions online?
  **A:** Yes. Sessions run on Google Meet or Zoom, in Bangla or English.
- **Q:** Can my parents join?
  **A:** Yes. Parents are welcome to join the second session.
- **Q:** I'm an HSC student. Is this for me?
  **A:** Yes. We also help HSC students choose a subject and university.

**Requirements:**
1. Career goals or interests (even if unclear)
2. Current education level and subject
3. Current CV (if you have one)

---

## 22. Internship Starter
`MODIFY 66e1adaf9639ace72c0a2713` (was 150) · **৳2,500** · 7 days · Express 3 days +৳800

**SEO:**
- `slug`: internship-preparation-bangladesh
- `metaTitle`: Internship Preparation Package in Bangladesh – ৳2,500
- `metaDescription`: Get internship-ready in Bangladesh: CV makeover, LinkedIn optimization, a mock interview and a list of 30 BD companies hiring interns. Only ৳2,500.
- `keywords`: internship in bangladesh, internship preparation bd, internship for university students dhaka, mock interview bangladesh, companies offering internship in bd, internship kivabe pabo

**Contents:** CV Makeover, LinkedIn Optimization, 1 Mock Interview, List of 30 BD Companies Hiring Interns

**Details:**

### Get ready for your first internship
Getting an internship in Bangladesh is often harder than getting a job, because everyone is competing with little experience. This package prepares everything an employer will check (CV, LinkedIn and your interview) and tells you exactly where to apply.

### Who this is for
- 3rd and 4th year university students
- Students who need an internship to complete their degree
- Fresh graduates looking for their first opportunity

### What's included
- **CV makeover:** an ATS-friendly CV focused on projects, skills and activities
- **LinkedIn optimization:** headline, about section, skills and a profile checklist
- **1 mock interview (30–40 minutes):** common HR and technical questions, with feedback
- **Company list:** 30 Bangladeshi companies in your field that hire interns, with application links
- **Application email template:** how to email HR professionally

### How it works
1. You share your CV, LinkedIn and target field.
2. We deliver your new CV and LinkedIn improvements.
3. Mock interview session with personal feedback.
4. You receive the company list and templates.

### Good to know
- We prepare you and point you to the right places. Internship offers aren't guaranteed.
- Extra mock interviews: ৳500 each.

**FAQ:**
- **Q:** How can I get an internship in Bangladesh?
  **A:** You need a strong CV, a good LinkedIn profile, interview practice and the right companies to apply to. This package covers all four for ৳2,500.
- **Q:** Do you guarantee an internship?
  **A:** No. We prepare you and point you to companies that hire interns, but the offer depends on the employer.
- **Q:** Can I do more than one mock interview?
  **A:** Yes. Extra mock interviews are ৳500 each.
- **Q:** Which companies are on the list?
  **A:** 30 Bangladeshi companies in your field that hire interns, with application links.

**Requirements:**
1. Target industry or role
2. Current CV
3. LinkedIn profile link (or we help you create one)

---

## 23. Basic Coding Course
`MODIFY 66e1adaf9639ace72c0a2711` (was 100) · **৳4,500** · 56 days · No express

**SEO:**
- `slug`: web-development-course-bangladesh
- `metaTitle`: Web Development Course in Bangladesh for Beginners – ৳4,500
- `metaDescription`: 8-week live online web development course in Bangla: HTML, CSS, JavaScript and Git, with 3 projects and a certificate. Only ৳4,500. No experience needed.
- `keywords`: web development course bangladesh, coding course for beginners bd, html css javascript course bangla, online programming course dhaka, web design course price in bd, coding shikhte chai

**Contents:** 8 Weeks Live Online Classes, HTML / CSS / JavaScript, 3 Projects, Certificate

**Details:**

### Start your coding journey with real projects
Learn how websites are built, from zero. This beginner web development course in Bangladesh runs for 8 weeks of live online classes. You'll learn HTML, CSS and JavaScript step by step, build three real projects for your portfolio, and earn a certificate. No previous experience needed.

### Who this is for
- Complete beginners interested in programming
- Non-CSE students who want to switch to tech
- School and college students curious about coding
- Anyone who wants to start freelancing in web development

### Course outline
- **Week 1–2: HTML.** Page structure, text, images, links, forms and tables.
- **Week 3–4: CSS.** Colors, layouts, Flexbox, Grid and responsive design.
- **Week 5–6: JavaScript.** Variables, functions, events and DOM manipulation.
- **Week 7: Git & GitHub.** Saving and sharing your code, and hosting your site.
- **Week 8: Final project** and next steps (React, freelancing, jobs).

### What's included
- **16 live classes** (2 per week, 1.5 hours each) via Zoom / Google Meet
- **Class recordings:** watch again anytime
- **3 projects:** personal profile page, responsive landing page and an interactive JavaScript app
- **Weekly assignments** with feedback
- **Support group:** ask questions between classes
- **Certificate of completion**

### Good to know
- Classes are in Bangla. Coding terms are in English.
- You need a laptop or desktop (a phone isn't enough) and a stable internet connection.
- New batches start every month. You can join the next available batch after purchase.

**FAQ:**
- **Q:** How much does the coding course cost?
  **A:** The Basic Coding Course is ৳4,500 for 8 weeks of live classes, recordings, 3 projects and a certificate.
- **Q:** Is the course in Bangla?
  **A:** Yes. Classes are in Bangla, while coding terms are in English.
- **Q:** Do I need any coding experience?
  **A:** No. The course starts from zero and is made for complete beginners.
- **Q:** When does the next batch start?
  **A:** New batches start every month, and you can join the next available batch after purchase.

**Requirements:**
1. Laptop or desktop computer
2. Stable internet connection
3. Interest in coding, no experience needed

---

## 24. Final Year Project Mentoring
`NEW` · Student packages · **৳6,000** · 30 days · No express

**SEO:**
- `slug`: final-year-project-mentoring-bangladesh
- `metaTitle`: Final Year Project Mentoring in Bangladesh – ৳6,000
- `metaDescription`: Expert final year project mentoring for CSE / EEE students in Bangladesh: idea review, code review and defense prep across 4 sessions. ৳6,000. You build it.
- `keywords`: final year project help bangladesh, fyp mentoring cse bd, thesis project guidance dhaka, cse project ideas bangladesh, final year project defense preparation, project supervisor help bd

**Contents:** 4 Mentoring Sessions, Idea & Scope Review, Code Review, Presentation Prep

**Details:**

### Build a final year project you're proud of
Your final year project (FYP / thesis project) is often the most important thing on your CV as a fresh graduate. Our final year project mentoring for students in Bangladesh pairs you with experienced developers who guide you through it: choosing the right idea, planning the scope, reviewing your code, and preparing your defense. You build it, we guide you.

### Who this is for
- CSE / EEE / software engineering students in their final year
- Students stuck on their project idea or technical problems
- Teams who want expert feedback before submission

### What's included
- **4 one-on-one mentoring sessions (1 hour each):** online, for you or your team
- **Idea & scope review:** pick a project that's realistic and impressive
- **Tech stack advice:** the right tools for your project
- **Code review:** feedback on structure, best practices and bugs
- **Documentation guidance:** how to structure your report
- **Presentation & defense prep:** slides feedback and likely questions from the board

### How it works
1. Session 1: idea, scope and plan.
2. Session 2–3: progress reviews and code review (spread across the month).
3. Session 4: final review and presentation practice.

### Good to know
- **This is mentoring, not a done-for-you service.** We don't write your project or report for you. Your work stays your own, as your university requires.
- Extra sessions: ৳1,500 each.

**FAQ:**
- **Q:** Will you build my final year project for me?
  **A:** No. This is mentoring: we guide, review and prepare you, and you build the project yourself, as your university requires.
- **Q:** How much does project mentoring cost?
  **A:** It's ৳6,000 for 4 one-hour sessions, including idea review, code review and defense prep. Extra sessions are ৳1,500 each.
- **Q:** Can my whole team join?
  **A:** Yes. Sessions can be for you alone or for your project team.
- **Q:** Do you help with defense preparation?
  **A:** Yes. The last session covers slide feedback and the questions the board is likely to ask.

**Requirements:**
1. Project topic (or areas you're interested in)
2. University guidelines and submission deadline
3. Code repository access (for code review)

---

## 25. Study Abroad Guidance
`MODIFY 66e1adaf9639ace72c0a2714` (was 200) · **৳8,000** · 21 days · Express 10 days +৳2,500

**SEO:**
- `slug`: study-abroad-consultancy-bangladesh
- `metaTitle`: Study Abroad Consultancy in Bangladesh – ৳8,000
- `metaDescription`: Study abroad guidance from Bangladesh: 5 university shortlist, SOP editing, scholarship list and visa document checklist for ৳8,000. Apply with a clear plan.
- `keywords`: study abroad consultancy bangladesh, study abroad from bangladesh, sop writing help bd, scholarship for bangladeshi students, student visa guidance dhaka, bidesh e porashona, higher study abroad consultant bd

**Contents:** 5 University Shortlist, SOP Review & Editing, Scholarship Guidance, Visa Document Checklist

**Details:**

### Apply abroad with a clear plan
Studying abroad from Bangladesh involves many steps: choosing a country, finding the right universities, writing a strong SOP, finding scholarships and preparing visa documents. One mistake can cost a whole intake. We guide you through each step so your application is complete, strong and on time.

### Who this is for
- Students planning a Bachelor's or Master's abroad
- Applicants to the USA, UK, Canada, Australia, Germany, Malaysia and more
- Students looking for scholarships and funded programs

### What's included
- **Profile assessment:** your grades, test scores and budget reviewed honestly
- **5 university shortlist:** matched to your profile and budget, with deadlines and requirements
- **SOP review & editing:** structure, story and language polished (up to 2 rounds)
- **CV for applications:** an academic-format CV
- **Scholarship guidance:** a list of scholarships you're eligible for, and how to apply
- **Application timeline:** a step-by-step calendar with all deadlines
- **Visa document checklist:** country-specific documents, bank statements and interview tips

### How it works
1. Consultation call: goals, country, budget and timeline.
2. University shortlist and application plan within 1 week.
3. SOP and CV editing.
4. Scholarship list, visa checklist and a final Q&A session.

### Good to know
- **We don't guarantee admission or visa approval.** Those decisions are made by universities and embassies.
- Application fees, test fees and embassy fees are paid by you.
- We don't write your SOP from scratch. We edit and improve your own story.

**FAQ:**
- **Q:** How much does study abroad consultancy cost?
  **A:** Our Study Abroad Guidance is ৳8,000, including a 5-university shortlist, SOP editing, scholarship guidance and a visa document checklist.
- **Q:** Do you guarantee admission or a visa?
  **A:** No. Universities and embassies make those decisions, but we make sure your application is complete and strong.
- **Q:** Will you write my SOP?
  **A:** We don't write it from scratch. We edit and improve your own SOP for structure, story and language, in up to 2 rounds.
- **Q:** Which countries do you cover?
  **A:** The USA, UK, Canada, Australia, Germany, Malaysia and more.

**Requirements:**
1. Preferred country and subject
2. Academic transcripts and certificates
3. IELTS / TOEFL / GRE scores (or test plan)
4. Budget for tuition and living costs

---

# DELETE

## 26. Test package goes here
`DELETE 68e955ade45fc5a4b36ab0d2`. This is a test doc with placeholder ChatGPT text and an external cover image.

---

# Open questions

1. **No-express packages:** they're stored as `"0"` / `"0"`. Does your frontend hide express when it's 0, or show "0 days / ৳0"?
2. **Social media reframe:** follower / view selling is replaced with content and management services. Is that OK?
3. **Old orders:** existing `soldpackage` / `payments` records keep their old prices.
4. Do you want a student-ID coupon created?
