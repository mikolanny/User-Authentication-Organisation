
// middleware/error-handler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

