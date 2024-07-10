const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Organisation } = require('../models');
const errorHandler = require('../middleware/error-handler');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate request payload
    if (!firstName || !lastName || !email || !password) {
      return res.status(422).json({
        errors: [
          { field: 'firstName', message: 'First name is required' },
          { field: 'lastName', message: 'Last name is required' },
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' }
        ]
      });
    }

    // Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database
    const user = await User.create({
      userId: `${firstName.toLowerCase()}-${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    // Create a default organisation for the user
    const organisation = await Organisation.create({
      orgId: `${firstName.toLowerCase()}-org-${Date.now()}`,
      name: `${firstName}'s Organisation`,
      description: 'Default organisation'
    });

    // Associate user with the organisation
    await user.addOrganisation(organisation);

    // Generate a JWT token for the user
    const accessToken = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Return the user data and JWT token in the response
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

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request payload
    if (!email || !password) {
      return res.status(422).json({
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' }
        ]
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    // Authenticate user by comparing the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    // Generate a JWT token for the user
    const accessToken = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Return the user data and JWT token in the response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
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

