const express = require("express");
const {
  getProducts,
  getProduct,
  updateProduct,
  createProduct,
  deleteProduct,
  resizeProductImages,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../controllers/authController");
const reviewRoutes = require("../routes/reviewRoutes");
const {
  uploadProductImagesMiddleware,
} = require("../middleware/uploadImagesHelper");

const router = express.Router();

// POST   /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews/87487sfww3
router.use("/:productId/reviews", reviewRoutes);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadProductImagesMiddleware,
    resizeProductImages,
    createProduct
  );

router
  .route("/:id")
  .get(getProduct)
  .patch(
    protect,
    restrictTo("admin", "manager"),
    uploadProductImagesMiddleware,
    resizeProductImages,
    updateProduct
  )
  .delete(protect, restrictTo("admin"), deleteProduct);

module.exports = router;
