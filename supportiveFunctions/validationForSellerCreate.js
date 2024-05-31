const validationForSellerCreate = (
  email,
  companyName,
  yourName,
  password,
  confirmPassword,
  contactNumber,
  address,
  cin,
  category,
  storeName,
  storeDescription,
  storeLogoFilename,
  shopImageFilename
) => {
  if (!yourName || yourName == "") {
    return { message: "Your Name is Required", status: 203 };
  }
  if (!companyName || companyName == "") {
    return { message: "Company Name is Required", status: 203 };
  }
  if (!email || email == "") {
    return { message: "Email is Required", status: 203 };
  }
  if (!isValidGmail(email)) {
    return { message: "Invalid Email", status: 203 };
  }
  if (!password || password == "") {
    return { message: "Password is Required", status: 203 };
  }
  if (!confirmPassword || confirmPassword == "") {
    return { message: "Confirm Password is Required", status: 203 };
  }

  if (password !== confirmPassword) {
    return {
      message: "Password and Confirm Password does not match",
      status: 203,
    };
  }
  if (password.length < 8) {
    return {
      message: "Password should be at least 8 characters long",
      status: 203,
    };
  }
  if (
    !contactNumber ||
    contactNumber == "" ||
    isNaN(contactNumber) ||
    contactNumber.length < 10 ||
    contactNumber.length > 12
  ) {
    return { message: "Valid Contact Number is Required", status: 203 };
  }
  if (!address || address == "") {
    return { message: "Address is Required", status: 203 };
  }
  if (!category || category == "" || category == "select") {
    return { message: " Please Select category!", status: 203 };
  }
  if (!cin || cin == "" || cin.length !== 21) {
    return { message: "Valid CIN is Required", status: 203 };
  }
  if (!shopImageFilename) {
    return { message: "Shop Image is Required", status: 203 };
  }
  if (!storeName || storeName == "") {
    return { message: "Store Name is Required", status: 203 };
  }
  if (!storeDescription || storeDescription == "") {
    return { message: "Store Description is Required", status: 203 };
  }
  if (!storeLogoFilename) {
    return { message: "Store Logo is Required", status: 203 };
  }
  return { message: "Validation Success", status: 200 };
};
module.exports = { validationForSellerCreate };

const isValidGmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9]+@gmail\.com$/;
  return emailRegex.test(email);
};
