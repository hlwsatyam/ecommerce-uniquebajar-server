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

const mysql = require("mysql2");

// Create a MySQL connection
const DBconnection = mysql.createConnection({
 
  host: "bev468uhbrummaolbhgv-mysql.services.clever-cloud.com",
  user: "uynav9vpzfhppe2v",
  password: "cOEiXwSjsegSo4YCLUvq",
  port: 3306,
  database: "bev468uhbrummaolbhgv",
});

DBconnection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("MySQL DB is connected!");
});

module.exports = { DBconnection };
