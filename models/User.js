const { query } = require('../db/db');
const bcrypt = require('bcrypt');

const createUser = async (name, password, phoneNumber) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO usr.users (name, password, phone_number) VALUES ($1, $2, $3) RETURNING *`;
  const values = [name, hashedPassword, phoneNumber];
  const result = await query(sql, values);
  return result.rows[0];
};

const getUserByUsername = async (name) => {
  const sql = `SELECT * FROM usr.users WHERE name = $1`;
  const result = await query(sql, [name]);
  return result.rows[0];
};

const getUserByPhoneNumber = async (phoneNumber) => {
    const sql = `SELECT * FROM usr.users WHERE phone_number = $1`;
    const result = await query(sql, [phoneNumber]);
    return result.rows[0];
  };
module.exports = {
  createUser,
  getUserByUsername,
  getUserByPhoneNumber
};