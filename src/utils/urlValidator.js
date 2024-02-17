function isValidUrl(url) {
  // Regular expression for a valid URL
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(url);
}

module.exports = { isValidUrl };
