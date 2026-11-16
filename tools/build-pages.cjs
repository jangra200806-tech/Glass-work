/**
 * MAA MANSA DEVI GLASS WORKS — static page generator
 *
 * Naye pages (pricing, service areas, 404, privacy) existing pages ke EXACT
 * same header / footer / scripts use karte hain — isiliye ek hi jagah se
 * sab generate hote hain aur design kabhi diverge nahi hota.
 *
 * Run:  node tools/build-pages.cjs
 * Output: public/pricing.html, public/service-areas.html,
 *         public/404.html, public/privacy-policy.html
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://maa-mansa-devi-glass-works.vercel.app";
const VERSION = "20261116trust";

/* ---------- Shared blocks extracted from the existing pages ---------- */

const MAPS_DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony, Kaithal, Haryana 136027"
)}`;

const productsHtml = fs.readFileSync(path.join(PUBLIC, "products.html"), "utf8");
const indexHtml = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");

function sliceBetween(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`marker not found: ${startMarker}`);
  const end = src.indexOf(endMarker, start);
  if (end === -1) throw new Error(`end marker not found: ${endMarker}`);
  return src.slice(start, end + endMarker.length);
}

const headerCss = sliceBetween(productsHtml, '<style id="gw-header-css">', "</style>");
const headerBlock = sliceBetween(productsHtml, "<!-- ================= CLEAN HEADER v6 ================= -->", "</header>");
const mobileMenuBlock = sliceBetween(productsHtml, '<nav class="gw-menu" id="gw-menu"', "</nav>");
const footerBlock = sliceBetween(productsHtml, "<!-- ================= PREMIUM FOOTER ================= -->", "</footer>");
const headerJs = sliceBetween(productsHtml, '<script id="gw-header-js">', "</script>");
const tailBlock = (() => {
  const start = indexHtml.indexOf("<!-- ================= BACK TO TOP ================= -->");
  const end = indexHtml.indexOf('<script src="data/info.js', start);
  if (start === -1 || end === -1) throw new Error("tail block markers not found");
  return indexHtml.slice(start, end);
})();

/* Footer ko har page par ek jaisa rakhte hain — Quick Links me naye pages add kar dete hain.
   (Idempotent — source page pe links pehle se ho to double add nahi hota) */
let footerWithLinks = footerBlock;
if (!footerWithLinks.includes('href="pricing.html"')) {
  footerWithLinks = footerWithLinks.replace(
    `          <li><a href="contact.html">Contact</a></li>`,
    `          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="service-areas.html">Service Areas</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="privacy-policy.html">Privacy Policy</a></li>`
  );
}
if (!footerWithLinks.includes("Shop Location on Google Maps")) {
  footerWithLinks = footerWithLinks.replace(
    `        <a href="https://wa.me/918607774600" class="footer-link footer-wa" id="footer-whatsapp" data-wa-link target="_blank" rel="noopener">WhatsApp</a>`,
    `        <a href="${MAPS_DIRECTIONS}" class="footer-link" target="_blank" rel="noopener">Shop Location on Google Maps</a>
        <a href="https://wa.me/918607774600" class="footer-link footer-wa" id="footer-whatsapp" data-wa-link target="_blank" rel="noopener">WhatsApp</a>`
  );
}

function setActive(block, page) {
  /* Pehle purane active markers hatao (source page ka active link remove) */
  let out = block
    .replace(/ class="gw-nav-link active" aria-current="page"/g, ' class="gw-nav-link"')
    .replace(/ class="gw-nav-link active"/g, ' class="gw-nav-link"')
    .replace(/ aria-current="page"/g, "");

  if (!page) return out;

  out = out.replace(
    new RegExp(`(<a href="${page}" class="gw-nav-link)(">)`, "g"),
    '$1 active" aria-current="page">'
  );
  return out;
}

function buildPage(opts) {
  const {
    slug,
    title,
    desc,
    bannerTitle,
    bannerDesc,
    body,
    schema = [],
    navActive,
    noindex = false,
    canonical = `${SITE}/${slug}`
  } = opts;

  const ogImage = `${SITE}/images/og-logo.png`;
  const robots = noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const schemaBlocks = schema
    .map((s) => `  <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n  </script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="theme-color" content="#102D4F">
  <meta name="robots" content="${robots}">
  <meta name="geo.region" content="IN-HR">
  <meta name="geo.placename" content="Kaithal, Haryana">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="MAA MANSA DEVI GLASS WORKS — glass, aluminium, UPVC and ACP work in Kaithal">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="MAA MANSA DEVI GLASS WORKS">
  <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="favicon-192.png">
  <link rel="apple-touch-icon" href="favicon-192.png">
  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/playfair-display-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/style.css?v=${VERSION}">
  <link rel="stylesheet" href="css/pages.css?v=${VERSION}">
  <link rel="stylesheet" href="css/assistant.css?v=20261116a11y2">
  <!-- header-v6 -->
