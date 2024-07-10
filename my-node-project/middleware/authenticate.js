// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

module.exports = authenticate;
