const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const shortenRoute = require("./src/routes/shorten");
const redirectRoute = require("./src/routes/redirect");
const analyticsRoute = require("./src/routes/analyticsRoute");
const signup = require("./src/routes/signup");
const login = require("./src/routes/login");
const getAllUrlsRoute = require("./src/routes/getAllUrlsRoute");

dotenv.config();
const app = express();
app.use(cors());

const mongoDB = process.env.MONGODB_CONNECTION_STRING;

mongoose
  .connect(mongoDB)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Use route handlers
app.use("/auth", signup);
app.use("/auth", login);
app.use("/api/shorten", shortenRoute);
app.use("/", redirectRoute);
app.use("/api", analyticsRoute);
app.use("/api", getAllUrlsRoute);

7;

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
