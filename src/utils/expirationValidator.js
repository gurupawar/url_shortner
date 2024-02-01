// urlValidator.js

function isValidExpirationDate(date) {
  return new Date(date) > new Date(); // Check if the provided date is in the future
}

module.exports = { isValidExpirationDate };
