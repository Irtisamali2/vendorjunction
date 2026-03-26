const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vendorjunction',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
  charset: 'utf8mb4'
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL connected successfully to', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('✗ MySQL connection error:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
