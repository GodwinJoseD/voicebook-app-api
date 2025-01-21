// utils/upload.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./awsConfig'); // AWS S3 configuration

// Multer storage configuration for uploading directly to S3
const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME, // S3 Bucket Name
    acl: 'public-read', // Allows files to be publicly readable
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, `stories/${Date.now()}-${file.originalname}`); // Unique file key
    },
});

// Multer setup to handle audio uploads (limiting file size and validating mime type)
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    },
});

module.exports = upload;
