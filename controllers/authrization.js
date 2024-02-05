const { DBconnection } = require("../config/db");
const { verifyToken } = require("../jsonWebToken/verifyToken");
const jwt = require("jsonwebtoken");
const authenticateMiddleware = async (req, res, next) => {
  const token = req.body.token;
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
const userAuthMobVerification = async (req, res, next) => {
  const token = req.body.token;
  const api_key = "YZQmyIlOK5WC3YsnDVVeYJaFL0a7KyQ3";
  let jwt_response;
  let jwt_phone;
  try {
    const decoded = jwt.verify(token, api_key, { algorithm: "HS256" });
    jwt_response = 1;
    jwt_phone = decoded.country_code + decoded.phone_no;
  } catch (error) {
    jwt_response = 0;
    jwt_phone = "";
  }
  if (jwt_response == 1) {
    // Check if the user with the given phone number exists
    let [existingUser] = await DBconnection.query(
      "SELECT * FROM customer WHERE phone_number = ?",
      [jwt_phone]
    );
    console.log(existingUser);
    if (existingUser.length > 0) {
      console.log("ifffffff");
      // If the user exists, generate a token with their unique ID
      const customerToken = jwt.sign(
        { id: existingUser[0].customer_id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "99d",
        }
      );
      return res.status(200).json({ customerToken });
    } else {
      console.log("else");
      // If the user doesn't exist, insert a new user with name and phone
      const result = await DBconnection.execute(
        "INSERT INTO customer (phone_number,email) VALUES (?, ?)",
        [jwt_phone, `${jwt_phone}@uniquebajar.com`]
      );

      const userId = result.customer_id;

      // Generate a token for the newly created user
      const customerToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "99d",
        }
      );

      return res.status(200).json({ customerToken });
    }
  } else {
    return res.status(503).json({ message: "Something went wrong" });
  }
};

module.exports = { authenticateMiddleware, userAuthMobVerification };
