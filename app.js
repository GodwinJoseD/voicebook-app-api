// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/index');  // Import routes from index.js
const { Sequelize } = require('sequelize');
const http = require('http'); // Required to create an HTTP server
const { Server } = require('socket.io'); // Import Socket.IO
const messagingService = require('./services/messagingService'); // Correctly import messagingService
require('dotenv').config();  // To load .env variables

// Using the DATABASE_URL from the .env file
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Disable logging for cleaner output
});

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (or specify your frontend's origin)
        methods: ['GET', 'POST'],
    },
});

// Enable CORS
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Use all routes defined in the routes folder
app.use('/api', routes);  // Routes are now prefixed with '/api'

// Initialize messaging service
messagingService(io); // Pass the Socket.IO instance to the messaging service

// Server Setup
const port = process.env.PORT || 5000;
/*app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    try {
        await sequelize.authenticate(); // Test DB connection
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
});*/
server.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    try {
        await sequelize.authenticate(); // Test DB connection
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
});
