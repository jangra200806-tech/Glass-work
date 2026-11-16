/**
 * Google / Bing verification token inject karta hai (Search Console ke liye).
 *
 * Usage:  node tools/gsc-verify.cjs <TOKEN>
 * Example: node tools/gsc-verify.cjs abc123XYZ
 *
 * Har page par <meta name="google-site-verification" content="TOKEN"> lag jaata hai.
 * Token hataane ke liye: node tools/gsc-verify.cjs --remove
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

const args = process.argv.slice(2);
const remove = args[0] === "--remove";
const token = remove ? "" : String(args[0] || "").trim();

if (!remove && !token) {
  console.log("Usage: node tools/gsc-verify.cjs <TOKEN>   |   node tools/gsc-verify.cjs --remove");
  process.exit(1);
}

const META_RE = /\s*<meta name="google-site-verification" content="[^"]*">/g;

let changed = 0;
files.forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  html = html.replace(META_RE, "");

  if (!remove) {
    const meta = `  <meta name="google-site-verification" content="${token}">\n`;
    /* canonical ke baad insert karo */
    html = html.replace(/(<link rel="canonical"[^>]*>\n)/, `$1${meta}`);
    if (!html.includes("google-site-verification")) {
      html = html.replace(/<meta charset="UTF-8">\n/, `<meta charset="UTF-8">\n${meta}`);
    }
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    changed += 1;
  }
});

console.log(remove ? "verification meta removed" : `verification token added to ${changed} page(s)`);
