/**
 * On-page SEO audit — har page ke liye objective checks.
 * Run: node tools/seo-audit.cjs
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SITE = "https://maa-mansa-devi-glass-works.vercel.app";
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

const get = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : "";
};

const rows = [];

files.forEach((file) => {
  const html = fs.readFileSync(path.join(PUBLIC, file), "utf8");

  const title = get(html, /<title>([\s\S]*?)<\/title>/);
  const desc = get(html, /<meta name="description" content="([^"]*)"/);
  const canonical = get(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = get(html, /<meta name="robots" content="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  const h2Count = (html.match(/<h2[\s>]/g) || []).length;
  const h3Count = (html.match(/<h3[\s>]/g) || []).length;

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const imgsNoAlt = imgs.filter((t) => !/\balt="/.test(t)).length;
  const imgsNoDim = imgs.filter((t) => !/width="/.test(t) || !/height="/.test(t)).length;

  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const schemaTypes = schemas.map((s) => {
    try {
      const parsed = JSON.parse(s[1]);
      return parsed["@type"] || (parsed["@graph"] ? "Graph" : "?");
    } catch (e) {
      return "INVALID_JSON";
    }
  });

  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const internalLinks = [...html.matchAll(/href="(?!https?:|mailto:|tel:|#|\/\/)([^"]+)"/g)].map((m) => m[1]);
  const words = text.split(" ").filter(Boolean).length;

  rows.push({
    file,
    titleLen: title.length,
    descLen: desc.length,
    canonical,
    robots,
    h1: h1s.length ? h1s[0].slice(0, 46) : "NONE",
    h1Count: h1s.length,
    h2Count,
    h3Count,
    imgs: imgs.length,
    imgsNoAlt,
    imgsNoDim,
    schemas: schemaTypes.join(",") || "none",
    words,
    internalLinks: new Set(internalLinks).size
  });
});

console.log("file                  tLen dLen h1 h2 h3 imgs noAlt noDim words links  schema");
console.log("-".repeat(118));
rows.forEach((r) => {
  console.log(
    [
      r.file.padEnd(21),
      String(r.titleLen).padStart(4),
      String(r.descLen).padStart(4),
      String(r.h1Count).padStart(2),
      String(r.h2Count).padStart(2),
      String(r.h3Count).padStart(2),
      String(r.imgs).padStart(4),
      String(r.imgsNoAlt).padStart(5),
      String(r.imgsNoDim).padStart(5),
      String(r.words).padStart(5),
      String(r.internalLinks).padStart(5),
      " " + r.schemas
    ].join(" ")
  );
});

console.log("\n--- titles ---");
rows.forEach((r) => console.log(`${r.file}: ${r.titleLen} chars`));
console.log("\n--- descriptions ---");
rows.forEach((r) => console.log(`${r.file}: ${r.descLen} chars`));
console.log("\n--- H1 ---");
rows.forEach((r) => console.log(`${r.file}: "${r.h1}"`));
console.log("\n--- canonical ---");
rows.forEach((r) => console.log(`${r.file}: ${r.canonical || "MISSING"}`));
