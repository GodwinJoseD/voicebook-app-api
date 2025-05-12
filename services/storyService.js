const { query } = require('../db/db');
const {uploadToStoryS3}= require('./s3');

const createStory = async (userId, file, caption, expiresAt) => {
  const fileName = `${userId}-${Date.now()}.mp3`;
  const s3Response = await uploadToStoryS3(file.buffer, fileName, 'audio/mpeg');

  // Set expiry date to 24 hours from now if not provided
  const expiryDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const sql = `INSERT INTO stories.stories (user_id, s3_key, s3_url, caption, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [userId, s3Response.Key, s3Response.Location, caption, expiryDate];
  const result = await query(sql, values);

  return result.rows[0];
};

const getStories = async (page, limit) => {
  const offset = (page - 1) * limit;
  const sql = `SELECT s.*, u.name AS username, u.profile_pic_url
               FROM stories.stories s
               JOIN usr.users u ON s.user_id = u.id
               ORDER BY s.created_at DESC
               LIMIT $1 OFFSET $2`;
  const values = [limit, offset];
  const result = await query(sql, values);

  return result.rows;
};

module.exports = {
  createStory,
  getStories,
};