const mysql = require('mysql2/promise'); // Use promise-based version of mysql2

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',   // Use environment variables for flexibility
    user: process.env.DB_USER || 'root',        // Default to 'root', but use env variables if available
    password: process.env.DB_PASS || '',        // Add password if needed
    database: process.env.DB_NAME || 'sharan',   // Use env variable for database name
    waitForConnections: true,                   // Manage pool behavior
    connectionLimit: 10,                        // Limit the number of connections in the pool
    queueLimit: 0
});

// Export the pool for use in other modules
module.exports = pool;
