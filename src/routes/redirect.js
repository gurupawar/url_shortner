const express = require("express");
const requestIp = require("request-ip");
const iplocate = require("node-iplocate");
const Url = require("../models/url");

const router = express.Router();
// API endpoint to redirect to the original URL
// localhost:3000/LLfspQgrs

router.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const ipAddress = requestIp.getClientIp(req);

  // Find the original URL in the database
  const url = await Url.findOne({ shortUrl });

  let country = "N/A";
  let city = "N/A";

  try {
    const ipDetails = await iplocate(ipAddress);
    if (ipDetails) {
      country = ipDetails.country || "N/A";
      city = ipDetails.city || "N/A";
    }
  } catch (error) {
    console.error("Error fetching IP details:", error);
  }

  if (url) {
    // Redirect to the original URL
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      res.status(404).json({ error: "Link is expired" });
    } else {
      const analyticsData = {
        timestamp: new Date(),
        ipAddress: ipAddress || "N/A",
        userAgent: req.headers["user-agent"],
        country,
        city,
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

module.exports = router;
