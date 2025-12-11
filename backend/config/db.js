// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// single pool that every module will share
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// quick test on first require
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL pool connected');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);   // fail fast
  }
})();

module.exports = pool;

