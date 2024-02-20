const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
      userAgent: {
        us: String,
        browser: { name: String, version: String },
        engine: { name: String, version: String },
        os: { name: String, version: String },
        device: { vendor: String, model: String, deviceType: String },
        cpu: { architecture: String },
      },
      referrer: String,
    },
  ],
});

module.exports = mongoose.model("Url", urlSchema);
