const sql = require("mysql2/promise");
const DBconnection = sql.createPool({
 /*  host: "localhost",
  user: "root", 
  password: "",
  database: "eccommerce_uniquebajar", */
  host: "bev468uhbrummaolbhgv-mysql.services.clever-cloud.com",
  user: "uynav9vpzfhppe2v", 
  password: "cOEiXwSjsegSo4YCLUvq",
  port: 3306,
  database: "bev468uhbrummaolbhgv",
});

// Use .then() to handle the promise returned by createPool
DBconnection.getConnection()
  .then((connection) => {
    console.log("MySQL DB is connected!");
    connection.release(); // Release the connection when done
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err);
  });

module.exports = { DBconnection };
