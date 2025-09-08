const express = require("express");
const {
  addProductToCart,
  removeSpecificCartItem,
  updateCartItemQuantity,
  clearCart,
  getLoggedInUserCart,
} = require("../controllers/cartController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("customer"));

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedInUserCart)
  .delete(clearCart);

router
  .route("/:itemId")
  .patch(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = router;
