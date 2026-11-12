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
