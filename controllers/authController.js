const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { promisify } = require("util");

// @route   GET /api/v1/auth/signup
// @access  Public
exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  //check if user exist
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("user already exist..please log in", 409));
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const token = jwt.sign(
    {
      id: newUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30m",
    }
  );

  //Create verify Url
  const verifyUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify-email?token=${token}`;

  const message = `Click this link to verify your email: \n ${verifyUrl}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "email verification token",
      message,
    });
    return res.status(200).json({
      success: true,
      message: "User registered..please verify your email",
    });
  } catch (err) {
    console.log(err);
    return next(new AppError("Email could not be sent", 500));
  }
});

// @route   GET /api/v1/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("please provide an email and password", 400));
    }
    //Find the user from DB
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Incorrect email or password", 401));
    }

    //Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return next(
        new AppError(
          "This action has been blocked, please try again later..",
          429
        )
      );
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
    }

    const isMatch = await user.comparePassword(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 10) {
        //10mins
        user.lockUntil = Date.now() + 10 * 60 * 1000;
      }

      await user.save({ validateBeforeSave: false });
      console.log(user.failedLoginAttempts);
      console.log(user.lockUntil);

      return next(new AppError("Incorrect email or password", 401));
    }
    if (!user.isVerified) {
      // Generate new token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30m",
      });

      // Create verify URL
      const verifyUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email?token=${token}`;

      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        verifyUrl, // so that frontend can redirect
      });
    }
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    return sendToken(user, 200, res);
  } catch (err) {
    return next(
      new AppError("something went wrong..please try again later", 500)
    );
  }
});

// @desc   making sure the user is logged in
exports.protect = async (req, res, next) => {
  //Getting token and checking if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in..please log in to gain access", 401)
    );
  }

  try {
    //verifying the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Check if user still exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exist", 401)
      );
    }

    //Check if user recently changed their password
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password,Please log in again.", 401)
      );
    }

    //Grant Acess
    req.user = currentUser;

    next();
  } catch (err) {
    return next(new AppError("token verification fails", 401));
  }
};

// @desc    Authorization (User Permissions)
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles is admin,customer.....default is user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `The role ${req.user.role} is not authorized to perform this action`,
          403
        )
      );
    }
    next();
  };

// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Find user with the email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with such email", 404));
  }

  //if user exist,Generate random hash 6 digits and save
  const resetCode = user.createPasswordResetCode();
  await user.save({ validateBeforeSave: false });

  //send reset code via email

  const message = `Hi ${user.name},\n\n\We received a request to reset the password on your E-shop Account.\n\n${resetCode}\n\nEnter this code to complete this process.\nThanks for helping us keep your account safe and secure.\n\nThe E-shop Team.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
    return res.status(200).json({
      success: true,
      message: "Reset code sent to email",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email..Try again later", 500)
    );
  }
});

// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = catchAsync(async (req, res, next) => {
  //Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Reset code invalid or expired", 400));
  }

  (user.passwordResetVerified = true), await user.save();

  res.status(200).json({
    success: true,
  });
});

// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with email ${req.body.email} `, 404)
    );
  }

  //check if the reset code is verified
  if (!user.passwordResetVerified) {
    return next(new AppError("Reset code not verified", 400));
  }
  user.password = req.body.password;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now log in",
  });
});
