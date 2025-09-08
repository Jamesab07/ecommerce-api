const express = require("express");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controllers/wishlistController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("customer"));

router.route("/").post(addProductToWishlist).get(getLoggedUserWishlist);

router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
