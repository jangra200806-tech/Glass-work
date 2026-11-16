# MAA MANSA DEVI GLASS WORK - Website

Plain HTML/CSS/JS frontend with Node.js + Express backend. Data stored in JSON files (no database).

## Folder Structure
- `server.js` — Express server entry point
- `public/` — Frontend (HTML, CSS, JS, images)
- `routes/` — API routes (products, projects, enquiries, admin)
- `data/` — JSON files (products.json, projects.json, enquiries.json)
- `api/` — Vercel serverless functions (`chat.js` = AI assistant, `enquiry.js` = lead capture)
- `tools/` — build/verify scripts (naye pages generate karne + link check ke liye)
- `.env` — Secrets (PORT, ADMIN_PASSWORD, SESSION_SECRET, CONTACT_PHONE)

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Hero, highlights, about, trust strip, quote CTA |
| About | `about.html` | Company intro, why-us |
| Products | `products.html` | 5 categories with filter + modal |
| Services | `services.html` | 6 services |
| Projects | `projects.html` | Work gallery with filter + lightbox |
| Pricing | `pricing.html` | Indicative rate list (SEO + enquiry) |
| Service Areas | `service-areas.html` | Kaithal + nearby towns |
| Contact | `contact.html` | Address, hours, map, quote form, FAQ |
| Privacy Policy | `privacy-policy.html` | Legal / trust |
| 404 | `404.html` | Not found page (noindex) |

### Build tools

```bash
node tools/build-pages.cjs    # pricing / service-areas / privacy / 404 regenerate
node tools/patch-pages.cjs    # existing pages par footer + links sync
node tools/patch-cta.cjs      # products/services/projects par pricing CTA
node tools/patch-nav.cjs      # nav me Pricing item + compact gap
node tools/bump-assets.cjs    # css/js version bump (immutable cache ke liye)
node tools/check-links.cjs    # saare local href/src resolve hone ka check
```

Naye page banane ka flow: `tools/build-pages.cjs` me page definition add karo → `node tools/build-pages.cjs` → `node tools/bump-assets.cjs` → `node tools/check-links.cjs` → commit + deploy.

**Cache note:** `vercel.json` me `/css/*`, `/js/*`, `/images/*` par 1-year immutable cache hai — isliye file badalne par `?v=` version zaroor bump karna hai (`tools/bump-assets.cjs`).

## Analytics

`public/data/info.js` me `gaId: "G-XXXXXXXXXX"` daalne par GA4 load ho jata hai. Tab tak bhi `call_click`, `whatsapp_click` aur `enquiry_submit` events `window.dataLayer` me push hote hain (GTM/GA4 se connect karne ke liye ready).


## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open in browser:
   - Website: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`

4. Admin login:
   - Password from `.env` file (`ADMIN_PASSWORD`)

> Admin panel sirf **local server** par chalta hai (`admin/index.html` + `routes/admin.js`).
> Vercel par ye deploy nahi hota — wahan ke liye database (Vercel KV / Postgres) chahiye.
> Isliye production me `/admin` se koi broken login page nahi dikhta.

## Notes
- Do not share `.env` file.
- Images uploaded via admin panel save to `public/images/uploads/`.
- Only JPG, PNG, WEBP allowed (max 2MB).

## Lead Capture (Contact Form)

Contact form ka enquiry **WhatsApp + serverless email/sheet** dono par jaata hai, taaki koi lead drop na ho.

Flow: `public/js/script.js` → `POST /api/enquiry` → `api/enquiry.js` (Vercel serverless function)

`api/enquiry.js` me 2 optional channels hain (koi bhi ya dono enable kar sakte ho):

| Channel | Env vars | Kya hota hai |
|---|---|---|
| Email (Brevo) ✅ active | `BREVO_API_KEY` + `ENQUIRY_TO_EMAIL` + `BREVO_SENDER_EMAIL` | Har enquiry email par aati hai (reply karke seedha call/WhatsApp kar sakte ho) |
| Email (Resend) — alternative | `RESEND_API_KEY` + `ENQUIRY_TO_EMAIL` | Brevo ke bajaye Resend se email (sirf tab chalta hai jab Brevo key na ho) |
| Google Sheet | `SHEET_WEBHOOK_URL` | Har enquiry sheet me ek row banata hai (leads kabhi gayab nahi hote, phone list ban jaata hai) |
| Koi nahi | — | Enquiry Vercel logs me `console.log` hoti hai (`Dashboard → Logs`) |

Extra safety: honeypot field (bots filter), IP rate-limit (5 / 10 min), size + length validation.

### Setup (one-time)

**A) Brevo se email (currently active)** — https://app.brevo.com
1. Brevo account banao → account email verify ho jaata hai (yahi default sender hota hai).
2. **Senders & IP → Domains/Emails** me apna email verify karo (naya account bana hai to pehle yahi step zaroori hai).
3. Brevo → SMTP & API → **API Keys** → nayi key banao.
4. Vercel me env vars add karo:
   ```bash
   vercel env add BREVO_API_KEY production
   vercel env add ENQUIRY_TO_EMAIL production      # jis email par enquiry chahiye
   vercel env add BREVO_SENDER_EMAIL production    # Brevo me verified sender
   vercel env add BREVO_SENDER_NAME production     # "Maa Mansa Devi Glass Works"
   ```
5. `vercel --prod` se deploy karo → test enquiry bhejo aur inbox check karo.

**A2) Resend se email (optional alternative)**
1. https://resend.com par sign up, domain verify karo (ya `onboarding@resend.dev` se start karo).
2. API key banao → copy karo.
3. Vercel me env vars add karo:
   ```bash
   vercel env add RESEND_API_KEY production
   vercel env add ENQUIRY_TO_EMAIL production
   ```
4. `vercel --prod` se deploy karo.

**B) Google Sheet**
1. Google Sheet banao (headers: Name, Phone, Service, Message, Page, Time).
2. Extensions → Apps Script → neeche ka code paste karke **Deploy → New deployment → Web app** (Execute as me, Access: Anyone).
3. Apps Script ka URL `SHEET_WEBHOOK_URL` me add karo:
   ```bash
   vercel env add SHEET_WEBHOOK_URL production
   ```

Apps Script code:
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([d.name, d.phone, d.service, d.message, d.page, d.time]);
  return ContentService.createTextOutput("ok");
}
```

### Local test
```bash
npm start
# -> http://localhost:3000/contact  (form bhar ke submit karein)
```

