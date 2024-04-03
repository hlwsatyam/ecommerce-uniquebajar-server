const { ErrorCreate } = require("../createError/createError");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const {
  formatPhoneNumber,
} = require("../supportiveFunction/controllerSupport");
const { DBconnection } = require("../config/db");
const {
  verifyToken,
  verifyTokenWithouPromise,
  verifyTokenWithoutPromise,
} = require("../jsonWebToken/verifyToken");
const { sendVerificationEmail } = require("../supportiveFunctions/f1");

const helloWorld = async (req, res, next) => {
  try {
    res.status(200).send("Helo World!");
  } catch (error) {
    next(ErrorCreate(error.status, error.message));
  }
};
const sellerVerifying = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY); // replace 'your_secret_key' with your actual secret key

    // Extract seller_id from the decoded token
    const sellerId = decodedToken.seller_id;

    // Update the seller table to set is_verified to true
    await DBconnection.execute(
      "UPDATE seller SET is_verified = ? WHERE seller_id = ?",
      [true, sellerId]
    );

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    next(ErrorCreate(400, "Invalid or expired token"));
  }
};

const login = async (req, res, next) => {
  let { phone, name } = req.body;
  // Assuming formatPhoneNumber is correctly implemented
  phone = formatPhoneNumber(phone);
  try {
    // Check if the user with the given phone number exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM customer WHERE phone = ?",
      [phone]
    );
    console.log(existingUser);
    if (existingUser.length > 0) {
      console.log("ifff");
      // If the user exists, generate a token with their unique ID
      const token = jwt.sign(
        { id: existingUser[0].id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "99d",
        }
      );
      return res.status(200).json({ token });
    } else {
      console.log("else");
      // If the user doesn't exist, insert a new user with name and phone
      const result = await DBconnection.execute(
        "INSERT INTO customer (name, phone) VALUES (?, ?)",
        [name, phone]
      );

      const userId = result.insertId;

      // Generate a token for the newly created user
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "99d",
      });

      return res.status(200).json({ token });
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const sellerlogin = async (req, res, next) => {
  let { email, password } = req.body;
  console.log(email, password);
  try {
    // Check if the user with the given email and password exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE email = ? AND password = ?",
      [email, password]
    );

    if (existingUser.length > 0) {
      // If the user exists, generate a token with their unique ID
      const token = jwt.sign(
        { id: existingUser[0].seller_id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "99d",
        }
      );
      return res.status(200).json({ token });
    } else {
      // User not found
      return res.status(404).json({ error: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const CustomerDetails = async (req, res, next) => {
  let { token } = req.body;
  let customer_id;
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
      customer_id = decoded.id;
    }
  });

  try {
    // Check if the user with the given phone number exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM customer WHERE customer_id = ?",
      [customer_id]
    );

    if (existingUser.length > 0) {
      return res.status(200).send(existingUser[0]);
    } else {
      return next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const WishlistDetails = async (req, res, next) => {
  let { token } = req.body;
  let customer_id;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
      customer_id = decoded.id;
    }
  });

  console.log(customer_id);

  try {
    // Fetch wishlist details with associated product details
    let [wishlistDetails] = await DBconnection.query(
      "SELECT w.*, p.* FROM whishlist w INNER JOIN product p ON w.product_id = p.product_id WHERE w.customer_id = ?",
      [customer_id]
    );

    console.log(wishlistDetails);

    if (wishlistDetails.length > 0) {
      return res.status(200).send(wishlistDetails);
    } else {
      return res.status(200).send([]);
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const customerOrderPlace = async (req, res, next) => {
  try {
    const { productDetails, customerId, DeleveryAddress } = req.body;
    const allProductForOrder = JSON.parse(productDetails);
    console.log();
    const decoded = await verifyCustomerToken(customerId);
    const customer_id = decoded.id;

    const connection = await DBconnection.getConnection();

    try {
      await connection.beginTransaction();

      for (const product of allProductForOrder) {
        const currentDate = new Date();

        // Add 7 days to the current date
        const reachingTime = new Date(
          currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );

        console.log(reachingTime.toISOString());
        const query = `
          INSERT INTO customer_order 
          SET product_id=?,product_count=?, customer_id=?, address_id=?, reaching_time=?
        `;

        await connection.query(query, [
          product.id,
          product.count,
          customer_id,
          DeleveryAddress,
          reachingTime,
        ]);
      }

      await connection.commit();
      connection.release();
      return res.status(200).send("Order Processed!");
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error in customerOrderPlace:", error);
      next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error("Error in customerOrderPlace:", error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const customerOrderList = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    const decoded = await verifyCustomerToken(customerId);
    const customer_id = decoded.id;
    const connection = await DBconnection.getConnection();
    try {
      await connection.beginTransaction();
      const queryOrders = `SELECT * FROM customer_order WHERE customer_id=?`;
      const [ordersResult] = await connection.query(queryOrders, [customer_id]);

      // Fetch additional details for each order
      const ordersDetails = await Promise.all(
        ordersResult.map(async (order) => {
          const { product_id, address_id, customer_id } = order;

          // Fetch product details
          const queryProduct = `SELECT * FROM product WHERE product_id=?`;
          const [productResult] = await connection.query(queryProduct, [
            product_id,
          ]);
          const queryCustomer = `SELECT * FROM customer WHERE customer_id=?`;
          const [customerResult] = await connection.query(queryCustomer, [
            customer_id,
          ]);

          // Fetch address details
          const queryAddress = `SELECT * FROM address WHERE address_id=?`;
          const [addressResult] = await connection.query(queryAddress, [
            address_id,
          ]);

          return {
            order,
            product: productResult[0],
            address: addressResult[0],
            customer: customerResult[0],
          };
        })
      );

      console.log(ordersDetails);

      await connection.commit();
      connection.release();
      return res.status(200).json(ordersDetails);
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error in customerOrderPlace:", error);
      next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error("Error in customerOrderPlace:", error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const sellerOrderList = async (req, res, next) => {
  try {
    const { sellerToken } = req.body;
    const decoded = await verifyCustomerToken(sellerToken); // Assuming there is a verifySellerToken function
    const seller_id = decoded.id;

    const connection = await DBconnection.getConnection();
    try {
      await connection.beginTransaction();

      // Assuming there's a foreign key relationship between customer_order and product
      const queryOrders = `
        SELECT customer_order.*
        FROM customer_order
        JOIN product ON customer_order.product_id = product.product_id
        WHERE product.seller_id = ?`;

      const [ordersResult] = await connection.query(queryOrders, [seller_id]);

      // Fetch additional details for each order
      const ordersDetails = await Promise.all(
        ordersResult.map(async (order) => {
          const { product_id, address_id, customer_id } = order;
          // Fetch product details
          const queryProduct = `SELECT * FROM product WHERE product_id=?`;
          const [productResult] = await connection.query(queryProduct, [
            product_id,
          ]);
          const queryCustomer = `SELECT * FROM customer WHERE customer_id=?`;
          const [customerResult] = await connection.query(queryCustomer, [
            customer_id,
          ]);

          // Fetch address details
          const queryAddress = `SELECT * FROM address WHERE address_id=?`;
          const [addressResult] = await connection.query(queryAddress, [
            address_id,
          ]);

          return {
            order,
            product: productResult[0],
            address: addressResult[0],
            customer: customerResult[0],
          };
        })
      );
      await connection.commit();
      connection.release();
      return res.status(200).json(ordersDetails);
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error in sellerOrderList:", error);
      next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error("Error in sellerOrderList:", error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

async function fetchAdditionalDetails(orderId) {
  // Implement logic to fetch additional details based on the orderId
  // For example, fetch products, customer details, etc.
  // Return the additional details
}

const verifyCustomerToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        reject(ErrorCreate(401, "Invalid customer token"));
      } else {
        resolve(decoded);
      }
    });
  });
};
const WishlistCheck = async (req, res, next) => {
  try {
    const { token, productId } = req.body;
    let customer_id;

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(ErrorCreate(503, "Server Internal Error!"));
      } else {
        customer_id = decoded.id;
      }
    });

    console.log(customer_id);

    // Check if the user has the product in the wishlist
    const [existingWishlist] = await DBconnection.query(
      "SELECT * FROM whishlist WHERE customer_id = ? AND product_id = ?",
      [customer_id, productId]
    );

    console.log(existingWishlist);

    if (existingWishlist.length > 0) {
      return res.status(200).send({ isInWishlist: true });
    } else {
      next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const CustomerOrderCancel = async (req, res, next) => {
  try {
    const { token, order_id, reason } = req.body;

    let customer_id;
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(ErrorCreate(503, "Server Internal Error!"));
      } else {
        customer_id = decoded.id;
      }
    });

    console.log(customer_id);

    // Check if the user has the product in the wishlist
    const [updateResult] = await DBconnection.query(
      "UPDATE customer_order SET delivery_status=? , reason=? WHERE customer_id = ? AND order_id = ?",
      ["cancelled", reason, customer_id, order_id]
    );

    // Check if the update operation was successful
    if (updateResult.affectedRows > 0) {
      return res.status(200).send("Order cancelled successfully");
    } else {
      return res.status(404).send("Order not found or could not be cancelled");
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const WishlistUpdate = async (req, res, next) => {
  try {
    const { token, productId } = req.body;

    let customer_id;
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(ErrorCreate(503, "Server Internal Error!"));
      } else {
        customer_id = decoded.id;
      }
    });

    console.log(customer_id);

    const [existingWishlist] = await DBconnection.query(
      "SELECT * FROM whishlist WHERE product_id=? AND customer_id=?",
      [productId, customer_id]
    );

    console.log(existingWishlist);

    if (existingWishlist.length > 0) {
      await DBconnection.query(
        "DELETE FROM whishlist WHERE product_id=? AND customer_id=?",
        [productId, customer_id]
      );
      return res.status(200).send("whishlist item removed");
    } else {
      await DBconnection.query(
        "INSERT INTO whishlist SET product_id=?, customer_id=?",
        [productId, customer_id]
      );
      return res.status(200).send("whishlist item added");
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

module.exports = WishlistUpdate;

const CustomerProfileUpdate = async (req, res, next) => {
  let { token, latestUserData } = req.body;
  let customer_id;
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
      customer_id = decoded.id;
    }
  });
  console.log(latestUserData.dob);
  try {
    let [existingUser] = await DBconnection.query(
      "UPDATE customer SET email=?, first_name=?, last_name=?, dob=?, gender=? WHERE customer_id = ?",
      [
        latestUserData.email,
        latestUserData.first_name,
        latestUserData.last_name,
        latestUserData.dob,
        latestUserData.gender,
        customer_id,
      ]
    );
    console.log(existingUser);
    if (existingUser.affectedRows > 0) {
      // Assuming 'affectedRows' indicates how many rows were affected by the update
      return res.status(200).send("updated");
    } else {
      return next(ErrorCreate(503, "Server Internal Error!"));
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const CustomerNewAddressAdd = async (req, res, next) => {
  let { token, addressData } = req.body;
  let customer_id;
  console.log(token)
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
console.log(decoded)
      customer_id = decoded.id;
    }
  });

  try {
    let [result] = await DBconnection.query(
      "INSERT INTO address (pin_code, house_no, address, city, state, floor_no, building_name, tower_no, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        addressData.pin_code,
        addressData.house_no,
        addressData.address,
        addressData.city,
        addressData.state,
        addressData.floor_no,
        addressData.building_name,
        addressData.tower_no,
        customer_id,
      ]
    );

    console.log(result);

    return res.status(200).send("inserted");
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const AddCommentOnProduct = async (req, res, next) => {
  let { token, reviewData } = req.body;
  let customer_id;
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
      customer_id = decoded.id;
    }
  });
  console.log(customer_id, reviewData);

  try {
    let [result] = await DBconnection.query(
      "INSERT INTO review (customer_id, product_id, no_of_like,no_of_star, subject, description) VALUES (?, ?,?, ?, ?, ?)",
      [
        customer_id,
        reviewData.product_id,
        0,
        reviewData.star + 1,
        reviewData.subject,
        reviewData.description,
      ]
    );

    console.log(result);

    return res.status(200).send("inserted");
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const ReviewOnProduct = async (req, res, next) => {
  let { product_no } = req.body;
  try {
    let [result] = await DBconnection.query(
      "SELECT r.*, CONCAT(c.first_name, ' ', c.last_name) AS customer_name FROM review r INNER JOIN customer c ON r.customer_id = c.customer_id WHERE r.product_id = ?",
      [product_no]
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};
const SubscribeNewsletter = async (req, res, next) => {
  let { email } = req.body;
  try {
    let [result] = await DBconnection.query(
      "INSERT INTO subscribed_newletter SET email = ?",
      [email]
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const CustomerAddress = async (req, res, next) => {
  let { token } = req.body;
  let customer_id;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(ErrorCreate(503, "Server Internal Error!"));
    } else {
      customer_id = decoded.id;
    }
  });

  try {
    let [existingAddress] = await DBconnection.query(
      "SELECT * FROM address WHERE customer_id = ?",
      [customer_id]
    );

    console.log(existingAddress);

    return res.status(200).send(existingAddress);
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const sellerCreate = async (req, res, next) => {
  try {
    const {
      email,
      companyName,
      yourName,
      password,
      confirmPassword,
      contactNumber,
      address,
      cin,
      storeName,
      storeDescription,
    } = req.body;
    console.log(email);
    // Check if the seller already exists
    const [existingUser] = await DBconnection.query(
      "SELECT * FROM seller WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    // Check if the passwords match
    if (password !== confirmPassword) {
      return next(ErrorCreate(403, "Passwords do not match"));
    }

    // Get filenames from file uploads or set to null if not provided
    const shopImageFilename = req.files?.["shopImage"]?.[0]?.filename || "";
    const storeLogoFilename = req.files?.["storeLogo"]?.[0]?.filename || "";

    // Insert seller data into the database
    const [insertResult] = await DBconnection.execute(
      `INSERT INTO seller (seller_name, email, password, seller_contact, compony_name, 
        address, cin, shop_img, store_name, store_description, store_logo) ` +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        yourName,
        email,
        password,
        contactNumber,
        companyName,
        address,
        cin,
        shopImageFilename,
        storeName,
        storeDescription,
        storeLogoFilename,
      ]
    );

    const sellerId = insertResult.insertId;
    const sellerToken = jwt.sign(
      { seller_id: sellerId },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1y",
      }
    );
    // try {
    //   await sendVerificationEmail(email, sellerToken);
    // } catch (error) {
    //   await DBconnection.execute(`remove seller where email =?`, [email]);
    //   next(ErrorCreate(503, "Something Went Worng!"));
    // }

    // res.status(200).json({
    //   message: "Seller created successfully",
    //   sellerId,
    // });
    try {
      await sendVerificationEmail(email, sellerToken);
      res.status(200).json({
        message: "Seller created successfully",
        sellerId,
      });
    } catch (error) {
      // If there is an error sending the email, remove the seller from the database
      await DBconnection.execute(`DELETE FROM seller WHERE email = ?`, [email]);
      console.error("Error sending verification email:", error);
      res.status(503).json({
        message: "Failed to send verification email",
        error: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

module.exports = {
  CustomerProfileUpdate,
  CustomerDetails,
  helloWorld,
  CustomerAddress,
  login,
  AddCommentOnProduct,
  sellerCreate,
  CustomerNewAddressAdd,
  ReviewOnProduct,
  WishlistDetails,
  WishlistUpdate,
  WishlistCheck,
  sellerVerifying,
  sellerlogin,
  SubscribeNewsletter,
  customerOrderPlace,
  customerOrderList,
  CustomerOrderCancel,
  sellerOrderList,
};
