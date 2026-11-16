/**
 * SEO keyword pass — title / description / H1 ko local-search keywords ke
 * saath optimize karta hai + har page par LocalBusiness (NAP) schema.
 *
 * Run: node tools/seo-patch.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://maa-mansa-devi-glass-works.vercel.app";

/* ---------- Keyword map ---------- */
const PAGES = {
  "index.html": {
    title: "Glass & UPVC Work in Kaithal, Haryana | MAA MANSA DEVI",
    desc: "MAA MANSA DEVI GLASS WORKS provides glass, aluminium, steel, UPVC and ACP fabrication in Kaithal, Haryana. Custom fabrication and installation today.",
    h1: "Premium Glass Work in Kaithal <br>for Every Space"
  },
  "about.html": {
    title: "About MAA MANSA DEVI Glass Works | Kaithal, Haryana",
    desc: "MAA MANSA DEVI GLASS WORKS — Kaithal ki glass, aluminium, steel, UPVC aur ACP fabrication company. Quality material, expert installation, free measurement.",
    h1: "About MAA MANSA DEVI <br>Glass Works, Kaithal"
  },
  "products.html": {
    title: "Glass, Aluminium, Steel & UPVC Products | Kaithal",
    desc: "Toughened glass, laminated glass, aluminium sections, steel work, UPVC windows aur ACP panels — Kaithal me custom fabrication aur installation.",
    h1: "Glass, Aluminium &amp; UPVC <br>Products in Kaithal"
  },
  "services.html": {
    title: "Glass Partition, Windows & Steel Fabrication | Kaithal",
    desc: "Glass partition installation, aluminium & UPVC windows and doors, steel fabrication, ACP cladding aur mirror fitting — Kaithal, Haryana. Free quote.",
    h1: "Glass Partition, Windows &amp; Steel <br>Services in Kaithal"
  },
  "projects.html": {
    title: "Our Glass & Steel Work Gallery | Kaithal, Haryana",
    desc: "Kaithal ke glass partition, shower enclosure, steel gate, ACP facade cladding aur UPVC window projects ke photos — MAA MANSA DEVI GLASS WORKS ka kaam.",
    h1: "Our Glass &amp; Steel Work <br>in Kaithal"
  },
  "contact.html": {
    title: "Contact MAA MANSA DEVI Glass Works | Kaithal, Haryana",
    desc: "MAA MANSA DEVI GLASS WORKS Kaithal — Karnal Road address, timings, phone numbers aur WhatsApp. Free quote ke liye aaj hi contact karein. 24 ghante me reply.",
    h1: "Contact Us in <br>Kaithal, Haryana"
  },
  "pricing.html": {
    title: "Glass & UPVC Price List in Kaithal | MAA MANSA DEVI",
    desc: "Toughened glass, ACP cladding, UPVC windows aur steel fabrication ke indicative rates in Kaithal, Haryana. Free measurement aur site visit.",
    h1: "Glass &amp; Fabrication <br>Rates in Kaithal"
  },
  "service-areas.html": {
    title: "Glass Shop in Kaithal & Nearby Cities | MAA MANSA DEVI",
    desc: "Kaithal, Karnal, Kurukshetra, Yamunanagar, Narwana aur Assand me glass, aluminium, steel, UPVC aur ACP fabrication. Free measurement aur site visit.",
    h1: "Glass Shop in Kaithal <br>&amp; Nearby Towns"
  },
  "privacy-policy.html": {
    title: "Privacy Policy — MAA MANSA DEVI GLASS WORKS, Kaithal",
    desc: "MAA MANSA DEVI GLASS WORKS ki privacy policy — contact form se aapki jaankari kaise use hoti hai.",
    h1: "Privacy Policy"
  }
};

/* ---------- LocalBusiness (NAP) schema — har page par ---------- */
function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: "MAA MANSA DEVI GLASS WORKS",
    url: `${SITE}/`,
    image: `${SITE}/images/og-logo.jpg`,
    logo: `${SITE}/images/logo-full.svg`,
    description: "Glass, aluminium, steel, UPVC and ACP fabrication work in Kaithal, Haryana.",
    telephone: ["+918607774600", "+917082014381"],
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony",
      addressLocality: "Kaithal",
      addressRegion: "Haryana",
      postalCode: "136027",
      addressCountry: "IN"
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "09:00",
        closes: "13:00"
      }
    ],
    areaServed: [
      { "@type": "City", name: "Kaithal" },
      { "@type": "City", name: "Karnal" },
      { "@type": "City", name: "Kurukshetra" },
      { "@type": "City", name: "Yamunanagar" },
      { "@type": "City", name: "Narwana" },
      { "@type": "City", name: "Assand" }
    ]
  };
}

/* ---------- Apply ---------- */
let changed = 0;

Object.entries(PAGES).forEach(([file, cfg]) => {
  const filePath = path.join(PUBLIC, file);
  if (!fs.existsSync(filePath)) {
    console.log(`skip ${file} (missing)`);
    return;
  }
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${cfg.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${cfg.desc}">`
  );

  /* H1 (sirf pehla) */
  html = html.replace(
    /<h1([^>]*)>[\s\S]*?<\/h1>/,
    `<h1$1>${cfg.h1}</h1>`
  );

  /* OG / Twitter title + description */
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${cfg.title}">`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${cfg.title}">`
  );

  /* LocalBusiness schema har page par (NAP consistency) — duplicate mat banao.
     Nested "LocalBusiness" (jaise OfferCatalog ke provider) count nahi hota. */
  const hasTopLevelLocalBusiness = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .some((m) => {
      try {
        const parsed = JSON.parse(m[1]);
        return parsed["@type"] === "LocalBusiness" || parsed["@type"] === "LocalBusiness";
      } catch (e) {
        return false;
      }
    });

  if (!hasTopLevelLocalBusiness) {
    const block = `  <script type="application/ld+json">\n${JSON.stringify(localBusinessSchema(), null, 2)}\n  </script>\n</head>`;
    html = html.replace("</head>", block);
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`seo-patched ${file} (title ${cfg.title.length} chars, desc ${cfg.desc.length} chars)`);
    changed += 1;
  }
});

console.log(`\n${changed} page(s) optimized.`);
