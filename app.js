const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const ShortUniqueId = require("short-unique-id");
const { isValidUrl } = require("./src/utils/urlValidator");
const { isValidExpirationDate } = require("./src/utils/expirationValidator");
const Url = require("./src/models/url");
const app = express();
app.use(cors());
dotenv.config();

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

// API endpoint to shorten a URL
// localhost:3000/api/shorten/new
// {
//   "originalUrl": "https://www.example.in",
//   "expirationDate": "2024-12-31"
// }
app.post("/api/shorten/new", async (req, res) => {
  const { originalUrl, expirationDate, customKeyword } = req.body;

  // Check if the URL is valid
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await axios.head(originalUrl);

    // Check if the response status code indicates success (2xx or 3xx)
    if (!(response.status >= 200 && response.status < 400)) {
      return res.status(400).json({ error: "Invalid or inaccessible URL" });
    }

    // Check if the custom keyword is already in use
    if (customKeyword !== undefined && customKeyword !== "") {
      const existingUrlWithCustomKeyword = await Url.findOne({ customKeyword });
      if (existingUrlWithCustomKeyword) {
        return res.status(400).json({ error: "Custom keyword already in use" });
      }
    }

    // Validate expiration date if provided
    if (expirationDate && !isValidExpirationDate(expirationDate)) {
      return res.status(400).json({ error: "Invalid expiration date" });
    }

    // Generate a short ID for the URL if no custom keyword is provided
    const { randomUUID } = new ShortUniqueId({ length: 10 });
    const shortUrl = customKeyword || randomUUID();
    const newUrl = new Url({
      originalUrl,
      shortUrl,
      expirationDate,
      customKeyword,
    });
    await newUrl.save();

    // Respond with the shortened URL
    res.status(201).json({ message: "success", newUrl });
    console.log("url created");
  } catch (error) {
    console.error("Error verifying URL:", error.message);
    return res.status(400).json({ error: "Invalid or inaccessible URL" });
  }
});

// API endpoint to redirect to the original URL
// localhost:3000/LLfspQgrs
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  // Find the original URL in the database
  const url = await Url.findOne({ shortUrl });
  if (url) {
    // Redirect to the original URL
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      res.status(404).json({ error: "Link is expired" });
    } else {
      const analyticsData = {
        timestamp: new Date(),
        ipAddress: "N/A",
        userAgent: req.headers["user-agent"],
        country: "N/A",
        city: "N/A",
      };

      url.analytics.push(analyticsData);
      url.totalVisit += 1;
      url.lastVisit = new Date();
      await url.save();

      // Redirect to the original URL
      res.redirect(url.originalUrl);
    }
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

// API endpoint to get the data for a short URL
app.get("/api/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  if (!shortUrl) {
    return res.status(400).json({ error: "Invalid short URL" });
  } else {
    const url = await Url.findOne({ shortUrl });
    // console.log(url);
    res.status(200).json({ url });
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
