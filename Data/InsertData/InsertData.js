const { DBconnection } = require("../../config/db");
const Data = require("../Mutipledata.json");

const insertMultipleData = async () => {
  try {
    for (const product of Data) {
      const {
        product_brand,
        product_title,
        discount,
        real_price,
        discount_price,
        sold_by,
        feature_details,
        description,
        product_information,
        return_time,
      } = product;

      await DBconnection.query(
        `INSERT INTO dry_fruits (product_brand, product_title, discount, real_price, discount_price, sold_by, feature_details, description, product_information, return_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product_brand,
          product_title,
          discount,
          real_price,
          discount_price,
          sold_by,
          feature_details,
          description,
          product_information,
          return_time,
        ]
      );
    }

    console.log("Multiple data inserted successfully");
  } catch (error) {
    console.error("Error inserting multiple data:", error);
  }
};

module.exports = { insertMultipleData };
