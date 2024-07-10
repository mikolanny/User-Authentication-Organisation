// routes/organisation.js

const express = require('express');
const Organisation = require('../models/organisation');
const errorHandler = require('../middleware/error-handler');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const organisation = await Organisation.create({
      orgId: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      description
    });

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

router.use(errorHandler);

module.exports = router;

