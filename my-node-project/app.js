// app.js
const express = require('express');
const organisationRoutes = require('./routes/organisation');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use('/api/organisations', organisationRoutes);
app.use('/auth', authRoutes);

// Error handling middleware should be the last middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

