const catchAsync = require("../middleware/catchAsync");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middleware/uploadImages");

const Brand = require("../models/brandModel");
const factory = require("../controllers/handlerFactory");

//upload single image
exports.uploadBrandImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = catchAsync(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into our db
  req.body.image = filename;

  next();
});
/// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @route   GET /api/v1/brands
// @access  Public

exports.getBrands = factory.getAll(Brand);

// @route   PATCH  /api/v1/brands
// @access  Private
exports.updateBrand = factory.updateOne(Brand);

// @route   POST  /api/v1/brands
// @access  Private
exports.createBrand = factory.createOne(Brand);

// @route   DELETE  /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