${headerCss}
${schemaBlocks}
</head>
<body>

  <!-- Skip to content -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

${setActive(headerBlock, navActive)}

${setActive(mobileMenuBlock, navActive)}

  <main id="main-content">

    <!-- Page Banner -->
    <section class="section bg-navy page-banner">
      <div class="container">
        <h1 class="section-title">${bannerTitle}</h1>
        <p class="section-desc">${bannerDesc}</p>
      </div>
    </section>

${body}

  </main>

${footerWithLinks}

${tailBlock}
  <script src="data/info.js?v=20261112v" defer></script>
  <script src="js/script.js?v=${VERSION}" defer></script>
  <script src="js/assistant-knowledge.js?v=20261112v" defer></script>
  <script src="js/assistant.js?v=20261116a11y" defer></script>

${headerJs}
</body>
</html>
`;
}

/* ---------- Page definitions ---------- */

/* ---------------- 1. PRICING ---------------- */

const pricingRows = [
  ["Toughened Glass (8 mm)", "₹95 – ₹140", "sq.ft."],
  ["Toughened Glass (10 mm)", "₹125 – ₹175", "sq.ft."],
  ["Toughened Glass (12 mm)", "₹160 – ₹220", "sq.ft."],
  ["Laminated Glass (6 / 8 / 10 mm)", "₹180 – ₹320", "sq.ft."],
  ["Frosted / Etched / Designer Glass", "₹160 – ₹280", "sq.ft."],
  ["Patterned, Wired & Reflective Glass", "₹120 – ₹200", "sq.ft."],
  ["Framed Glass Partition", "₹180 – ₹300", "sq.ft."],
  ["Frameless Glass Partition", "₹280 – ₹450", "sq.ft."],
  ["ACP Cladding (2 / 3 / 4 mm)", "₹165 – ₹260", "sq.ft."],
  ["UPVC Windows & Doors", "₹320 – ₹520", "sq.ft."],
  ["Aluminium Windows & Doors", "₹230 – ₹380", "sq.ft."],
  ["Steel Grills & Railings", "₹120 – ₹200", "sq.ft."],
  ["Main Gates (Steel)", "₹250 – ₹450", "sq.ft."],
  ["Glass Mirror Fitting", "₹60 – ₹120", "sq.ft."],
  ["Shower Cubicle (Complete)", "₹9,000 – ₹18,000", "set"]
];

const pricingTable = pricingRows
  .map(
    ([item, range, unit]) => `            <tr>
              <td>${item}</td>
              <td class="rate-range">${range}</td>
              <td class="rate-unit">per ${unit}</td>
            </tr>`
  )
  .join("\n");

const pricingFaqs = [
  {
    q: "Glass ka final price kaise pata chalega?",
    a: "Ye rate list indicative hai. Final price site par measurement, glass thickness, brand, finish aur hardware ke option par depend karta hai. Free measurement ke liye humse contact karein."
  },
  {
    q: "Kya site visit aur measurement free hai?",
    a: "Haan, Kaithal aur aas-pas ke ilaakon me site visit aur measurement free hai. Final quotation measurement ke baad hi confirm hota hai."
  },
  {
    q: "Installation charges alag hote hain?",
    a: "Installation charges project ke hisaab se alag hote hain. Quotation me fitting, silicon, hardware aur site work — sab detail me bataya jata hai, koi hidden charge nahi."
  },
  {
    q: "Payment ka process kya hai?",
    a: "Advance payment aur baaki kaam poora hone par. Payment mode UPI, Cash ya Bank Transfer se ho sakta hai."
  }
];

const pricingBody = `
    <!-- ================= RATE LIST ================= -->
    <section id="rates" class="section bg-white">
      <div class="container">
        <div class="about-grid">
          <div class="about-text reveal">
            <span class="section-label">Indicative Rate List</span>
            <h2 class="section-title">Glass &amp; Fabrication <span class="accent">Rates</span></h2>
            <p class="section-desc">Neeche diye gaye rates market ke aadhar par hain aur sirf idea dene ke liye hain. Final quotation site measurement ke baad milta hai — measurement, site visit aur quotation bilkul FREE hai.</p>
          </div>
          <div class="about-image reveal">
            <div class="img-wrap">
              <img src="images/projects/designer-etched-glass-pattern.jpg" alt="Toughened and designer glass work by MAA MANSA DEVI GLASS WORKS in Kaithal" class="about-img" width="500" height="500" loading="lazy">
            </div>
          </div>
        </div>

        <div class="rate-table-wrap reveal">
          <table class="rate-table">
            <caption class="rate-caption">MAA MANSA DEVI GLASS WORKS — approximate rates, Kaithal (Haryana)</caption>
            <thead>
              <tr>
                <th scope="col">Work / Material</th>
                <th scope="col">Approx. Rate</th>
                <th scope="col">Unit</th>
              </tr>
            </thead>
            <tbody>
