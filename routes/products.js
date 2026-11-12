const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf-8');
  res.json(JSON.parse(data));
});

module.exports = router;
