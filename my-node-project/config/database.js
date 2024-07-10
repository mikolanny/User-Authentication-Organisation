// config/database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('my_database', 'postgres', 'mikolanny', {
  host: '127.0.0.1',
  dialect: 'postgres'
});

module.exports = sequelize;

