const jwt = require("jsonwebtoken");
const { secret_jwt } = require("../config/config");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "A token is required for authentication",
    });
  }

  try {
    const decoded = jwt.verify(token, secret_jwt);

    // Check if token has expired
    if (decoded.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    // Check if the error is due to token expiration
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid Token",
    });
  }
}

module.exports = { authenticateToken };
