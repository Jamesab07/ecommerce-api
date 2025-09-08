const User = require("../models/userModel");
const catchAsync = require("../middleware/catchAsync");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middleware/uploadImages");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/sendToken");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${req.file.filename}`);

    // Save image into our db
  }

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// @route   GET /api/v1/users/get-me
// @access  Private/Protect
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  next();
});

// @route   PUT /api/v1/users/update-my-password
// @access  Private/Protect
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  //Check for current password of logged in user
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Invalid password", 401));
  }

  //if so,update the password
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// @route   GET /api/v1/users/update-me
// @access  Private/Protect
exports.updateLoggedInUserData = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password update.Please use /update-my-password",
        400
      )
    );
  }

  //2filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "profileImg",
    "slug"
  );
  if (req.file) filteredBody.profileImg = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @route   DELETE /api/v1/users/change-password/:id
// @access  Private/Admin
exports.changeUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new AppError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ user });
});

// @route   DELETE /api/v1/users/delete-me
// @access  Private/Protect
exports.deleteLoggedInUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    success: true,
    data: null,
  });
});

// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = catchAsync(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    role: req.body.role,
  };
  if (req.file) {
    updateData.profileImg = req.file.filename;
  }
  const document = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!document) {
    return next(new AppError(`No document for this id ${req.params.id}`, 404));
  }
  await document.save();
  res.status(200).json({
    success: true,
    data: document,
  });
});

// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = factory.getAll(User);

// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = factory.createOne(User);

// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);
