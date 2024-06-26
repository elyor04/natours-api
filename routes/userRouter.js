const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.get("/getMe", authController.protect, userController.getMe);
router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(
    authController.protect,
    authController.allowTo("admin"),
    userController.createUser
  );

router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .patch(
    authController.protect,
    authController.allowTo("admin"),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.allowTo("admin"),
    userController.deleteUser
  );

module.exports = router;
