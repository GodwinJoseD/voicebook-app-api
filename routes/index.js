// routes/index.js
const express = require('express');
const postsRoutes=require('./postsRoutes');
const storyRoutes=require('./storyRoutes');
const authRoutes = require('./authRoutes');
const otpRoutes = require('./otpRoutes');
const messagingRoutes = require('./messagingRoutes');
const userRoutes = require('./userRoutes'); // Import user routes
const testRoutes = require('./testRoutes');

const router = express.Router();

// Centralized routing: Use /stories route for story-related API calls
router.use('/posts', postsRoutes);
router.use('/stories', storyRoutes);
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/test', testRoutes);
router.use('/messaging', messagingRoutes);
router.use('/users', userRoutes); // Use user routes

module.exports = router;
