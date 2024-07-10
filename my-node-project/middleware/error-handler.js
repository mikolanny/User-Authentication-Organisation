// middleware/error-handler.js

function errorHandler(err, req, res, next) {
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));

    return res.status(422).json({
      errors: errors
    });
  }

  next(err);
}

module.exports = errorHandler;

