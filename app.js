// app.js
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');  // Import routes from index.js
const { Sequelize } = require('sequelize');
require('dotenv').config();  // To load .env variables

// Using the DATABASE_URL from the .env file
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Disable logging for cleaner output
});

const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Use all routes defined in the routes folder
app.use('/api', routes);  // Routes are now prefixed with '/api'

// Server Setup
const port = process.env.PORT || 5000;
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    try {
        await sequelize.authenticate(); // Test DB connection
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
});
