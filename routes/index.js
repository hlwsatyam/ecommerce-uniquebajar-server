const app = require("express");
const multer = require("multer");
const uuid = require("uuid");
const {
  authenticateMiddleware,
  userAuthMobVerification,
} = require("../controllers/authrization");
const {
  helloWorld,
  login,
  sellerCreate,
  CustomerDetails,
  sellerlogin,
  CustomerAddress,
  CustomerProfileUpdate,
  CustomerNewAddressAdd,
  AddCommentOnProduct,
  ReviewOnProduct,
  WishlistDetails,
  WishlistUpdate,
  WishlistCheck,
  sellerVerifying,
  SubscribeNewsletter,
  customerOrderPlace,
  customerOrderList,
  CustomerOrderCancel,
  sellerOrderList,
} = require("../controllers/auth");
const {
  uploadProduct,
  productById,
  ProductBySearch,
  RandomLatestProduct,
  allSellerProduct,
  deleteSellerProduct,
  likeProduct,
} = require("../controllers/productControllers");
const path = require("path");
const router = app.Router();
// Set up storage for multer
const parentDirectory = path.resolve(__dirname, "..");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${parentDirectory}/uploads`);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuid.v4()}_${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const storageForProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${parentDirectory}/images`);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuid.v4()}_${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const uploadsForProfile = multer({ storage: storageForProfile });
const upload = multer({ storage: storage });
router.get("/", helloWorld);
router.get("/vereifying/seller/:token", sellerVerifying);
router.post("/login", login);
router.post("/sellerlogin", sellerlogin);
router.post("/seller/order/orderlist", sellerOrderList);
router.post(
  "/sellercreate",
  uploadsForProfile.fields([
    { name: "storeLogo", maxCount: 1 },
    { name: "shopImage", maxCount: 1 },
  ]),
  sellerCreate
);
router.post("/customerMob/verification", userAuthMobVerification);
router.post("/customer", CustomerDetails);
router.post("/customer/updateProfile", CustomerProfileUpdate);
router.post("/customer/whishlist", WishlistDetails);
router.post("/customer/order/orderplace", customerOrderPlace);
router.post("/customer/order/orderlist", customerOrderList);
router.post("/customer/order/ordercancel", CustomerOrderCancel);
router.post("/customer/whishlistupdate", WishlistUpdate);
router.post("/customer/whishlistCheck", WishlistCheck);
router.post("/customer/address", CustomerAddress);
router.post("/customer/addaddress", CustomerNewAddressAdd);
router.post("/product/addComment", AddCommentOnProduct);
router.post("/product/review", ReviewOnProduct);
router.post("/product/likeproduct", likeProduct);

// router.post("/product/review", ReviewOnProduct);

router.post("/newsletter/submit", SubscribeNewsletter);
router.post(
  "/uploadProduct",
  upload.array("images", 50),
  authenticateMiddleware,
  uploadProduct
);
router.post("/seller/allproduct", authenticateMiddleware, allSellerProduct);
router.post(
  "/seller/deleteproduct",
  authenticateMiddleware,
  deleteSellerProduct
);
router.get("/latestproduct", RandomLatestProduct);
router.get("/productBySearch/searchlist/q", ProductBySearch);
router.get("/data/singlef/:id", productById);
module.exports = router;
