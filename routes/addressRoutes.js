const express = require("express");
const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../controllers/addressController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("customer"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
