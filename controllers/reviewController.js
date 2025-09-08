const factory = require("./handlerFactory");
const Review = require("../models/reviewModel");

// Nested route (Create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @route   POST  /api/v1/reviews
// @access  Private/Protect/Customer
exports.createReview = factory.createOne(Review);

// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);
