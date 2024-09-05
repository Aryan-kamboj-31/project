const mysql = require('mysql2');

const pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'aryan',
});
pool.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

module.exports = pool.promise();
