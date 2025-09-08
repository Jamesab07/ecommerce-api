const AppError = require("../utils/appError");
const { uploadProductImages } = require("../controllers/productController");
const multer = require("multer");

// wrapper to catch Multer errors

exports.uploadProductImagesMiddleware = (req, res, next) => {
  uploadProductImages(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new AppError(
            " You must upload 1 imageCover and between 1-5 images only",
            400
          )
        );
      }
    } else if (err) {
      return next(new AppError("File upload error", 400));
    }
    next();
  });
};
