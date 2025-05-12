const { query } = require('../db/db'); // Import the database query function
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // AWS S3 SDK
const { v4: uuidv4 } = require('uuid'); // For generating unique file names
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for text messages
    socket.on('sendMessage', async (data) => {
      try {
        const { sender, receiver, message } = data;

        if (!sender || !receiver || !message) {
          console.error('Missing required fields: sender, receiver, or message');
          return;
        }

        console.log('Received message from client:', { sender, receiver, message });

        // Save the message to the database
        const sql = `INSERT INTO msg.messages (sender, receiver, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`;
        const result = await query(sql, [sender, receiver, message]);

        console.log('Message saved to database:', result.rows[0]);

        // Broadcast the message to all connected clients
        io.emit('receiveMessage', { sender, receiver, message });
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    });

    // Listen for voice attachments
    socket.on('sendVoice', async (data, callback) => {
      try {
        const { sender, receiver, voice } = data;
    
        if (!sender || !receiver || !voice) {
          console.error('Missing required fields: sender, receiver, or voice');
          return callback({ success: false, message: 'Missing required fields' });
        }
    
        console.log('Received voice data (Buffer):', voice);
    
        // Generate a unique file name for the audio file
        const fileName = `voice-attachments/${uuidv4()}.webm`;
    
        console.log('Uploading file to S3 with name:', fileName);
    

        // Upload the audio file to S3
        const uploadParams = {
          Bucket: process.env.S3_MESSAGINGAUDIO_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(voice), // Convert the voice data to a Buffer
          ContentType: 'audio/webm',
        };

        const command = new PutObjectCommand(uploadParams);
        const response = await s3Client.send(command);

        console.log('S3 Upload Response:', response);

        // Generate the S3 file URL
        const fileUrl = `https://${process.env.S3_MESSAGINGAUDIO_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        console.log('Voice attachment uploaded to S3:', fileUrl);

        // Save the voice attachment to the database
        const sql = `INSERT INTO msg.messages (sender, receiver, file_url, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`;
        const result = await query(sql, [sender, receiver, fileUrl]);

        console.log('Voice attachment saved to database:', result.rows[0]);

        // Broadcast the file URL to all connected clients
        io.emit('receiveVoice', { sender, receiver, fileUrl });

        // Send success response to the client
        callback({ success: true, fileUrl });
      } catch (error) {
        console.error('Error uploading voice attachment to S3 or saving to database:', error);
        callback({ success: false, message: 'Error processing voice attachment' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};