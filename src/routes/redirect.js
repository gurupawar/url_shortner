const express = require("express");
const requestIp = require("request-ip");
const iplocate = require("node-iplocate");
const UAParser = require("ua-parser-js");
const Url = require("../models/url");
const { checkExpiration } = require("../utils/expirationValidator");

const router = express.Router();
// API endpoint to redirect to the original URL
// localhost:3000/LLfspQgrs

router.get("/:shortUrl", checkExpiration, async (req, res) => {
  const { shortUrl } = req.params;
  const ipAddress = requestIp.getClientIp(req);

  // Find the original URL in the database
  const url = await Url.findOne({ shortUrl });

  let country = "N/A";
  let city = "N/A";

  const userAgent = req.headers["user-agent"];
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

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
        userAgent: {
          us: result.ua || "N/A",
          browser: {
            name: result.browser.name || "N/A",
            version: result.browser.version || "N/A",
          },
          engine: {
            name: result.engine.name || "N/A",
            version: result.engine.version || "N/A",
          },
          os: {
            name: result.os.name || "N/A",
            version: result.os.version || "N/A",
          },
          device: {
            vendor: result.device.vendor || "N/A",
            model: result.device.model || "N/A",
            deviceType: result.device.type || "N/A",
          },
          cpu: {
            architecture: result.cpu.architecture || "N/A",
          },
        },
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
