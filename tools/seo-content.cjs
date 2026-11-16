/**
 * SEO content pass — products / services / projects pages par keyword-rich
 * static intro text + missing schema (Service list, ImageGallery).
 *
 * Run: node tools/seo-content.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://maa-mansa-devi-glass-works.vercel.app";

const infoSrc = fs.readFileSync(path.join(PUBLIC, "data", "info.js"), "utf8");
const BUSINESS = new Function(`${infoSrc}\nreturn BUSINESS;`)();

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* ---------------- Intro blocks ---------------- */

const INTROS = {
  "products.html": {
    anchor: '        <div class="product-filters reveal">',
    html: `        <div class="about-text reveal" style="max-width:820px;margin:0 auto 2.5rem;text-align:center;">
          <span class="section-label">Our Range</span>
          <h2 class="section-title">Glass, Aluminium, Steel, UPVC aur ACP <span class="accent">— Kaithal me Custom Fabrication</span></h2>
          <p class="section-desc">MAA MANSA DEVI GLASS WORKS Kaithal, Haryana me toughened aur laminated glass, aluminium sections, steel fabrication, UPVC doors &amp; windows aur ACP panels banata hai. Har product ghar, dukan, office, showroom aur factory ke liye custom size me tayyar hota hai. Size, brand, finish aur hardware chunne me humari team madad karti hai, aur site visit par exact quotation milta hai.</p>
        </div>
`,
  },
  "services.html": {
    anchor: '        <div class="services-grid" id="services-grid">',
    html: `        <div class="about-text reveal" style="max-width:820px;margin:0 auto 2.5rem;text-align:center;">
          <span class="section-label">What We Do</span>
          <h2 class="section-title">Glass Partition, Windows &amp; Steel <span class="accent">Services in Kaithal</span></h2>
          <p class="section-desc">Glass partition installation, aluminium aur UPVC windows &amp; doors fitting, steel fabrication, ACP cladding, custom fabrication aur mirror &amp; glass fitting — sab kuch ek hi jagah. Kaithal ke ghar, dukan aur office projects ke liye hum free site visit, measurement aur quotation karte hain, aur installation bhi karte hain.</p>
        </div>
`,
  },
  "projects.html": {
    anchor: '        <div class="projects-grid" id="projects-grid">',
    html: `        <div class="about-text reveal" style="max-width:820px;margin:0 auto 2.5rem;text-align:center;">
          <span class="section-label">Our Work</span>
          <h2 class="section-title">Kaithal ke <span class="accent">Glass aur Steel Projects</span></h2>
          <p class="section-desc">Office partition, frameless partition, shower enclosure, staircase railing, modular kitchen glass, designer etched aur patterned glass, shop display, signboard, steel main gate, railing, ACP facade cladding aur UPVC windows — MAA MANSA DEVI GLASS WORKS ka chuni hua kaam. Photos dekhkar apne design ka idea le sakte hain, ya WhatsApp par apna measurement bhej sakte hain.</p>
        </div>
`,
  }
};

/* ---------------- Extra schema ---------------- */

function servicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Glass and fabrication services in Kaithal",
    itemListElement: BUSINESS.services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.desc,
        serviceType: s.title,
        areaServed: { "@type": "City", name: "Kaithal" },
        provider: { "@type": "LocalBusiness", name: "MAA MANSA DEVI GLASS WORKS", "@id": `${SITE}/#business` },
        url: `${SITE}/services`
      }
    }))
  };
}

function gallerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "MAA MANSA DEVI GLASS WORKS project gallery",
    url: `${SITE}/projects`,
    image: BUSINESS.projects.map((p) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE}/${p.image}`,
      name: `${p.title} — ${p.category} project by MAA MANSA DEVI GLASS WORKS in Kaithal`,
      creditText: "MAA MANSA DEVI GLASS WORKS",
      copyrightNotice: "MAA MANSA DEVI GLASS WORKS",
      thumbnailUrl: `${SITE}/${p.image}`
    }))
  };
}

/* ---------------- Apply ---------------- */
let changed = 0;

Object.entries(INTROS).forEach(([file, cfg]) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  if (!html.includes(cfg.html.trim().slice(0, 60))) {
    if (html.includes(cfg.anchor)) {
      html = html.replace(cfg.anchor, cfg.html + cfg.anchor);
    } else {
      console.log(`skip ${file} (anchor not found)`);
      return;
    }
  }

  if (file === "services.html" && !html.includes('"@type": "ItemList"')) {
    const block = `  <script type="application/ld+json">\n${JSON.stringify(servicesSchema(), null, 2)}\n  </script>\n</head>`;
    html = html.replace("</head>", block);
  }

  if (file === "projects.html" && !html.includes('"@type": "ImageGallery"')) {
    const block = `  <script type="application/ld+json">\n${JSON.stringify(gallerySchema(), null, 2)}\n  </script>\n</head>`;
    html = html.replace("</head>", block);
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`content-patched ${file}`);
    changed += 1;
  }
});

console.log(`\n${changed} page(s) updated.`);
