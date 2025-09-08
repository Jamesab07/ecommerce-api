const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { webhookCheckout } = require("./controllers/orderController");

const AppError = require("./utils/appError");

const authRoute = require("./routes/authRoutes");
const usersRoute = require("./routes/usersRoutes");
const productsRoute = require("./routes/productsRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const categoryRoute = require("./routes/categoryRoutes");
const subCategoryRoute = require("./routes/SubCategoryRoutes");
const cartRoute = require("./routes/cartRoutes");
const couponRoute = require("./routes/couponRoutes");
const orderRoute = require("./routes/orderRoutes");
const brandRoute = require("./routes/brandRoutes");
const wishlistRoute = require("./routes/wishlistRoutes");
const addressRoute = require("./routes/addressRoutes");

const globalErrorHandler = require("./middleware/error");

//start express application
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: "Too many request from this IP, please try again after 30 minutes!.",
});

app.use("/api", limiter);

// Checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/products", productsRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/address", addressRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
