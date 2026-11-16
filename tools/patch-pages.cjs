/**
 * One-off patcher: har existing page par naye links + pages.css add karta hai.
 * (generator ke saath chalta hai — `node tools/build-pages.cjs` ke baad)
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const VERSION = "20261116trust";

const PAGES = [
  "index.html",
  "about.html",
  "products.html",
  "services.html",
  "projects.html",
  "contact.html"
];

const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony, Kaithal, Haryana 136027"
)}`;

let changed = 0;

PAGES.forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  /* 1) pages.css stylesheet */
  if (!html.includes("css/pages.css")) {
    html = html.replace(
      /(<link rel="stylesheet" href="css\/style\.css\?v=[^"]+">)/,
      `$1\n  <link rel="stylesheet" href="css/pages.css?v=${VERSION}">`
    );
  }

  /* 2) Footer quick links — pricing, service areas, privacy policy */
  if (!html.includes('href="pricing.html"')) {
    html = html.replace(
      /(\s*)<li><a href="contact\.html">Contact<\/a><\/li>/,
      `$1<li><a href="pricing.html">Pricing</a></li>$1<li><a href="service-areas.html">Service Areas</a></li>$1<li><a href="contact.html">Contact</a></li>$1<li><a href="privacy-policy.html">Privacy Policy</a></li>`
    );
  }

  /* 3) Footer me "Shop Location" (Google Maps directions) link */
  if (!html.includes("Shop Location on Google Maps")) {
    html = html.replace(
      /(\s*)<a href="https:\/\/wa\.me\/918607774600" class="footer-link footer-wa" id="footer-whatsapp" data-wa-link target="_blank" rel="noopener">WhatsApp<\/a>/,
      `$1<a href="${DIRECTIONS}" class="footer-link" target="_blank" rel="noopener">Shop Location on Google Maps</a>$1<a href="https://wa.me/918607774600" class="footer-link footer-wa" id="footer-whatsapp" data-wa-link target="_blank" rel="noopener">WhatsApp</a>`
    );
  }

  /* 4) Sitemap-friendly canonical for new pages nahi — baaki sab theek hai */

  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`patched ${file}`);
    changed += 1;
  } else {
    console.log(`no change ${file}`);
  }
});

console.log(`\n${changed} file(s) patched.`);
