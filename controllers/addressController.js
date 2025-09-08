const catchAsync = require("../middleware/catchAsync");

const User = require("../models/userModel");

// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = catchAsync(async (req, res, next) => {
  // $addToSet => add address object to user addresses  array if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully.",
    addresses: user.addresses,
  });
});

// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = catchAsync(async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    addresses: user.addresses,
  });
});

// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    addresses: user.addresses,
  });
});
