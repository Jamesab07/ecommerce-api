const express = require("express");
const {
  createCashOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  filterOrderForLoggedUser,
  findAllOrders,
  checkoutSession,
  findSpecificOrder,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/:cartId").post(restrictTo("customer"), createCashOrder);

router.get(
  "/checkout-session/:cartId",
  restrictTo("customer"),
  checkoutSession
);
router.get(
  "/",
  restrictTo("customer", "admin", "manager"),
  filterOrderForLoggedUser,
  findAllOrders
);
router.patch("/:id/pay", restrictTo("admin", "manager"), updateOrderToPaid);
router.patch(
  "/:id/deliver",
  restrictTo("admin", "manager"),
  updateOrderToDelivered
);

module.exports = router;
