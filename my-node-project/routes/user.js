// routes/user.js
const express = require('express');
const { User } = require('../models');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Get User Record Endpoint
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve the user record from the database
    const user = await User.findOne({ where: { userId: id } });

    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'User not found'
      });
    }

    // Return the user data in the response
    res.status(200).json({
      status: 'success',
      message: 'User record retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

