const express = require('express');
const { query } = require('../db/db');

const router = express.Router();

// GET /test: Test database connection
router.get('/test', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error testing database connection', error);
    res.status(500).json({ message: 'Error testing database connection' });
  }
});

module.exports = router;