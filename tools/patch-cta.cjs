/**
 * Internal linking pass: products / services / projects pages par
 * pricing + service-areas CTA add karta hai (SEO + conversion).
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");

const CTA = `
    <!-- ================= PRICING / SERVICE AREAS CTA ================= -->
    <section class="section bg-navy">
      <div class="container">
        <div class="cta-banner reveal">
          <h2>Apne kaam ka rate janna hai?</h2>
          <p>Glass, aluminium, steel, UPVC aur ACP ke indicative rates dekhein — ya apne shehar me humara kaam karwana ho to confirm kar lein.</p>
          <div class="cta-actions">
            <a href="pricing.html" class="btn-primary">See Rates</a>
            <a href="service-areas.html" class="btn-secondary">Areas We Serve</a>
            <a href="contact.html" class="btn-outline">Contact Us</a>
          </div>
        </div>
      </div>
    </section>
`;

["products.html", "services.html", "projects.html"].forEach((file) => {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, "utf8");
  if (html.includes("PRICING / SERVICE AREAS CTA")) {
    console.log(`skip ${file}`);
    return;
  }
  const marker = "\n  </main>";
  const idx = html.indexOf(marker);
  if (idx === -1) {
    console.log(`marker not found in ${file}`);
    return;
  }
  html = html.slice(0, idx) + "\n" + CTA + html.slice(idx);
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`patched ${file}`);
});
