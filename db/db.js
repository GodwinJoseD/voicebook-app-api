const {Pool}=require('pg');
const dotenv=require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
    ssl: {
      rejectUnauthorized: false, // For connecting to managed databases like Heroku Postgres
    },
  });
  
  // Example query
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.log('Database connected:', res.rows[0]);
    }
  });
  
  module.exports = pool; // Export the pool for use in other files
