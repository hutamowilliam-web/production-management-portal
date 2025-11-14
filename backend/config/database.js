const mysql = require('mysql2/promise');
const Redis = require('redis');
require('dotenv').config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Redis Client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Initialize database connection
async function initializeDatabase() {
  try {
    // Test MySQL connection
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
    
    // Connect to Redis
    await redisClient.connect();
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

// Get database connection
async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  pool,
  redisClient,
  initializeDatabase,
  executeQuery,
  getConnection
};