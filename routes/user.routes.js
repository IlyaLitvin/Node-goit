const Router = require("express");
const router = Router();
const morgan = require("morgan");
const usersController = require("../controllers/users.controller.js");
const authController = require("../controllers/auth.controller.js");

router.use(morgan("dev"));

router.post(
  "/registr",
  usersController.usersValidation,
  usersController.userRegister
);
router.post("/login", usersController.userLogin);
router.get("/logout/:userId", authController.Auth, usersController.userLogout);
router.get("/current", authController.Auth, usersController.currentUser);
router.patch(
  "/user/:userid",
  authController.Auth,
  usersController.subscription
);
router.patch(
  "/users/avatars",
  authController.Auth,
  usersController.upload.single("avatar"),
  usersController.updateValidationAv,
  usersController.updateAvatar
);
router.get("/verify/:verificationToken", usersController.verifyUser);

module.exports = router;
