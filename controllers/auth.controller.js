const User = require("../model/user.model.js");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

async function Authorization(req, res, next) {
  const authorizationHeader = req.get("Authorization");
  if (!authorizationHeader) {
    return res.status(401).send({ message: "Not authorized" });
  }
  const token = authorizationHeader.replace("Bearer ", "");
  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Not authorized" });
  }
}

module.exports = { Authorization };
