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
const deleteUrl = require("./src/routes/deleteUrl");

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
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
const router = express.Router();

// Use route handlers
app.use(
  "/",
  router.get("/", (req, res) =>
    res.send({
      message: "Welcome to the URL shortener API",
      API_URL: "https://short-me.onrender.com",
      documentation: "https://github.com/gurupawar/url_shortner",
      author: "https://github.com/gurupawar",
      frontend: "https://github.com/gurupawar/url_shortner-frontend",
    })
  )
);

app.use("/auth", signup); //post
app.use("/auth", login); //post
app.use("/api/shorten", shortenRoute); //post
app.use("/api", getAllUrlsRoute); //post
app.use("/api", deleteUrl); //post

app.use("/", redirectRoute); //get
app.use("/api", analyticsRoute); //get

7;

app.listen(PORT, () => {
  console.log("server is running on port 3000");
});
