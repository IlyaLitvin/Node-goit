const {
  Types: { ObjectId },
} = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../model/user.model.js");

async function userRegister(req, res) {
  try {
    const { body } = req;
    const hashedPassword = await bcrypt.hash(body.password, 2);
    const user = await User.create({
      ...body,
      password: hashedPassword,
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
  const paswordValid = await bcrypt.compare(password, user.password);
  if (!paswordValid) {
    return res.status(401).send("Email or password is wrong");
  }
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.TOKEN_SECRET
  );
  return res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
}

async function userLogout(req, res, next) {
  const {
    params: { id },
  } = req;

  const findUser = await User.findById(id);

  if (!findUser) {
    return req.status(400).send({ message: "Not authorized" });
  }
}

module.exports = { userRegister, userLogin };
