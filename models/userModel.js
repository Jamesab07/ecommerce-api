const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "please provide your name"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "please provide your email"],
    validate: [validator.isEmail, "please provide a valid email "],
  },
  role: {
    type: String,
    enum: ["admin", "customer", "manager"],
    default: "customer",
  },
  password: {
    type: String,
    trim: true,
    required: [true, "password required"],
    minlenght: 8,
    select: false,
    validate: [
      validator.isStrongPassword,
      "password must contain at least 8 characters,1 uppercase,1 lowercase,1 number and 1 symbol",
    ],
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profileImg: String,

  // child reference (one to many)
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  addresses: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      alias: String,
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
  ],

  passwordChangedAt: Date,
  passwordResetCode: String,
  passwordResetExpires: Date,
  passwordResetVerified: Boolean,
});

userSchema.pre("save", async function (next) {
  //runs if password was modified
  if (!this.isModified("password")) return next();

  //hash password
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  //runs if password was modified
  if (!this.isModified("password") || this.isNew) return next();

  //setting a date which the password was changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Sign JWT
userSchema.methods.createJWTtoken = function () {
  const user = this;
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

//instance method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  //matching or comparing req.body.password to the DB password

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //false means not changed
  return false;
};

userSchema.methods.createPasswordResetCode = function () {
  //Generating reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  this.passwordResetVerified = false;

  return resetCode;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
