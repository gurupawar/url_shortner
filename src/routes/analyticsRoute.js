const express = require("express");
const Url = require("../models/url");
const { authenticateToken } = require("../service/auth");

const router = express.Router();

// API endpoint to get the data for a short URL
router.get("/:shortUrl", authenticateToken, async (req, res) => {
  const { shortUrl } = req.params;

  const existinShortUrl = await Url.findOne({ shortUrl });

  console.log(existinShortUrl);
  if (!existinShortUrl) {
    return res.status(400).json({ error: "Invalid short URL" });
  } else {
    const url = await Url.findOne({ shortUrl });
    res.status(200).json({ url });
  }
});

module.exports = router;
