const express = require('express');
const upload = require('../utils/upload');
const {uploadToS3} = require('../services/s3');
const { query } = require('../db/db'); // Correctly import the query function

const router = express.Router();
const uploadFields = upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]);

// Upload or Edit Post
router.post('/posts', uploadFields, async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!audioFile) return res.status(400).send('Audio file is required');

    // Check if user exists
    const userResult = await query('SELECT * FROM usr.users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const audioFileName = `${userId}-${Date.now()}.mp3`;
    const audioS3Response = await uploadToS3(audioFile.buffer, audioFileName, 'audio/mpeg');

    let thumbnailS3Response = null;
    if (thumbnailFile) {
      const thumbnailFileName = `${userId}-${Date.now()}-thumbnail.${thumbnailFile.mimetype.split('/')[1]}`;
      thumbnailS3Response = await uploadToS3(thumbnailFile.buffer, thumbnailFileName, thumbnailFile.mimetype);
    }

    // Update or Insert post metadata in DB
    const sql = postId
      ? `UPDATE post.posts SET s3_key=$1, s3_url=$2, thumbnail_url=$3, updated_at=NOW() WHERE id=$4 RETURNING *`
      : `INSERT INTO posts.posts (user_id, s3_key, s3_url, thumbnail_url) VALUES ($1, $2, $3, $4) RETURNING *`;

    const values = postId
      ? [audioS3Response.Key, audioS3Response.Location, thumbnailS3Response ? thumbnailS3Response.Location : null, postId]
      : [userId, audioS3Response.Key, audioS3Response.Location, thumbnailS3Response ? thumbnailS3Response.Location : null];
    const result = await query(sql, values);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get Posts
// Get Posts with Like and Comment Counts
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, 
              u.name AS username, 
              u.profile_pic,
              (SELECT COUNT(*) FROM posts.likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM posts.comments WHERE post_id = p.id) AS comment_count
       FROM posts.posts p
       JOIN usr.users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// Like a Post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body; // User ID from the request body
    const { postId } = req.params; // Post ID from the route parameter

    // Check if the post exists
    const postResult = await query('SELECT * FROM posts.posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user already liked the post
    const likeResult = await query('SELECT * FROM posts.likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    if (likeResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already liked this post' });
    }

    // Add a like to the post
    await query('INSERT INTO posts.likes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Comment on a Post
router.post('/posts/:postId/comment', async (req, res) => {
  try {
    const { userId, comment } = req.body; // User ID and comment from the request body
    const { postId } = req.params; // Post ID from the route parameter

    // Check if the post exists
    const postResult = await query('SELECT * FROM posts.posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user already commented on the post
    const commentResult = await query('SELECT * FROM posts.comments WHERE user_id = $1 AND post_id = $2 AND comment = $3', [userId, postId, comment]);
    if (commentResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already commented on this post with the same comment' });
    }

    // Add a comment to the post
    const result = await query(
      'INSERT INTO posts.comments (user_id, post_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [userId, postId, comment]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// Get Posts for a Specific User
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params; // User ID from the route parameter
    const { page = 1, limit = 10 } = req.query; // Pagination parameters
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, u.name AS username, u.profile_pic,
              (SELECT COUNT(*) FROM posts.likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM posts.comments WHERE post_id = p.id) AS comment_count
       FROM posts.posts p
       JOIN usr.users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;