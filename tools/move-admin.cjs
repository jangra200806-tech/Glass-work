/**
 * Admin panel ko public/ se bahar nikalte hain taaki Vercel production par
 * broken login page na dikhe (api/admin/* sirf local Express server par hai).
 * Local:  http://localhost:3000/admin  (root se serve hota hai)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "admin.html");
const DEST_DIR = path.join(ROOT, "admin");
const DEST = path.join(DEST_DIR, "index.html");

fs.mkdirSync(DEST_DIR, { recursive: true });

let html = fs.readFileSync(SRC, "utf8");
html = html
  .replace(/href="favicon\.svg"/g, 'href="/favicon.svg"')
  .replace(/href="favicon-192\.png"/g, 'href="/favicon-192.png"')
  .replace(/href="css\/style\.css\?v=[^"]+"/g, 'href="/css/style.css?v=20261116trust"')
  .replace(/src="images\/logo\.svg"/g, 'src="/images/logo.svg"')
  .replace(/src="js\/admin\.js"/g, 'src="/js/admin.js"');

fs.writeFileSync(DEST, html, "utf8");
fs.unlinkSync(SRC);

console.log("moved public/admin.html -> admin/index.html (production se hata diya)");
