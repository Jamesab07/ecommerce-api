const AppError = require("../utils/appError");
const { uploadCategoryImage } = require("../controllers/categoryController");
const multer = require("multer");

// wrapper to catch Multer errors

exports.uploadCategoryImageMiddleware = (req, res, next) => {
  uploadCategoryImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new AppError(" You must upload not more than 1 image", 400)
        );
      }
    } else if (err) {
      return next(new AppError("File upload error", 400));
    }
    next();
  });
};
