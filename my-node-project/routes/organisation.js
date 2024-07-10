// routes/organisation.js
const express = require('express');
const { Organisation, User } = require('../models');
const authenticate = require('../middleware/authenticate');
const errorHandler = require('../middleware/error-handler');

const router = express.Router();

// Create Organisation Endpoint
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate request payload
    if (!name) {
      return res.status(422).json({
        errors: [{ field: 'name', message: 'Name is required' }]
      });
    }

    // Create a new organisation record in the database
    const organisation = await Organisation.create({
      orgId: `${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
      name,
      description
    });

    // Associate the authenticated user with the new organisation
    const user = req.user;
    await user.addOrganisation(organisation);

    // Return the organisation data in the response
    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get User Organisations Endpoint
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    // Retrieve all organisations the user belongs to or created
    const organisations = await user.getOrganisations();

    // Return the organisation data in the response
    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations: organisations.map(org => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description
        }))
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Single Organisation Endpoint
router.get('/:orgId', authenticate, async (req, res, next) => {
  try {
    const { orgId } = req.params;

    // Retrieve the specified organisation record
    const organisation = await Organisation.findOne({ where: { orgId } });

    if (!organisation) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'Organisation not found'
      });
    }

    // Return the organisation data in the response
    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description
      }
    });
  } catch (err) {
    next(err);
  }
});

// Add User to Organisation Endpoint
router.post('/:orgId/users', authenticate, async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { userId } = req.body;

    // Validate request payload
    if (!userId) {
      return res.status(422).json({
        errors: [{ field: 'userId', message: 'User ID is required' }]
      });
    }

    // Retrieve the specified organisation record
    const organisation = await Organisation.findOne({ where: { orgId } });

    if (!organisation) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'Organisation not found'
      });
    }

    // Retrieve the specified user record
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'User not found'
      });
    }

    // Add the specified user to the organisation
    await organisation.addUser(user);

    // Return a success message in the response
    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully'
    });
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;

