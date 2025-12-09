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



// -- =========================================
// -- CREATE DATABASE + TABLES FOR PROJECT TRACKER
// -- =========================================

// -- 1️⃣ Create schema
// CREATE DATABASE IF NOT EXISTS project_tracker
// CHARACTER SET utf8mb4
// COLLATE utf8mb4_unicode_ci;

// -- 2️⃣ Select schema
// USE project_tracker;

// -- 3️⃣ Drop tables if needed (clean reset)
// DROP TABLE IF EXISTS builds;
// DROP TABLE IF EXISTS modules;
// DROP TABLE IF EXISTS projects;

// -- =========================================
// -- 4️⃣ Create tables
// -- =========================================

// -- Projects table
// CREATE TABLE projects (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

// -- Modules table
// CREATE TABLE modules (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     project_id INT NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
//     FOREIGN KEY (project_id) REFERENCES projects(id)
//         ON DELETE CASCADE
//         ON UPDATE CASCADE
// );

// -- Builds table
// CREATE TABLE builds (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     module_id INT NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     sub_modules JSON,
//     platform ENUM('Web','Mobile','Desktop') NOT NULL,
//     type ENUM('Feature','Bug','Enhancement') NOT NULL,
//     severity ENUM('Low','Medium','High') NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
//     FOREIGN KEY (module_id) REFERENCES modules(id)
//         ON DELETE CASCADE
//         ON UPDATE CASCADE
// );

// -- =========================================
// -- 5️⃣ Indexes for performance
// -- =========================================
// CREATE INDEX idx_project_name ON projects(name);
// CREATE INDEX idx_module_name ON modules(name);
// CREATE INDEX idx_build_name ON builds(name);
// CREATE INDEX idx_build_platform ON builds(platform);
// CREATE INDEX idx_build_severity ON builds(severity);
