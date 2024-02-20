const express = require("express");
const Url = require("../models/url");
const mongoose = require("mongoose");
const { authenticateToken } = require("../service/auth");
const { secret_jwt } = require("../config/config");
const jwt = require("jsonwebtoken");

const router = express.Router();

// API endpoint to get the data for a short URL
router.post("/all-url", authenticateToken, async (req, res) => {
  const token = req.headers["authorization"];
  const decode = jwt.verify(token, secret_jwt);

  try {
    // Validation: Check if _id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(decode._id)) {
      return res.status(400).json({ error: "Invalid _id format" });
    }

    const urls = await Url.find({ user: decode._id });

    if (urls.length === 0) {
      return res
        .status(404)
        .json({ error: "No URLs found for the given user ID" });
    }

    res.status(200).json({ urls });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
