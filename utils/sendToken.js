const user = require("../models/userModel");

const sendToken = (user, StatusCode, res) => {
  const token = user.createJWTtoken();

  res.status(StatusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

module.exports = sendToken;
