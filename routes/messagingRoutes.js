const express = require('express');
const { query } = require('../db/db'); // Import database query function

const router = express.Router();

// POST /api/messages: Save a message to the database
router.post('/messages', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: 'Sender, receiver, and message are required' });
    }

    const sql = `INSERT INTO msg.messages (sender, receiver, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const result = await query(sql, [sender, receiver, message]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Error saving message' });
  }
});

// GET /api/messages: Retrieve messages between two users
router.get('/messages', async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    if (!sender || !receiver) {
      return res.status(400).json({ message: 'Sender and receiver are required' });
    }

    const sql = `SELECT * FROM msg.messages WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) ORDER BY created_at ASC`;
    const result = await query(sql, [sender, receiver]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
});

module.exports = router;