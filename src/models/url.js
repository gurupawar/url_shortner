const mongoose = require("mongoose");

urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  customKeyword: {
    type: String,
    unique: true,
  },
  expirationDate: Date,
  totalVisit: {
    type: Number,
    default: 0,
  },
  lastVisit: {
    type: Date,
  },
  analytics: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      country: String,
      city: String,
      userAgent: String,
      referrer: String,
    },
  ],
});

module.exports = mongoose.model("Url", urlSchema);
