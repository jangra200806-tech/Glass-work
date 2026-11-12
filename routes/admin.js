const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error('Sirf jpg, png ya webp image allow hai'));
  }
});

function requireAuth(req, res, next) {
  if (req.session.admin) return next();
  res.status(401).json({ error: 'Login zaroori hai' });
}

const readFile = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
const writeFile = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

// Auth
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Galat password' });
});

router.get('/me', (req, res) => {
  res.json({ loggedIn: !!req.session.admin });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Products CRUD
router.get('/products', requireAuth, (req, res) => {
  res.json(readFile('products.json'));
});

router.post('/products', requireAuth, (req, res) => {
  const products = readFile('products.json');
  const item = { id: Date.now(), ...req.body };
  products.push(item);
  writeFile('products.json', products);
  res.status(201).json(item);
});

router.put('/products/:id', requireAuth, (req, res) => {
  const products = readFile('products.json');
  const idx = products.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nahi mila' });
  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  writeFile('products.json', products);
  res.json(products[idx]);
});

router.delete('/products/:id', requireAuth, (req, res) => {
  let products = readFile('products.json');
  products = products.filter(p => p.id != req.params.id);
  writeFile('products.json', products);
  res.json({ success: true });
});

// Projects CRUD
router.get('/projects', requireAuth, (req, res) => {
  res.json(readFile('projects.json'));
});

router.post('/projects', requireAuth, (req, res) => {
  const projects = readFile('projects.json');
  const item = { id: Date.now(), ...req.body };
  projects.push(item);
  writeFile('projects.json', projects);
  res.status(201).json(item);
});

router.put('/projects/:id', requireAuth, (req, res) => {
  const projects = readFile('projects.json');
  const idx = projects.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nahi mila' });
  projects[idx] = { ...projects[idx], ...req.body, id: projects[idx].id };
  writeFile('projects.json', projects);
  res.json(projects[idx]);
});

router.delete('/projects/:id', requireAuth, (req, res) => {
  let projects = readFile('projects.json');
  projects = projects.filter(p => p.id != req.params.id);
  writeFile('projects.json', projects);
  res.json({ success: true });
});

// Image upload
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Koi file nahi mili' });
  res.json({ url: '/images/uploads/' + req.file.filename });
});

// Enquiries list for admin
router.get('/enquiries', requireAuth, (req, res) => {
  res.json(readFile('enquiries.json'));
});

module.exports = router;
