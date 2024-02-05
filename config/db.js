const sql = require("mysql2/promise");

const DBconnection = sql.createPool({
  "host": "viaduct.proxy.rlwy.net",
  "user": "root",
  "password": "54abdH6DFB1bc5bh--Eg-5ch65ecHCD6",
  "database": "railway",
  "port":56459
});
 
// Use .then() to handle the promise returned by createPool
DBconnection.getConnection()
  .then((connection) => {
    console.log("MySQL DB is connected!");
    connection.release(); // Release the connection when done
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err.message);
  });

module.exports = { DBconnection };
