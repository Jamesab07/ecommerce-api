const AppError = require("../utils/appError");

const handleJwtInvalidSignature = () =>
  new AppError("Invalid token, please login again..", 401);

const handleJwtExpired = () =>
  new AppError("Expired token, please login again..", 401);
const handleDuplicateValue = () => {
  new AppError(`Duplicate value : ${value}.. please enter another value`);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    if (err.code === 11000) err = handleDuplicateValue();
    if (err.name === "ValidationError") err = handleValidationErrorDB();
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR ", err);
  // 2) Send generic message
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

module.exports = globalError;
