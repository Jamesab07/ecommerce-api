const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String },
      postalCode: { type: String },
    },

    shippingPrice: {
      type: Number,
    },
    totalOrderPrice: Number,
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover ",
  });

  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
