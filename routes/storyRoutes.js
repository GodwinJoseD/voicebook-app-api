// routes/storyRoutes.js
const express = require('express');
const storyService = require('../services/storyService');
const upload = require('../utils/upload'); // Multer middleware for file uploads

const router = express.Router();

// POST /stories: Create a new story with an audio file
router.post('/', upload.single('audio'), async (req, res) => {
    try {
        const { userId } = req.user; // Assuming authentication middleware attaches `userId` to `req.user`
        const { caption, expires_at } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const newStory = await storyService.createStory(userId, req.file, caption, expires_at);
        return res.status(201).json({
            success: true,
            data: newStory,
        });
    } catch (error) {
        console.error('Error creating story', error);
        return res.status(500).json({ message: 'Error creating story' });
    }
});

module.exports = router;
