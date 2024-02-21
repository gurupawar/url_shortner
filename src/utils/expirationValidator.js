const Url = require("../models/url");

// Function to check if the provided date is in the future
function isValidExpirationDate(date) {
  return new Date(date) > new Date();
}

// Url expiration date checker middleware
const checkExpiration = async (req, res, next) => {
  const { shortUrl } = req.params;

  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const currentDate = new Date();
  const expirationDate = new Date(url.expirationDate);

  if (currentDate > expirationDate) {
    return res.status(403).json({ message: "URL has expired" });
  }

  // URL is valid, proceed to the next middleware/route handler
  next();
};

module.exports = { isValidExpirationDate, checkExpiration };
