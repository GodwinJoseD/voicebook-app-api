const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Ensures SSL works on RDS
  },
});

pool.connect()
  .then(() => console.log("✅ Connected to Amazon RDS PostgreSQL! 🚀"))
  .catch((err) => {
    console.error("❌ Initial connection error:", err);
    process.exit(1); // Stop the app if connection fails
  });

const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("❌ Query Error:", err);
    throw err;
  }
};

module.exports = {
  query,
};
