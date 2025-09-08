const express = require("express");
const {
  signUp,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  //updateMyPassword,
} = require("../controllers/authController");
const { verifyEmail } = require("../controllers/verifyEmailController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.post("/signUp", signUp);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.patch("/resetPassword", resetPassword);

router.use(protect);
//router.patch("/updateMyPassword", protect, updateMyPassword);

module.exports = router;
