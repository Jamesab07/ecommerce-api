const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Shipping = require("../models/shippingModel");
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/v1/orders/cartId
// @access  Protected/Customer
exports.createCashOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress } = req.body;

  //get cart with cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new AppError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // Get shipping config for the state
  const shippingState = await Shipping.findOne({
    state: shippingAddress.state,
  });
  if (!shippingState) {
    return next(
      new AppError(`No shipping available for ${shippingAddress.state}`, 404)
    );
  }

  //shipping price for the state
  let shippingPrice = shippingState.price;

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    shippingPrice,
    totalOrderPrice,
  });
  // 4) After creating order, decrement product quantity, increment product sold
  if (!order) {
    return next(new AppError(`There was an error in server`, 500));
  }

  const bulkOption = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOption, {});

  // 5) Clear cart depend on cartId
  await Cart.findByIdAndDelete(req.params.cartId);

  res.status(201).json({
    success: true,
    data: order,
  });
});

exports.filterOrderForLoggedUser = catchAsync(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// @route   POST /api/v1/orders
// @access  Protected/Customer-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @route   POST /api/v1/orders/:id
// @access  Protected/Customer-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @route   PATCH /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new AppError(
        `There is no such a order with this id: ${req.params.id}`,
        404
      )
    );
  }

  //update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

// @route   PATCH /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApoError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

// @route   GET /api/v1/orders/checkout-session/:cartId
// @access  Protected/Customer
exports.checkoutSession = async (req, res, next) => {
  const { shippingAddress } = req.body;
  //1)get cart with cardId

  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new AppError(`There is no cart with id ${req.params.cartId},404`)
    );
  }

  // 2)Get shipping config for the state
  const shippingState = await Shipping.findOne({
    state: shippingAddress.state,
  });
  if (!shippingState) {
    return next(
      new AppError(`No shipping available for ${shippingAddress.state},404`)
    );
  }

  //shipping price for the state
  let shippingPrice = shippingState.price;

  // 3) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice + shippingPrice;

  //4) Create stripe chechout session

  const session = await Stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "ngn",
          product_data: {
            name: "Order from My E-commerce Store",
            description: `Cart with ${cart.cartItems.length} items`,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({
    success: true,
    session,
  });
};

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  //Create order with default payment method of card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });
  //  After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc    This webhook will run when stripe payment is successfully paid
// @route   POST /webhook-checkout
// @access  Protected/Customer
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}
      req.body: ${req.body},
      sig: ${sig},
      STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET}
      `);
  }
  if (event.type === "checkout.session.completed") {
    //  Create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
