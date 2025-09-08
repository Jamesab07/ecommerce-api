const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Coupon name required"],
      unique: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Coupon expiring date required"],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount value required"],
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
