/**
 * Nav pass: top nav me "Pricing" add karta hai aur gap 28px -> 22px
 * (taaki 901px+ screens par nav overflow na ho).
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

let touched = 0;
files.forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  /* Nav me Pricing (desktop + mobile menu dono) */
  html = html.replace(
    /<li><a href="contact\.html" class="gw-nav-link">Contact<\/a><\/li>/g,
    '<li><a href="pricing.html" class="gw-nav-link">Pricing</a></li><li><a href="contact.html" class="gw-nav-link">Contact</a></li>'
  );

  /* Thoda compact gap */
  html = html.replace(
    /\.gw-nav\{display:flex;align-items:center;gap:28px;\}/,
    ".gw-nav{display:flex;align-items:center;gap:22px;}"
  );
  html = html.replace(
    /\.gw-nav-list\{display:flex;align-items:center;gap:28px;/,
    ".gw-nav-list{display:flex;align-items:center;gap:22px;"
  );

  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    touched += 1;
  }
});

console.log(`nav patched on ${touched} page(s)`);
