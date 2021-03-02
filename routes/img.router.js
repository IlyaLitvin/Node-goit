const { Router } = require("express");
const morgan = require("morgan");
const path = require("path");
const express = require("express");
const router = Router();

router.use(morgan("dev"));

router.use(express.static(path.join("public/images")));

module.exports = router;
