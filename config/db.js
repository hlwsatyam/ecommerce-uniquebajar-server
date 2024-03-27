const mysql = require("mysql2/promise");

// Create a MySQL connection pool
const DBconnection = mysql.createPool({
  host: "sql10.freesqldatabase.com",
  user: "sql10694641",
  password: "n6EFNGc8LS",
  port: 3306,
  database: "sql10694641",
});
DBconnection.getConnection()
  .then((connection) => {
    console.log("MySQL DB is connected!");
    connection.release(); // Release the connection when done
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err);
  });

module.exports = { DBconnection };