${pricingTable}
            </tbody>
          </table>
          <p class="rate-note"><strong>Note:</strong> Ye indicative rates hain. Final price glass brand, thickness, finish, hardware (hinges, locks, channels), area aur site condition par depend karta hai. Bade order par best rate available hota hai. Call karein: <a href="tel:+918607774600">+91 86077 74600</a>.</p>
        </div>
      </div>
    </section>

    <!-- ================= RATE FAQ ================= -->
    <section id="rate-faq" class="section bg-light">
      <div class="container">
        <span class="section-label">Questions</span>
        <h2 class="section-title">Rate List se Related <span class="accent">Sawaal</span></h2>
        <div class="faq-grid">
${pricingFaqs
  .map(
    (f, i) => `          <div class="faq-card reveal">
            <h3 class="faq-question">${f.q}</h3>
            <p class="faq-answer">${f.a}</p>
          </div>`
  )
  .join("\n")}
        </div>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section class="section bg-navy">
      <div class="container">
        <div class="cta-banner reveal">
          <h2>Apne kaam ka exact quote lein</h2>
          <p>Naam, phone aur kaam ki detail bhejein — hum free measurement ke liye apne time par call karenge.</p>
          <div class="cta-actions">
            <a href="contact.html#quote" class="btn-primary">Get a Free Quote</a>
            <a href="https://wa.me/918607774600" class="btn-secondary" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
`;

const pricingSchema = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE}/pricing` }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Glass and fabrication rate list",
    url: `${SITE}/pricing`,
    itemListElement: pricingRows.map(([name], i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: { "@type": "Service", name, provider: { "@type": "LocalBusiness", name: "MAA MANSA DEVI GLASS WORKS" } }
    }))
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pricingFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  }
];

/* ---------------- 2. SERVICE AREAS ---------------- */

const areas = [
  {
    name: "Kaithal",
    distance: "0 km — humari shop",
    note: "Karnal Road par shop. Ghar, dukan, office aur factory ke liye glass, aluminium, steel, UPVC aur ACP ka poora kaam yahin hota hai.",
    strong: true
  },
  {
    name: "Karnal",
    distance: "≈ 40 km",
    note: "Karnal Road par project ka kaam regularly hota hai — shopfront, partition, ACP cladding aur railing."
  },
  {
    name: "Kurukshetra",
    distance: "≈ 55 km",
    note: "Residential aur commercial glass work ke liye Kurukshetra jaate hain. Travelling charge project ke hisaab se lagta hai."
  },
  {
    name: "Yamunanagar",
    distance: "≈ 80 km",
    note: "Yamunanagar me bade order (factory, society, shop) ka kaam hota hai. Pehle WhatsApp par confirm karein."
  },
  {
    name: "Narwana",
    distance: "≈ 25 km",
    note: "Narwana ke ghar aur dukan ke liye aluminium window, UPVC door aur kitchen glass ka kaam."
  },
  {
    name: "Assand",
    distance: "≈ 20 km",
    note: "Assand ilaqe me glass fitting, mirror, partition aur steel grill ka kaam hota hai."
  },
  {
    name: "Pipli & Khanaur",
    distance: "≈ 20–25 km",
    note: "Pipli, Khanaur aur aas-pas ke gaon ke liye residential glass work — gate, grill, mirror aur kitchen cabinet."
  },
  {
    name: "Kalayat",
    distance: "≈ 25 km",
    note: "Kalayat ke ghar aur dhande ke liye custom fabrication aur aluminium work."
  }
];

