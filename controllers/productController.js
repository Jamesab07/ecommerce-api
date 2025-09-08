const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const catchAsync = require("../middleware/catchAsync");
const sharp = require("sharp");
const { uploadMixOfImages } = require("../middleware/uploadImages");
const { v4: uuidv4 } = require("uuid");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  //1 Image processing for image cover

  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, "Products");

// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, "reviews");

// @route   PATCH  /api/v1/products
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product);

// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);
