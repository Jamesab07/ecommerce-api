const catchAsync = require("../middleware/catchAsync");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middleware/uploadImages");
const factory = require("./handlerFactory");
const Category = require("../models/categoryModel");

// Upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = catchAsync(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/category/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

/// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

/// @route   GET /api/v1/categories/
// @access  Public
exports.getCategories = factory.getAll(Category);

// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @route   PATCH  /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @route   DELETE  /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
