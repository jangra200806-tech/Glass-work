const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/', (req, res) => {
  const { name, phone, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Sabhi fields bharna zaroori hai' });
  }

  const enquiries = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf-8')
  );

  const newEnquiry = {
    id: Date.now(),
    name,
    phone,
    message,
    date: new Date().toISOString()
  };

  enquiries.push(newEnquiry);
  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'enquiries.json'),
    JSON.stringify(enquiries, null, 2)
  );

  res.status(201).json({ success: true, data: newEnquiry });
});

module.exports = router;
