const mysql = require("mysql2/promise");

// Create a MySQL connection pool
const DBconnection = mysql.createPool({
  // host: "localhost",
  // user: "root",
  // password: "", 
  // port: 3306,
  // database: "eccommerce_uniquebajar",
  host: "unique-bajar-db.cte2uw8ii1ew.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "2017Krishna",
  port: 3306,
  database: "uniqu_bajar", 
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
