const express = require("express");
const {
  updateBrand,
  uploadBrandImage,
  resizeImage,
  createBrand,
  deleteBrand,
  getBrand,
  getBrands,
} = require("../controllers/brandController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrand
  );

router
  .route("/:id")
  .get(getBrand)
  .patch(
    protect,
    restrictTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrand
  )

  .delete(protect, restrictTo("admin"), deleteBrand);

module.exports = router;
