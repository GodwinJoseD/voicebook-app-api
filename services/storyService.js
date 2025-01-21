// services/storyService.js
const db = require('../models'); // Assuming Sequelize ORM is used for DB interaction
const s3 = require('../utils/awsConfig'); // AWS S3 config
const { v4: uuidv4 } = require('uuid'); // To generate unique names for files

// Function to create a new story by uploading audio to S3
exports.createStory = async (userId, audioFile, caption, expiresAt) => {
    // Generate a unique name for the audio file
    const audioKey = `stories/${uuidv4()}-${audioFile.originalname}`;

    // Upload the audio file to S3
    const params = {
        Bucket: process.env.S3_BUCKET_NAME, // S3 Bucket Name from environment variable
        Key: audioKey,
        Body: audioFile.buffer,
        ContentType: audioFile.mimetype,
        ACL: 'public-read', // Makes the audio file publicly accessible
    };

    try {
        // Upload to S3
        const uploadResult = await s3.upload(params).promise();
        const audioUrl = uploadResult.Location; // URL of the uploaded audio file

        // Save story information to the database
        const newStory = await db.Story.create({
            user_id: userId,
            content_type: 'audio', // Content type is audio for stories
            audio_url: audioUrl, // Store the S3 URL of the uploaded audio
            caption: caption || null,
            expires_at: new Date(expiresAt),
        });

        return newStory;
    } catch (error) {
        console.error('Error uploading audio file to S3', error);
        throw new Error('Error uploading audio file to S3');
    }
};
