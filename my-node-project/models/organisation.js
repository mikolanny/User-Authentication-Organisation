// models/organisation.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Name is required'
      },
      notEmpty: {
        msg: 'Name cannot be empty'
      }
    }
  },
  description: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Organisation;

