const validationForProductUpload = (
  product_brand,
  category,
  product_title,
  real_price,
  discount_price,
  subcategory,
  feature_details,
  description,
  product_informations,
  return_time,
  images,
  req,
  res
) => {
  if (product_brand === "" || !product_brand) {
    return { message: "Product Brand is required", status: 203 };
  }
  if (product_title === "" || !product_title) {
    return { message: "Product Title is required", status: 203 };
  }
  if (real_price === "" || !real_price || isNaN(real_price)) {
    return { message: "Valid Real Price is required", status: 203 };
  }
  if (discount_price === "" || !discount_price || isNaN(discount_price)) {
    return { message: "Valid Discount Price is required", status: 203 };
  }
  if (category === "" || category == "select" || !category) {
    return { message: "Category is required", status: 203 };
  }
  if (subcategory === "" || subcategory == "select" || !subcategory) {
    return { message: "Subcategory is required", status: 203 };
  }
  if (description === "" || !description) {
    return { message: "Description is required", status: 203 };
  }
  if (
    return_time === "" ||
    !return_time ||
    isNaN(return_time) ||
    return_time < 2 
  ) {
    return { message: "Valid Return Time is required", status: 203 };
  }
  if (!images || images?.length === 0) {
    return { message: "Atleast one image is required", status: 203 };
  } 
  return { message: "Validation Success", status: 200 };
};
module.exports = { validationForProductUpload };
