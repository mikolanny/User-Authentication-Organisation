// routes/user.js

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Organisation = require('../models/organisation');
const jwt = require('jsonwebtoken');
const errorHandler = require('../middleware/error-handler');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId: `${firstName.toLowerCase()}-${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    const organisation = await Organisation.create({
      orgId: `${firstName.toLowerCase()}-org-${Date.now()}`,
      name: `${firstName}'s Organisation`,
      description: 'Default organisation'
    });

    await user.addOrganisation(organisation);

    const accessToken = jwt.sign({ userId: user.userId }, 'your_secret_key', { expiresIn: '1h' });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;

