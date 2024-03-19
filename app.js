// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes");

const { ErrorController } = require("./createError/createError");
const { DBconnection } = require("./config/db");
const { insertMultipleData } = require("./Data/InsertData/InsertData");
const fs = require("fs").promises;
const mysql = require("mysql2/promise");

require("dotenv").config({ path: "./.env" });
require("./config/db");
const app = express();

// Middleware
// app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const RunQue = async () => {
  try {
    await DBconnection.query(`
      ALTER TABLE customer
      MODIFY COLUMN customer_id INT(11) NOT NULL AUTO_INCREMENT,
      MODIFY COLUMN first_name VARCHAR(50) NULL,
      MODIFY COLUMN last_name VARCHAR(50)  NULL,
      MODIFY COLUMN email VARCHAR(100) NOT NULL,
      MODIFY COLUMN phone_number VARCHAR(20) NOT NULL,
      MODIFY COLUMN address_line1 VARCHAR(255)  NULL,
      MODIFY COLUMN address_line2 VARCHAR(255)  NULL,
      MODIFY COLUMN city VARCHAR(100)  NULL,
      MODIFY COLUMN state VARCHAR(100)  NULL,
      MODIFY COLUMN zip_code VARCHAR(20)  NULL,
      MODIFY COLUMN country VARCHAR(100)  NULL,
      MODIFY COLUMN registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
      MODIFY COLUMN dob DATE  NULL,
      MODIFY COLUMN gender VARCHAR(22)  NULL,
      MODIFY COLUMN account_status VARCHAR(22)  NULL,
      MODIFY COLUMN preferred_language VARCHAR(22)  NULL,
      MODIFY COLUMN last_login TIMESTAMP NULL DEFAULT NULL,
      ADD INDEX (email)
    `);
    console.log("table modified");
  } catch (error) {
    console.log("failed to modify table:", error);
  }
};

//  RunQue();

// insertMultipleData()

// Routes
app.use("/api", router);

app.use(ErrorController);

module.exports = app;
