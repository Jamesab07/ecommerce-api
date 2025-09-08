const Product = require("../models/productModel");
const catchAsync = require("../middleware/catchAsync");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const AppError = require("../utils/appError");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = Math.round(totalPrice * 100) / 100;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @route   POST /api/v1/cart
// @access  Private/Customer
exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  //1) Get Cart for logged in user
  let cart = await Cart.findOne({ user: req.user.id });

  //if no cart,create one
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    //product exist in cart..then update cart quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      cart.cartItems[productIndex].quantity += 1;
    } else {
      //product does not exist in cart,push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  //Calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product successfully added to cart",
    num_of_cart_items: cart.cartItems.length,
    cart,
  });
});

// @route   GET /api/v1/cart
// @access  Private/Customer
exports.getLoggedInUserCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(
      new AppError(`There isn no cart for this user id: ${req.user.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    num_of_cart_items: cart.cartItems.length,
    cart,
  });
});

// @route   DELETE /api/v1/cart/:itemId
// @access  Private/Customer
exports.removeSpecificCartItem = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    num_of_cart_items: cart.cartItems.length,
    cart,
  });
});

// @route   DELETE /api/v1/cart
// @access  Private/Customer
exports.clearCart = async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.id });

  res.status(204).json({
    success: true,
  });
};

// @route   PATCH /api/v1/cart/:itemId
// @access  Private/Customer
exports.updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError(`there is no cart for user ${req.user.id}`, 404));
  }

  const index = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (index < 0) {
    return next(
      new AppError(`there is no item for this id :${req.params.itemId}`, 404)
    );
  }

  cart.cartItems[index].quantity = quantity;

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    num_of_cart_items: cart.cartItems.length,
    cart,
  });
});

// @route   PATCH /api/v1/cart/applyCoupon
// @access  Private/Customer
exports.applyCoupon = catchAsync(async (req, res, next) => {
  //1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.boq.coupon,
    expiresAt: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new AppError("Coupon is invalid or expired", 400));
  }

  //2) Get logged user cart to get total cart price
  const cart = Cart.findOne({ user: req.user.id });

  const totalPrice = cart.totalCartPrice;

  //3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    num_of_cart_items: cart.cartItems.length,
    cart,
  });
});
