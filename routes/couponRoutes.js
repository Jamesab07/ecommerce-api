const express = require("express");
const {
  getCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  createCoupon,
} = require("../controllers/couponController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).patch(updateCoupon).delete(deleteCoupon);

module.exports = router;
