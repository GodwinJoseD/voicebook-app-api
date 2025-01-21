const express = require('express');
const multer=require('multer');
const uploadToS3=require('../services/s3.js');
const query=require('../db/db.js');

const router = express.Router();
const upload = multer(); // In-memory file upload

// Upload or Edit Post
router.post('/posts', upload.single('audio'), async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const audioFile = req.file;

    if (!audioFile) return res.status(400).send('Audio file is required');

    const fileName = `${userId}-${Date.now()}.mp3`;
    const s3Response = await uploadToS3(audioFile.buffer, fileName);

    // Update or Insert post metadata in DB
    const sql = postId
      ? `UPDATE posts SET s3_key=$1, updated_at=NOW() WHERE id=$2 RETURNING *`
      : `INSERT INTO posts (user_id, s3_key) VALUES ($1, $2) RETURNING *`;

    const values = postId ? [s3Response.Key, postId] : [userId, s3Response.Key];
    const result = await query(sql, values);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get Posts
router.get('/posts', async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
