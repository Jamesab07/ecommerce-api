const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Shipping = mongoose.model("Shipping", shippingSchema);
module.exports = Shipping;
