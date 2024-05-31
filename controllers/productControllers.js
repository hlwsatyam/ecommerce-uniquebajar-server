const { DBconnection } = require("../config/db");
const path = require("path");
const {
  discountCalculatePercentage,
} = require("../supportiveFunction/controllerSupport");
const { ErrorCreate } = require("../createError/createError");
const {
  isValidGmail,
  sendForgetedPassword,
} = require("../supportiveFunctions/f1");
const { verifyToken } = require("../jsonWebToken/verifyToken");
const {
  validationForProductUpload,
} = require("../supportiveFunctions/validationForProductUpload");
const uploadProduct = async (req, res, next) => {
  const seller_id = req.user.id;
  try {
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE seller_id = ?",
      [seller_id]
    );
    if (existingUser.length <= 0) {
      return res.status(404).json({ message: "Seller Not Found!" });
    }
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
  let {
    product_brand,
    category,
    product_title,
    real_price,
    discount_price,
    subcategory,
    feature_details,
    description,
    product_informations,
    return_time,
  } = req.body;

  const images = req.files ? req.files : [];
  try {
    const { message, status } = validationForProductUpload(
      product_brand,
      category,
      product_title,
      real_price,
      discount_price,
      subcategory,
      feature_details,
      description,
      product_informations,
      return_time,
      images
    );
    if (status != 200) {
      return res.status(status).json({ message });
    }

    // Create a folder named 'images' within the root directory
    const uploadFolder = path.join(__dirname, "../uploads/");
    // Store image URLs as relative paths within the 'images' folder
    let imageUrls = images.map((item) => item.filename);
    let discount = discountCalculatePercentage(real_price, discount_price);

    const [sellerDetails] = await DBconnection.execute(
      `SELECT * FROM seller WHERE seller_id=?`,
      [seller_id]
    );
    // Insert product data into the products table
    const [productResult] = await DBconnection.execute(
      `INSERT INTO product (product_brand, product_title,category_name,subcategory_name, discount, real_price, discount_price, 
        sold_by, feature_details, description, product_informations, return_time, seller_id, 
        image_urls) ` + "VALUES (?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        product_brand,
        product_title,
        category,
        subcategory,
        discount,
        real_price,
        discount_price,
        sellerDetails[0].compony_name,
        feature_details,
        description,
        product_informations,
        return_time,
        seller_id,
        JSON.stringify(imageUrls),
      ]
    );

    const productId = productResult.product_id;

    res.status(200).json({
      message: "Product uploaded successfully",
      productId,
    });
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
  }
};
const updateProduct = async (req, res, next) => {
  const seller_id = req.user.id;
   
  try {
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE seller_id = ?",
      [seller_id]
    );
    if (existingUser.length <= 0) {
      return res.status(203).json({ message: "Seller Not Found!" });
    }
  } catch (error) {
    return res.status(203).json({ message: "Seller Not Found!" });
  }
  let {
    product_brand,
    category,
    product_title,
    real_price,
    discount_price,
    subcategory,
    feature_details,
    description,
    product_informations,
    return_time,
  } = req.body;

  const images = req.files ? req.files : [];
  try {
    const { message, status } = validationForProductUpload(
      product_brand,
      category,
      product_title,
      real_price,
      discount_price,
      subcategory,
      feature_details,
      description,
      product_informations,
      return_time,
      images
    );
    if (status != 200) {
      return res.status(status).json({ message });
    }

    // Create a folder named 'images' within the root directory
    const uploadFolder = path.join(__dirname, "../uploads/");
    // Store image URLs as relative paths within the 'images' folder
    let imageUrls = images.map((item) => item.filename);
    let discount = discountCalculatePercentage(real_price, discount_price);

    const [sellerDetails] = await DBconnection.execute(
      `SELECT * FROM seller WHERE seller_id=?`,
      [seller_id]
    );
    // Insert product data into the products table
    const [productResult] = await DBconnection.execute(
      `UPDATE INTO product (product_brand, product_title,category_name,subcategory_name, discount, real_price, discount_price, 
        sold_by, feature_details, description, product_informations, return_time, seller_id, 
        image_urls) WHERE seller` + "VALUES (?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        product_brand,
        product_title,
        category,
        subcategory,
        discount,
        real_price,
        discount_price,
        sellerDetails[0].compony_name,
        feature_details,
        description,
        product_informations,
        return_time,
        JSON.stringify(imageUrls),
        seller_id,
      ]
    );

    const productId = productResult.product_id;
    res.status(200).json({
      message: "Product updated successfully",
      productId,
    });
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
  }
};
const allSellerProduct = async (req, res, next) => {
  const seller_id = req.user.id;
  try {
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE seller_id = ?",
      [seller_id]
    );
    if (existingUser.length <= 0) {
      return res.status(404).json({ message: "Seller Not Found!" });
    }
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }

  try {
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM product WHERE seller_id = ?",
      [seller_id]
    );
    return res.status(200).send(existingUser);
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
};
const deleteSellerProduct = async (req, res, next) => {
  const seller_id = req.user.id;
  const product_id = req.body.product_id;

  try {
    // Check if the seller exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE seller_id = ?",
      [seller_id]
    );

    if (existingUser.length <= 0) {
      return res.status(404).json({ message: "Seller Not Found!" });
    }

    // Check if the product exists
    let [existingProduct] = await DBconnection.query(
      "SELECT * FROM product WHERE product_id = ? AND seller_id = ?",
      [product_id, seller_id]
    );

    if (existingProduct.length <= 0) {
      return res.status(404).json({ message: "Product Not Found!" });
    }

    // Delete the product
    await DBconnection.query("DELETE FROM product WHERE product_id = ?", [
      product_id,
    ]);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
};
const likeProduct = async (req, res, next) => {
  const seller_id = req.user.id;
  const product_id = req.body.product_id;

  try {
    // Check if the seller exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE seller_id = ?",
      [seller_id]
    );

    if (existingUser.length <= 0) {
      return res.status(404).json({ message: "Seller Not Found!" });
    }

    // Check if the product exists
    let [existingProduct] = await DBconnection.query(
      "SELECT * FROM product WHERE product_id = ? AND seller_id = ?",
      [product_id, seller_id]
    );

    if (existingProduct.length <= 0) {
      return res.status(404).json({ message: "Product Not Found!" });
    }

    // Delete the product
    await DBconnection.query("DELETE FROM product WHERE product_id = ?", [
      product_id,
    ]);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
};
const sellerforgotpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!isValidGmail(email))
      return res.status(203).json({ message: "Invalid email address" });
    const [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      await sendForgetedPassword(email, existingUser[0]?.password);
      return res
        .status(200)
        .json({ message: "We Send You a Password On Registred Email" });
    } else {
      return res.status(203).json({ message: "Invalid email address" });
    }
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
};
const productById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [productResult] = await DBconnection.execute(
      `SELECT * FROM product WHERE product_id = ?`,
      [id]
    );
    if (productResult.length === 0) {
      return res.status(203).json({ message: "Product not found" });
    }
    const product = productResult[0];
    res.status(200).send(product);
  } catch (error) {
    return res.status(203).json({ message: "Something Went Wrong!" });
  }
};
const ProductBySearch = async (req, res, next) => {
  try {
    const {
      query: searchableText,
      page = 1,
      category,
      pageSize,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";
    const sortColumn = sortBy === "discount_price" ? "discount_price" : sortBy;

    const priceOrder =
      sortOrder === "" ? "" : `ORDER BY ${sortColumn} ${orderDirection}`;
    let searchCondition;
    if (category !== "undefined") {
      searchCondition = `category_name = ?`;
    } else {
      searchCondition = `product_title = ?`;
    }
    // Construct the search query
    const searchQuery = `
      SELECT * FROM product
      WHERE ${searchCondition}${getPriceFilterClause(minPrice, maxPrice)}
     ${priceOrder}
      LIMIT ?, ?; 
    `;
    // Execute the search query
    // const [productsResult] = await DBconnection.execute(searchQuery, [
    //   searchableText,
    //   offset,
    //   limit,
    // ]);
    let query = `SELECT * FROM product
    WHERE product_title LIKE CONCAT('%', ?, '%')
    AND discount_price BETWEEN 100 AND 1000
    LIMIT ?`;
    if (sortOrder) {
      const orderStatus = (query = `SELECT * FROM product
      WHERE product_title LIKE CONCAT('%', ?, '%')
      AND discount_price BETWEEN 100 AND 1000
      ORDER BY discount_price ${sortOrder.toUpperCase()}
      LIMIT ?`);
    }
    // Execute the search query
    const [productsResult] = await DBconnection.execute(query, [
      searchableText,
      pageSize,
    ]);
    res.status(200).send(productsResult);
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Something Went Wrong!" });
  }
};
const getPriceFilterClause = (minPrice, maxPrice) => {
  let filterClause = "";
  if (minPrice && maxPrice) {
    filterClause = ` AND discount_price BETWEEN ${minPrice} AND ${maxPrice}`;
  } else if (minPrice) {
    filterClause = ` AND discount_price >= ${minPrice}`;
  } else if (maxPrice) {
    filterClause = ` AND discount_price <= ${maxPrice}`;
  }
  return filterClause;
};
const RandomLatestProduct = async (req, res, next) => {
  const { category, sub_category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;

  try {
    let totalProductsQuery;
    let totalProducts;

    if (sub_category) {
      console.log(sub_category);
      totalProductsQuery = `SELECT COUNT(*) as total FROM product WHERE subcategory_name = ?;`;
      const [totalProductsResult] = await DBconnection.execute(
        totalProductsQuery,
        [sub_category]
      );
      totalProducts = totalProductsResult[0].total;
    }

    if (category) {
      totalProductsQuery = `SELECT COUNT(*) as total FROM product WHERE category_name = ?;`;
      const [totalProductsResult] = await DBconnection.execute(
        totalProductsQuery,
        [category]
      );
      totalProducts = totalProductsResult[0].total;
    }
    const offset = (page - 1) * pageSize;
    const maxOffset = Math.max(totalProducts - pageSize, 0);
    const randomOffset = Math.floor(Math.random() * (maxOffset + 1));
    const query = ` 
      SELECT * FROM product
      WHERE category_name = ?
      ORDER BY product_id DESC
      LIMIT ${pageSize}
      OFFSET ${randomOffset};
    `;

    const [productResult] = await DBconnection.execute(query, [category]);

    if (productResult.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }

    const products = productResult;
    res.status(200).send(products);
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
  }
};
const removeAnything = async (req, res, next) => {
  try {
    // Drop all foreign key constraints
    const { token } = req.query;
    const decoded = await verifyToken(token);

    const [result] = await DBconnection.execute(
      "DELETE FROM customer WHERE customer_id = ?",
      [decoded.id]
    );
    if (result.affectedRows === 0) {
      return res.status(203).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  uploadProduct,
  productById,
  ProductBySearch,
  RandomLatestProduct,
  updateProduct,
  removeAnything,
  allSellerProduct,
  sellerforgotpassword,
  deleteSellerProduct,
  likeProduct,
};