const areasBody = `
    <!-- ================= AREA INTRO ================= -->
    <section id="areas" class="section bg-white">
      <div class="container">
        <div class="about-grid">
          <div class="about-text reveal">
            <span class="section-label">Service Areas</span>
            <h2 class="section-title">Glass Work in <span class="accent">Kaithal &amp; Nearby Towns</span></h2>
            <p class="section-desc">Humari shop Karnal Road, Kaithal me hai aur hum regularly aas-pas ke ilaqon me kaam karte hain. Neeche diye gaye shehar me hum glass, aluminium, steel, UPVC aur ACP ka kaam karte hain. Bade order ya door ke shehar ke liye pehle WhatsApp par availability confirm kar lein.</p>
            <div class="cta-actions">
              <a href="contact.html#quote" class="btn-primary">Get a Free Quote</a>
              <a href="${MAPS_DIRECTIONS}" class="btn-outline" target="_blank" rel="noopener">Shop Location</a>
            </div>
          </div>
          <div class="about-image reveal">
            <div class="img-wrap">
              <img src="images/projects/shop-signboard.jpg" alt="MAA MANSA DEVI GLASS WORKS shop front on Karnal Road, Kaithal" class="about-img" width="500" height="500" loading="lazy">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= AREA LIST ================= -->
    <section id="area-list" class="section bg-light">
      <div class="container">
        <span class="section-label">Where We Work</span>
        <h2 class="section-title">Nearby Cities &amp; <span class="accent">Villages We Serve</span></h2>
        <div class="areas-grid">
${areas
  .map(
    (a) => `          <div class="area-card reveal${a.strong ? " area-card--main" : ""}">
            <h3 class="area-name">${a.name}</h3>
            <span class="area-distance">${a.distance}</span>
            <p class="area-note">${a.note}</p>
          </div>`
  )
  .join("\n")}
        </div>
        <p class="rate-note reveal"><strong>Travel charge:</strong> Kaithal ke bahar ke kaam me travelling + loading charge alag lagta hai, jo quotation me pehle hi bata diya jata hai. Free measurement aur site visit kaam ke hisaab se hai.</p>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section class="section bg-navy">
      <div class="container">
        <div class="cta-banner reveal">
          <h2>Apne shehar me glass work karwana hai?</h2>
          <p>Measurement, material suggestion aur final quotation — sab free. Bas apni detail bhejein.</p>
          <div class="cta-actions">
            <a href="contact.html#quote" class="btn-primary">Get a Free Quote</a>
            <a href="https://wa.me/918607774600" class="btn-secondary" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
`;

const areasSchema = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE}/service-areas` }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Glass and aluminium fabrication",
    serviceType: "Glass work, aluminium fabrication, steel fabrication, UPVC doors and windows, ACP cladding",
    provider: {
      "@type": "LocalBusiness",
      name: "MAA MANSA DEVI GLASS WORKS",
      telephone: ["+918607774600", "+917082014381"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony",
        addressLocality: "Kaithal",
        addressRegion: "Haryana",
        postalCode: "136027",
        addressCountry: "IN"
      }
    },
    areaServed: areas.map((a) => ({ "@type": "City", name: a.name })),
    url: `${SITE}/service-areas`
  }
];

/* ---------------- 3. PRIVACY POLICY ---------------- */

const privacyBody = `
    <!-- ================= PRIVACY ================= -->
    <section class="section bg-white">
      <div class="container">
        <div class="about-text reveal" style="max-width:820px;margin:0 auto;">
          <span class="section-label">Legal</span>
          <h2 class="section-title">Privacy <span class="accent">Policy</span></h2>
          <p class="section-desc">Last updated: November 2026</p>

          <div class="feature-list legal-block">
            <h3 class="section-title" style="font-size:1.3rem;">Aapki jo information hum lete hain</h3>
            <p>Jab aap website ka contact form bharte hain, hum sirf ye information lete hain: aapka naam, phone number, kaam ki detail (product / service) aur message. Form submit karte hi aapka enquiry humari email par bhi aata hai aur WhatsApp par bhi khulta hai.</p>

            <h3 class="section-title" style="font-size:1.3rem;">Information ka use</h3>
            <p>Ye information sirf aapke enquiry ka reply karne, measurement/site visit fix karne aur quotation bhejne ke liye use hoti hai. Hum aapka data bechte ya share nahi karte.</p>

            <h3 class="section-title" style="font-size:1.3rem;">Email aur WhatsApp</h3>
            <p>Enquiry email Brevo (email service) ke through jaati hai. WhatsApp message aapke khud ke WhatsApp app ke through jaata hai — ismein sirf aapne jo likha wahi jaata hai. Form me WhatsApp par "Send" dabane ke baad message manually bheja jata hai.</p>

            <h3 class="section-title" style="font-size:1.3rem;">Data ki safety aur retention</h3>
            <p>Aapka enquiry record humare business records me hota hai taaki aage reference ke liye available rahe. Aap chahein to kisi bhi waqt email ya WhatsApp par request kar ke apni purani enquiry delete karwa sakte hain.</p>

            <h3 class="section-title" style="font-size:1.3rem;">Cookies aur analytics</h3>
            <p>Abhi hum website par tracking cookies nahi lagate. Agar future me Google Analytics ya call-tracking add hota hai to uski jaankari yahan update kar di jayegi.</p>

            <h3 class="section-title" style="font-size:1.3rem;">Contact</h3>
            <p>Kisi bhi sawaal ya deletion request ke liye humse sampark karein: <a href="tel:+918607774600">+91 86077 74600</a> ya <a href="mailto:nainajangra009@gmail.com">nainajangra009@gmail.com</a>, ya WhatsApp: <a href="https://wa.me/918607774600" target="_blank" rel="noopener">+91 70820 14381</a>.</p>
          </div>
        </div>
      </div>
    </section>
