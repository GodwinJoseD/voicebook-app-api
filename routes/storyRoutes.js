const express = require('express');
const storyService = require('../services/storyService');
const upload = require('../utils/upload'); // Multer middleware for file uploads

const router = express.Router();

// POST /stories: Create a new story with an audio file
router.post('/stories', upload.single('audio'), async (req, res) => {
  try {
    const { userId, caption, expires_at } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

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

// GET /stories: Get stories with pagination
router.get('/stories', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const stories = await storyService.getStories(page, limit);

    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Error fetching stories', error);
    return res.status(500).json({ message: 'Error fetching stories' });
  }
});

module.exports = router;