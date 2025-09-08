const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/appError");
const { default: bcrypt } = require("bcryptjs");

exports.verifyEmail = catchAsync(async (req, res, next) => {
  try {
    //getting the token from query
    const { token } = req.query;
    if (!token) {
      return next(new AppError("Missing token", 400));
    }

    //verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("invalid token", 400));
    }

    if (user.isVerified) {
      return next(new AppError("Email already verified", 400));
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email successfully verified, You can now log in",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification link expired" });
    }
    next(err);
  }
});
