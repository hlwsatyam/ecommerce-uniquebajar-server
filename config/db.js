// const sql = require("mysql2/promise");
// const DBconnection = sql.createPool({
//   /*  host: "localhost",
//   user: "root", 
//   password: "",
//   database: "eccommerce_uniquebajar", */
//   host: "bev468uhbrummaolbhgv-mysql.services.clever-cloud.com",
//   user: "uynav9vpzfhppe2v",
//   password: "cOEiXwSjsegSo4YCLUvq",
//   port: 3306,
//   database: "bev468uhbrummaolbhgv",
// });
  
// DBconnection.getConnection()
//   .then((connection) => {
//     console.log("MySQL DB is connected!");
//     connection.release(); // Release the connection when done
//   })
//   .catch((err) => {
//     console.error("Error connecting to MySQL:", err);
//   });

// module.exports = { DBconnection };
const mysql = require("mysql2/promise");

// Create a MySQL connection pool
const DBconnection = mysql.createPool({
  /*  host: "localhost",
  user: "root", 
  password: "",
  database: "eccommerce_uniquebajar", */
  host: "bev468uhbrummaolbhgv-mysql.services.clever-cloud.com",
  user: "uynav9vpzfhppe2v",
  password: "cOEiXwSjsegSo4YCLUvq",
  port: 3306,
  database: "bev468uhbrummaolbhgv",
  connectionLimit: 1, // Set connection limit to 1 for a single connection
});

// Execute a simple query to check if the connection is successful
DBconnection.query('SELECT 1')
  .then(([rows, fields]) => {
    console.log('MySQL DB is connected!');
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
  });

// Export the DB connection
module.exports = { DBconnection };

