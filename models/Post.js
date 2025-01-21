import { query } from '../db/db.js';

// Insert a new post
export const createPost = async (userId, s3Key) => {
  const sql = `INSERT INTO posts (user_id, s3_key) VALUES ($1, $2) RETURNING *`;
  const values = [userId, s3Key];
  const result = await query(sql, values);
  return result.rows[0];
};

// Update an existing post
export const updatePost = async (postId, s3Key) => {
  const sql = `UPDATE posts SET s3_key=$1, updated_at=NOW() WHERE id=$2 RETURNING *`;
  const values = [s3Key, postId];
  const result = await query(sql, values);
  return result.rows[0];
};

// Fetch all posts for a user
export const getPostsByUserId = async (userId) => {
  const sql = `SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC`;
  const result = await query(sql, [userId]);
  return result.rows;
};
