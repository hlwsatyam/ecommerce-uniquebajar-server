const ErrorCreate = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
};

const ErrorController = (err, req, res, next) => {
  const status = err.status || 503;
  const message = err.message || "Something went worng!!";
  return res
    .status(status)
    .json({ statusCode: status, status: false, message });
};

module.exports = { ErrorCreate, ErrorController };
