require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Config endpoint (phone number for WhatsApp/Call buttons)
app.get('/api/config', (req, res) => {
  res.json({ phone: process.env.CONTACT_PHONE || '' });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/admin', require('./routes/admin'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
