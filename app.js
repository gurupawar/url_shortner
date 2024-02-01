const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const { isValidUrl } = require("./src/utils/urlValidator");
const { isValidExpirationDate } = require("./src/utils/expirationValidator");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/urlShortener", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  expirationDate: Date,
  clickCount: {
    type: Number,
    default: 0,
  },
  lastClicked: {
    type: Date,
  },
});

const Url = mongoose.model("Url", urlSchema);

// API endpoint to shorten a URL
app.post("/api/shorten/new", async (req, res) => {
  const { originalUrl, expirationDate } = req.body;

  // Check if the URL is valid
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Validate expiration date if provided
  if (expirationDate && !isValidExpirationDate(expirationDate)) {
    return res.status(400).json({ error: "Invalid expiration date" });
  }

  //   // Check if the URL is already shortened
  const existingUrl = await Url.findOne({ originalUrl });

  if (existingUrl) {
    console.log("URL already exists");
    return res.json({ shortUrl: existingUrl.shortUrl });
  }

  // Generate a short URL key
  const shortUrl = shortid.generate();
  const newUrl = new Url({ originalUrl, shortUrl, expirationDate });
  await newUrl.save();

  // Respond with the shortened URL
  res.status(201).json({ message: "success", newUrl });
});

// API endpoint to redirect to the original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  // Find the original URL in the database
  const url = await Url.findOne({ shortUrl });

  if (url) {
    // Redirect to the original URL
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      res.status(404).json({ error: "Link is expired" });
    } else {
      res.redirect(url.originalUrl);
    }
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
