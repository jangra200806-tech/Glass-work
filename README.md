# MAA MANSA DEVI GLASS WORK - Website

Plain HTML/CSS/JS frontend with Node.js + Express backend. Data stored in JSON files (no database).

## Folder Structure
- `server.js` — Express server entry point
- `public/` — Frontend (HTML, CSS, JS, images)
- `routes/` — API routes (products, projects, enquiries, admin)
- `data/` — JSON files (products.json, projects.json, enquiries.json)
- `.env` — Secrets (PORT, ADMIN_PASSWORD, SESSION_SECRET, CONTACT_PHONE)

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
| Email (Resend) | `RESEND_API_KEY` + `ENQUIRY_TO_EMAIL` | Har enquiry email par aati hai (reply karke seedha call/WhatsApp kar sakte ho) |
| Google Sheet | `SHEET_WEBHOOK_URL` | Har enquiry sheet me ek row banata hai (leads kabhi gayab nahi hote, phone list ban jaata hai) |
| Koi nahi | — | Enquiry Vercel logs me `console.log` hoti hai (`Dashboard → Logs`) |

Extra safety: honeypot field (bots filter), IP rate-limit (5 / 10 min), size + length validation.

### Setup (one-time)

**A) Resend se email**
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

