const express = require("express");
const {
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  createFilterObj,
  createSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
} = require("../controllers/subCategoryController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    restrictTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);

router
  .route("/:id")
  .get(getSubCategory)
  .patch(protect, restrictTo("admin", "manager"), updateSubCategory)

  .delete(protect, restrictTo("admin"), deleteSubCategory);

module.exports = router;
