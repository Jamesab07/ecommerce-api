const factory = require("./handlerFactory");
const Coupon = require("../models/couponModel");

// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @route   PATCH /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
