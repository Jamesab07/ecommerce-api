const catchAsync = require("../middleware/catchAsync");
const User = require("../models/userModel");

// @route   POST /api/v1/wishlist
// @access  Protected/Customer
exports.addProductToWishlist = catchAsync(async (req, res, next) => {
  // using $addToSet to add productId to wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.body.productId } },
    { new: true }
  );
  console.log(req.body.productId);
  res.status(200).json({
    success: true,
    message: "Product successfully added to wishlist",
    wishlist: user.wishlist,
  });
});

// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/Customer
exports.removeProductFromWishlist = async (req, res, next) => {
  // using $pull to remove productId from wishlist array it exist
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Product successfully removed from your wishlist",
    data: user.wishlist,
  });
};

// @route   GET /api/v1/wishlist
// @access  Protected/Customer
exports.getLoggedUserWishlist = async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("wishlist");

  res.status(200).json({
    success: true,
    results: user.wishlist.length,
    wishlist: user.wishlist,
  });
};
