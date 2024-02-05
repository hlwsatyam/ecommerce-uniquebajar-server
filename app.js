// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes");

const { ErrorController } = require("./createError/createError");
const { DBconnection } = require("./config/db");
const { insertMultipleData } = require("./Data/InsertData/InsertData");
const fs = require('fs').promises;
const mysql = require('mysql2/promise');

require("dotenv").config({path:'./.env'});
require("./config/db");
const app = express();

// Middleware
// app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const RunQue = async () => {
  let DBconnection;

  try {
    DBconnection = await mysql.createPool({
      host: "viaduct.proxy.rlwy.net",
      user: "root",
      password: "54abdH6DFB1bc5bh--Eg-5ch65ecHCD6",
      database: "railway",
      port: 56459,
    });

    // Read your SQL file
    const sqlFileContent = await fs.readFile(
      "./Data/eccommerce_uniquebajar (4).sql",
      "utf8"
    );

    // Split the SQL file content into individual queries
    const queries = sqlFileContent.split(";");

    // Iterate through queries and execute them
    for (const query of queries) {
      if (query.trim() !== "") {
        try {
          // Execute the query
          await DBconnection.query(query);
        } catch (error) {
          // Handle errors - log the error or perform additional actions
          console.error("Error executing query:", error);
        }
      }
    }

    console.log("Database import completed.");
  } catch (error) {
    console.error("Error importing database:", error);
  } finally {
    if (DBconnection) {
      // Close the connection pool in the 'finally' block to ensure it's closed even if an error occurs
      DBconnection.end();
    }
  }
};

// RunQue();

// insertMultipleData()

// Routes
app.use("/api", router);

app.use(ErrorController);

module.exports = app;
