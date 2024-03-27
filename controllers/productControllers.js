const { DBconnection } = require("../config/db");
const path = require("path");
const {
  discountCalculatePercentage,
} = require("../supportiveFunction/controllerSupport");
const { ErrorCreate } = require("../createError/createError");
const uploadProduct = async (req, res, next) => {
  const seller_id = req.user.id;
  console.log(seller_id);
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
    discount,
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
    // Create a folder named 'images' within the root directory
    const uploadFolder = path.join(__dirname, "../uploads/");

    // Store image URLs as relative paths within the 'images' folder
    let imageUrls = images.map((item) => item.filename);
    discount = discountCalculatePercentage(real_price, discount_price);
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

const productById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [productResult] = await DBconnection.execute(
      `SELECT * FROM product WHERE product_id = ?`,
      [id]
    );

    if (productResult.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResult[0];
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
  }
};

const ProductBySearch = async (req, res, next) => {
  try {
    const {
      query: searchableText,
      page = 1,
      category,
      pageSize = 10,
      minPrice,
      maxPrice,
      sortBy = "discount_price",
      sortOrder,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";
    const sortColumn = sortBy === "price" ? "real_price" : sortBy;

    const searchValue = `%${searchableText.toLowerCase()}%`;
    const priceOrder =
      sortOrder === "" ? "" : `ORDER BY ${sortColumn} ${orderDirection}`;

    let searchCondition;
    if (category !== "undefined") {
      searchCondition = `category_name = ?`;
    } else {
      searchCondition = `LOWER(product_title) LIKE ?`;
    }

    // Construct the search query
    const searchQuery = ` 
      SELECT * FROM product
      WHERE ${searchCondition}  ${getPriceFilterClause(minPrice, maxPrice)} 
     ${priceOrder}
      LIMIT ?, ?;
    `;

    // Execute the search query
    const [productsResult] = await DBconnection.execute(searchQuery, [
      category !== "undefined" ? category : searchValue,
      offset,
      limit,
    ]);

    const totalItems = productsResult.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    res.status(200).send(productsResult);
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Internal Server Error" });
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
  const { category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;

  try {
    // Use parameterized query to prevent SQL injection
    let totalProductsQuery = `
      SELECT COUNT(*) as total FROM product WHERE category_name = ?;
    `;
    const [totalProductsResult] = await DBconnection.execute(
      totalProductsQuery,
      [category]
    );
    const totalProducts = totalProductsResult[0].total;

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

module.exports = {
  uploadProduct,
  productById,
  ProductBySearch,
  RandomLatestProduct,
  allSellerProduct,
  deleteSellerProduct,
  likeProduct,
};