`;

/* ---------------- 4. 404 ---------------- */

const notFoundBody = `
    <!-- ================= 404 ================= -->
    <section class="section bg-white">
      <div class="container" style="text-align:center;">
        <div class="reveal" style="max-width:640px;margin:0 auto;">
          <span class="section-label">404</span>
          <h2 class="section-title">Ye page nahi mila</h2>
          <p class="section-desc">Jo page aap dhundh rahe hain wo shayad hat gaya hai ya link galat hai. Neeche se apna kaam shuru karein — ya humse seedha baat karein.</p>
          <div class="cta-actions" style="justify-content:center;">
            <a href="index.html" class="btn-primary">Back to Home</a>
            <a href="contact.html" class="btn-secondary">Contact Us</a>
            <a href="https://wa.me/918607774600" class="btn-outline" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
`;

/* ---------- Write files ---------- */

const pages = [
  {
    file: "pricing.html",
    opts: {
      slug: "pricing",
      title: "Glass & UPVC Rates in Kaithal | Price List — MAA MANSA DEVI GLASS WORKS",
      desc: "Toughened glass, laminated glass, ACP cladding, UPVC windows, aluminium and steel fabrication ke indicative rates in Kaithal, Haryana. Free measurement aur site visit.",
      bannerTitle: "Glass &amp; Fabrication Rates in Kaithal",
      bannerDesc: "Indicative rate list — final price site measurement ke baad. Measurement aur quotation free.",
      body: pricingBody,
      schema: pricingSchema,
      navActive: "pricing.html"
    }
  },
  {
    file: "service-areas.html",
    opts: {
      slug: "service-areas",
      title: "Glass Shop in Kaithal &amp; Nearby Cities | Service Areas — MAA MANSA DEVI GLASS WORKS",
      desc: "Kaithal, Karnal, Kurukshetra, Yamunanagar, Narwana, Assand aur aas-pas ke gaon me glass, aluminium, steel, UPVC aur ACP fabrication. Free measurement aur site visit.",
      bannerTitle: "Service Areas — Kaithal &amp; Nearby Towns",
      bannerDesc: "Kaithal me shop, aur Karnal, Kurukshetra, Yamunanagar, Narwana, Assand aas-pas me glass ka kaam.",
      body: areasBody,
      schema: areasSchema,
      navActive: "service-areas.html"
    }
  },
  {
    file: "privacy-policy.html",
    opts: {
      slug: "privacy-policy",
      title: "Privacy Policy — MAA MANSA DEVI GLASS WORKS, Kaithal",
      desc: "MAA MANSA DEVI GLASS WORKS ki privacy policy — contact form se aapki jaankari kaise use hoti hai.",
      bannerTitle: "Privacy Policy",
      bannerDesc: "Aapki jaankari ka use aur hamari policy.",
      body: privacyBody,
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Privacy Policy", item: `${SITE}/privacy-policy` }
          ]
        }
      ],
      navActive: "privacy-policy.html"
    }
  },
  {
    file: "404.html",
    opts: {
      slug: "404",
      title: "Page Not Found — MAA MANSA DEVI GLASS WORKS",
      desc: "Page not found.",
      bannerTitle: "404 — Page Not Found",
      bannerDesc: "Jo page aap dhundh rahe hain wo nahi mila.",
      body: notFoundBody,
      noindex: true,
      navActive: ""
    }
  }
];

pages.forEach(({ file, opts }) => {
  const html = buildPage(opts);
  fs.writeFileSync(path.join(PUBLIC, file), html, "utf8");
  console.log(`generated public/${file} (${html.length} bytes)`);
});

console.log("\nDone. Ab: git add -A && git commit && vercel --prod");
