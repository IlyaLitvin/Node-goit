const {
  Types: { ObjectId },
} = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

mongoose.set("useFindAndModify", false);

const User = require("../model/user.model.js");

async function userRegister(req, res) {
  try {
    const { body } = req;
    const hashPass = await bcrypt.hash(body.password, 2);
    const user = await User.create({
      ...body,
      password: hashPass,
    });
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
}

async function userLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return res.status(401).send("Email or password is wrong");
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(401).send("Email or password is wrong");
  }
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET
  );
  await User.findByIdAndUpdate(user._id, { token: token });
  return res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
}

async function userLogout(req, res) {
  const {
    params: { userId },
  } = req;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).send({ message: "Not authorized" });
  }
  await User.findByIdAndUpdate(userId, { token: "" });
  return res.status(204).send("No Content");
}

function usersValidation(req, res, next) {
  const validationRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error.message);
  }
  next();
}

async function currentUser(req, res) {
  const authorizationHeader = req.get("Authorization");
  const token = authorizationHeader.replace("Bearer ", "");
  const user = await User.findOne({ token: token });
  if (!user) {
    return res.status(401).send({ message: "Not authorized" });
  }
  return res
    .status(200)
    .json({ email: user.email, subscription: user.subscription });
}

async function subscription(req, res) {
  const {
    params: { userid },
  } = req;
  const { subscription } = req.body;
  if (subscription === "free" || "pro" || "premium") {
    const userSub = await User.findByIdAndUpdate(
      userid,
      { subscription: subscription },
      { new: true }
    );
    return res
      .status(201)
      .json({ email: userSub.email, subscription: userSub.subscription });
  }
}

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  usersValidation,
  currentUser,
  subscription,
};
