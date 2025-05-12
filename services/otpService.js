const { PublishCommand } = require('@aws-sdk/client-sns');
const crypto = require('crypto');
const { query } = require('../db/db');
const snsClient = require('../utils/awsConfig');

const generateOtp = () => {
  return crypto.randomInt(1000, 9999).toString(); // Generate a 4-digit OTP
};

const sendOtp = async (phoneNumber, otp) => {
  const params = {
    Message: `Your OTP code is ${otp}`,
    PhoneNumber: phoneNumber,
  };

  try {
    const command = new PublishCommand(params);
    await snsClient.send(command);
  } catch (error) {
    console.error('Error sending OTP', error);
    throw new Error('Error sending OTP');
  }
};

const saveOtp = async (userId, otp) => {
  const sql = `INSERT INTO usr.otps (user_id, otp, is_active) VALUES ($1, $2, TRUE) RETURNING *`;
  const values = [userId, otp];
  const result = await query(sql, values);
  return result.rows[0];
};

const verifyOtp = async (userId, otp) => {
  const sql = `SELECT * FROM usr.otps WHERE user_id = $1 AND otp = $2 AND is_active = TRUE`;
  const values = [userId, otp];
  const result = await query(sql, values);

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired OTP');
  }

  const updateSql = `UPDATE usr.otps SET is_active = FALSE WHERE user_id = $1 AND otp = $2`;
  await query(updateSql, values);

  return result.rows[0];
};

const disablePreviousOtps = async (userId) => {
  const sql = `UPDATE usr.otps SET is_active = FALSE WHERE user_id = $1 AND is_active = TRUE`;
  await query(sql, [userId]);
};

const resendOtp = async (userId, phoneNumber) => {
  await disablePreviousOtps(userId);
  const otp = generateOtp();
  await sendOtp(phoneNumber, otp);
  await saveOtp(userId, otp);
  return otp;
};

module.exports = {
  generateOtp,
  sendOtp,
  saveOtp,
  verifyOtp,
  disablePreviousOtps,
  resendOtp,
};