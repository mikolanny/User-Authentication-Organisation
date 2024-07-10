const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/user');
const organisationRoutes = require('./routes/organisation');

const app = express();

app.use(express.json());
app.use('/auth', userRoutes);
app.use('/api/organisations', organisationRoutes);

// Sync models and start the server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

