const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const uploadToS3 = require('../services/s3');

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only MP3 and images are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

module.exports = upload;