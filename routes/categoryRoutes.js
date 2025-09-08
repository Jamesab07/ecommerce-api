const express = require("express");
const {
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createCategory,
  resizeImage,
} = require("../controllers/categoryController");

const {
  uploadCategoryImageMiddleware,
} = require("../middleware/uploadCategoryImageHelper");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(protect, getCategories)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadCategoryImageMiddleware,
    resizeImage,
    createCategory
  );

router
  .route("/:id")
  .get(getCategory)
  .patch(
    protect,
    restrictTo("admin", "manager"),
    uploadCategoryImageMiddleware,
    resizeImage,
    updateCategory
  )

  .delete(protect, restrictTo("admin"), deleteCategory);

module.exports = router;
