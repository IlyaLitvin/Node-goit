const Router = require("express");
const router = Router();
const morgan = require("morgan");
const usersController = require("../controllers/users.controller.js");

router.use(morgan("dev"));

router.post("/registr", usersController.userRegister);
router.post("/login", usersController.userLogin);
