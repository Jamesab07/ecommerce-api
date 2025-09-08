const express = require("express");
const {
  getUser,
  getAllUsers,
  getMe,
  deleteUser,
  updateLoggedInUserData,
  updateMyPassword,
  createUser,
  updateUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  deleteLoggedInUser,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.get("/get-me", getMe, getUser);
router.patch("/update-my-password", updateMyPassword);
router.patch(
  "/update-me",
  uploadUserImage,
  resizeImage,
  updateLoggedInUserData
);
router.delete("/delete-me", deleteLoggedInUser);

router.use(restrictTo("admin", "manager"));

router.patch("/change-password/:id", changeUserPassword);

router
  .route("/")
  .get(getAllUsers)
  .post(uploadUserImage, resizeImage, createUser);
router
  .route("/:id")
  .get(getUser)
  .patch(uploadUserImage, resizeImage, updateUser)
  .delete(deleteUser);

module.exports = router;
