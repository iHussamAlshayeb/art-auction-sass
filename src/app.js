const express = require('express');
const cors = require('cors');

// Create the Express app
const app = express();

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Art Auction API! 🚀' });
});

module.exports = app;