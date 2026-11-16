/**
 * og:image compress: 406KB PNG -> 42KB JPG (same 1200x630 size).
 * Saare pages + schema me reference update karta hai aur purana PNG hatata hai.
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

let touched = 0;
files.forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  if (!html.includes("og-logo.png")) return;
  html = html.split("og-logo.png").join("og-logo.jpg");
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`updated ${file}`);
  touched += 1;
});

const png = path.join(PUBLIC, "images", "og-logo.png");
if (fs.existsSync(png)) {
  fs.unlinkSync(png);
  console.log("removed public/images/og-logo.png (406KB -> 42KB jpg)");
}

console.log(`\n${touched} page(s) updated.`);
