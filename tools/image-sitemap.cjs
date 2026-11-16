/**
 * Sitemap me image entries add karta hai (image SEO ke liye).
 * Run: node tools/image-sitemap.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://maa-mansa-devi-glass-works.vercel.app";

const infoSrc = fs.readFileSync(path.join(PUBLIC, "data", "info.js"), "utf8");
const BUSINESS = new Function(`${infoSrc}\nreturn BUSINESS;`)();

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const images = [
  ...BUSINESS.projects.map((p) => ({
    loc: `${SITE}/${p.image}`,
    title: `${p.title} — ${p.category} project by MAA MANSA DEVI GLASS WORKS in Kaithal`
  })),
  { loc: `${SITE}/images/logo-full.svg`, title: "MAA MANSA DEVI GLASS WORKS logo" }
];

const imageTags = images
  .map(
    (img) => `    <image:image>
      <image:loc>${esc(img.loc)}</image:loc>
      <image:title>${esc(img.title)}</image:title>
    </image:image>`
  )
  .join("\n");

const sitemapPath = path.join(PUBLIC, "sitemap.xml");
let xml = fs.readFileSync(sitemapPath, "utf8");

if (!xml.includes("<image:image>")) {
  xml = xml.replace(
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">"
  );

  /* Projects page ke entries ke andar image tags daalo */
  xml = xml.replace(
    /(<loc>https:\/\/maa-mansa-devi-glass-works\.vercel\.app\/projects<\/loc>[\s\S]*?<\/url>)/,
    `$1\n    ${imageTags}`
  );

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`added ${images.length} image entries to sitemap.xml`);
} else {
  console.log("sitemap already has image entries");
}
