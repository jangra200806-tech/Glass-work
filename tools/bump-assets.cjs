/**
 * Cache-bust pass: css/js files 1 saal ke liye "immutable" cache hote hain,
 * isliye file badalne par URL query version badalna zaroori hai.
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const VERSION = "20261116trust";
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

let touched = 0;
files.forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;
  html = html
    .replace(/css\/style\.css\?v=[^"']+/g, `css/style.css?v=${VERSION}`)
    .replace(/css\/pages\.css\?v=[^"']+/g, `css/pages.css?v=${VERSION}`)
    .replace(/css\/assistant\.css\?v=[^"']+/g, `css/assistant.css?v=${VERSION}`)
    .replace(/js\/script\.js\?v=[^"']+/g, `js/script.js?v=${VERSION}`)
    .replace(/js\/assistant\.js\?v=[^"']+/g, `js/assistant.js?v=${VERSION}`)
    .replace(/js\/assistant-knowledge\.js\?v=[^"']+/g, `js/assistant-knowledge.js?v=${VERSION}`)
    .replace(/data\/info\.js\?v=[^"']+/g, `data/info.js?v=${VERSION}`);
  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    touched += 1;
  }
});

console.log(`cache-bust version -> ${VERSION} (${touched} file(s) updated)`);
