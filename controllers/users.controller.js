const fs = require("fs");
const {
  Types: { ObjectId },
} = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const Avatar = require("avatar-builder");
const avatar = Avatar.catBuilder(128);
const { existsSync } = require("fs");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");

dotenv.config();

mongoose.set("useFindAndModify", false);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require("../model/user.model.js");

async function userRegister(req, res) {
  try {
    const { body } = req;
    const userToken = uuidv4();
    sendEmail(userToken, body.email);
    avatar
      .create()
      .then((buffer) => fs.writeFileSync("tmp/avatar.png", buffer));
    const newAvatarName = Date.now();
    fs.rename("tmp/avatar.png", `public/images/${newAvatarName}.png`, () => {});
    const hashPass = await bcrypt.hash(body.password, 2);
    const user = await User.create({
      ...body,
      verificationToken: userToken,
      password: hashPass,
      avatarURL: `http://localhost:3000/images/${newAvatarName}.png`,
    });
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(400).send(error.message);
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
  if (!user.verificationToken) {
    return res.status(401).send("You must complete authorization");
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
  return res
    .status(200)
    .json({ email: req.user.email, subscription: req.user.subscription });
}

async function subscription(req, res) {
  const {
    params: { userid },
  } = req;
  const { subscription } = req.body;
  const userSub = await User.findByIdAndUpdate(
    userid,
    { subscription: subscription },
    { new: true }
  );
  if (
    subscription === "free" ||
    subscription === "pro" ||
    subscription === "premium"
  ) {
    return res
      .status(201)
      .json({ email: userSub.email, subscription: userSub.subscription });
  } else if (
    subscription !== "free" ||
    subscription !== "pro" ||
    subscription !== "premium"
  ) {
    return res.status(201).json({ email: userSub.email, subscription: "free" });
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const fileInfo = path.parse(file.originalname);
    cb(null, `${Date.now()}${fileInfo.ext}`);
  },
});
const upload = multer({ storage: storage });

async function updateAvatar(req, res) {
  const { body, file, user } = req;
  switch (true) {
    case !!file && !!body.password:
      deleteAvatar(user.avatarURL);
      const hashedPass = await bcrypt.hash(body.password, 2);
      const newAvatar = await User.findByIdAndUpdate(user._id, {
        ...body,
        passoword: hashedPass,
        avatarURL: `http://localhost:3000/images/${file.filename}`,
      });
      return res.status(200).send({ message: "File and pass updated" });
    case !!body.password:
      const hashPass = await bcrypt.hash(body.password, 2);
      const newPass = await User.findByIdAndUpdate(user._id, {
        ...body,
        passoword: hashPass,
      });
      return res.status(200).send({ message: "Pass updated" });

    case !!file:
      deleteAvatar(user.avatarURL);
      const newFile = await User.findByIdAndUpdate(user._id, {
        ...body,
        avatarURL: `http://localhost:3000/images/${file.filename}`,
      });
      return res.status(200).send({ message: "File updated" });

    default:
      const newEmail = await User.findByIdAndUpdate(user._id, {
        ...body,
      });
      return res.status(200).send({ message: "Email updated" });
  }
}

function updateValidationAv(req, res, next) {
  const validationRules = Joi.object({
    subscription: Joi.string().valid("free", "pro", "premium"),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: Joi.string().pattern(/^[0-9]+$/),
  });
  const validationResult = validationRules.validate(req.body);
  console.log();
  if (validationResult.error) {
    return res.status(400).send({ message: "missing required name field" });
  }
  next();
}

function deleteAvatar(avatarURL) {
  const url = avatarURL.replace("http://localhost:3000/images/", "");
  if (existsSync(`public/images/${url}`)) {
    fs.unlink(path.join("public/images", url), () => {});
  }
}

async function verifyUser(req, res) {
  const {
    params: { verificationToken },
  } = req;
  const user = await User.findOne({
    verificationToken,
  });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const userUpdate = await User.findByIdAndUpdate(user._id, {
    verificationToken: "",
  });
  return res.status(200).send({ message: "Welcome to our application" });
}

async function sendEmail(token, email) {
  try {
    const msg = {
      to: email,
      from: "litvinpiton88@gmail.com",
      subject: "Please verify your acc",
      html: `Welcome to our application. To verification your acc please go by <a href="http://localhost:3000/auth/verify/${token}">link</a>`,
    };
    await sgMail.send(msg);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  usersValidation,
  currentUser,
  subscription,
  upload,
  updateAvatar,
  updateValidationAv,
  deleteAvatar,
  verifyUser,
};
