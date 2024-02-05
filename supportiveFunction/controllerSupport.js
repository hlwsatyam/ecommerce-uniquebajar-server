const crypto = require("crypto");

function formatPhoneNumber(phoneNumber) {
  // Check if the number starts with "+91"
  if (phoneNumber.startsWith("+91")) {
    return phoneNumber; // Return unchanged if already starts with "+91"
  } else {
    // Add "+91" to the beginning of the number
    return "+91" + phoneNumber;
  }
}
function generateUniqueCode(aadhaarNumber, uniqueCode, format) {
  const inputString = `${aadhaarNumber}-${uniqueCode}`;
  const hash = crypto.createHash("sha256").update(inputString).digest("hex");
  let result = hash.substr(0, 20);

  if (format === 0) {
    result = "0" + result;
  } else if (format === 1) {
    const currentYear = new Date().getFullYear();
    const lastTwoDigitsOfYear = currentYear.toString().slice(-2);
    result = `1${lastTwoDigitsOfYear}${result.substr(1)}`;
  }

  return result;
}
function convertToUpperCaseWithNumbers(pan_number) {
  let result = "";

  for (let i = 0; i < pan_number.length; i++) {
    const char = pan_number[i];
    if (/[a-z]/.test(char)) {
      result += char.toUpperCase();
    } else {
      result += char;
    }
  }

  return result;
}
const headers = {
  "client-id": process.env.CLIENT_ID,
  "x-api-key": process.env.X_API_KEY,
};

module.exports = {
  formatPhoneNumber,
  generateUniqueCode,
  convertToUpperCaseWithNumbers,
  headers,
  discountCalculatePercentage
};



function discountCalculatePercentage(mrp, sellingPrice) {
  // Ensure both values are valid numbers
  if (isNaN(mrp) || isNaN(sellingPrice)) {
    console.error("Invalid input. Please provide valid numbers for MRP and selling price.");
    return null;
  }

  // Calculate the discount as a percentage
  const discountPercentage = ((mrp - sellingPrice) / mrp) * 100;

  // Round the discount percentage to the nearest integer
  const roundedDiscountPercentage = Math.round(discountPercentage);

  return roundedDiscountPercentage;
}