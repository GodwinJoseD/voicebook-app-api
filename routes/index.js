// routes/index.js
const express = require('express');
const postsRoutes=require('./postsRoutes');

const router = express.Router();

// Centralized routing: Use /stories route for story-related API calls
router.use('/posts', postsRoutes);

module.exports = router;
