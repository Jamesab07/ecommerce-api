const express = require("express");
const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require("../controllers/reviewController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
router.use(protect);

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(restrictTo("customer"), setProductIdAndUserIdToBody, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("customer"), updateReview)
  .delete(restrictTo("customer", "admin", "manager"), deleteReview);

// router.get("/", getReviews);
// router.post("/", createReview);
// router.get("/:id", getReview);
// router.patch("/:id", updateReview);

module.exports = router;
