const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const contactsRouter = require("./routes/contacts.routes.js");
const usersRouter = require("./routes/user.routes.js");
const imgRouter = require("./routes/img.router.js");

dotenv.config();

const PORT = process.env.port || 3000;

start();

function start() {
  server = express();
  initMiddlewares(server);
  initRoutes(server);
  connectToDb();
  listen(server);
}

function initMiddlewares() {
  server.use(express.json());
  server.use(
    cors({
      origin: "*",
    })
  );
}

function initRoutes() {
  server.use("/api/contacts", contactsRouter);
  server.use("/auth", usersRouter);
  server.use("/images", imgRouter);
}

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

function listen() {
  server.listen(PORT, () => {
    console.log("Server is listening on port: ", PORT);
  });
}
