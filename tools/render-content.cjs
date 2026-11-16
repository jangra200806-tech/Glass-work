/**
 * Static content renderer — products / services / projects / why-us / FAQ ko
 * HTML me likh deta hai (SEO: crawler ko JS render ka wait nahi karna padta).
 *
 * JS sirf filter/enhancement ke liye bachta hai.
 *
 * Run: node tools/render-content.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

/* ---- BUSINESS data (public/data/info.js) ---- */
const infoSrc = fs.readFileSync(path.join(PUBLIC, "data", "info.js"), "utf8");
const BUSINESS = new Function(`${infoSrc}\nreturn BUSINESS;`)();

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escAttr = esc;

/* ---- Markup builders (script.js ke render functions ke exact match) ---- */

function productCard(p) {
  return `        <article class="product-card" data-category="${escAttr(p.category)}">
          <div class="product-img-wrap">
            ${
              p.image
                ? `<img src="${escAttr(p.image)}" alt="${escAttr(p.title)} — ${escAttr(p.category)} work by MAA MANSA DEVI GLASS WORKS in Kaithal" loading="lazy" decoding="async" width="800" height="520" onerror="this.src='images/placeholder.svg'"><span class="product-img-tag">${esc(p.category)}</span>`
                : `<div class="media-gradient" role="img" aria-label="${escAttr(p.title)}"><span class="media-gradient-tag">${esc(p.category)}</span></div>`
            }
          </div>
          <div class="product-info">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
            <ul>
              ${(p.bullets || []).map((b) => `              <li>${esc(b)}</li>`).join("\n")}
            </ul>
            <a href="contact.html?product=${encodeURIComponent(p.title)}" class="btn-primary">Get a Quote</a>
          </div>
        </article>`;
}

function serviceCard(s) {
  return `        <div class="service-card">
          <div class="service-icon" aria-hidden="true">🛠️</div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
          <a href="contact.html?service=${encodeURIComponent(s.title)}" class="btn-outline">Get a Quote</a>
        </div>`;
}

function whyCard(w) {
  return `        <div class="why-card">
          <div class="why-icon" aria-hidden="true">✦</div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc)}</p>
        </div>`;
}

function faqCard(item, i) {
  return `          <div class="faq-card">
            <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-answer-${i}">
              <span class="faq-q">${esc(item.q)}</span>
              <span class="faq-arrow" aria-hidden="true">+</span>
            </button>
            <div class="faq-answer" id="faq-answer-${i}" hidden>
              <p>${esc(item.a)}</p>
            </div>
          </div>`;
}

function projectCard(p) {
  return `        <article class="project-card" data-category="${escAttr(p.category)}">
          <div class="project-img">
            ${
              p.image
                ? `<img src="${escAttr(p.image)}" alt="${escAttr(p.title)} — ${escAttr(p.category)} project by MAA MANSA DEVI GLASS WORKS in Kaithal" loading="lazy" decoding="async" width="400" height="300" class="${p.fit === "contain" ? "project-img-contain" : ""}" onerror="this.src='images/placeholder.svg'">`
                : `<div class="media-gradient" role="img" aria-label="${escAttr(p.title)}"><span class="media-gradient-tag">${esc(p.category)}</span></div>`
            }
          </div>
          <div class="project-overlay">
            <span class="project-category">${esc(p.category)}</span>
            <h3>${esc(p.title)}</h3>
          </div>
        </article>`;
}

/* ---- Injection ---- */

const TARGETS = [
  { file: "products.html", id: "products-grid", items: BUSINESS.products.map(productCard) },
  { file: "services.html", id: "services-grid", items: BUSINESS.services.map(serviceCard) },
  { file: "about.html", id: "why-grid", items: BUSINESS.whyUs.map(whyCard) },
  { file: "contact.html", id: "faq-grid", items: BUSINESS.faqs.map(faqCard) },
  { file: "projects.html", id: "projects-grid", items: BUSINESS.projects.map(projectCard) }
];

let changed = 0;

TARGETS.forEach(({ file, id, items }) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");

  /* Sirf khaali container me likho (idempotent) */
  const emptyRe = new RegExp(`(<div[^>]*id="${id}"[^>]*>)([\\s\\S]*?)(</div>)`);
  const match = html.match(emptyRe);
  if (!match) {
    console.log(`skip ${file} (container "${id}" not found)`);
    return;
  }
  if (match[2].replace(/<!--[\s\S]*?-->/g, "").trim().length > 0) {
    console.log(`skip ${file} (already has static content)`);
    return;
  }

  const body = `\n${items.join("\n")}\n        `;
  html = html.replace(emptyRe, `$1${body}$3`);
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`rendered ${items.length} item(s) into ${file}#${id}`);
  changed += 1;
});

console.log(`\n${changed} grid(s) statically rendered.`);
