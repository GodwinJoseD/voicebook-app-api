const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const dotenv = require('dotenv');

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.S3_POSTS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    const response = await upload.done();
    return { Key: fileName, Location: `https://${process.env.S3_POSTS_BUCKET_NAME}.s3.amazonaws.com/${fileName}` };
  } catch (error) {
    console.error('Error uploading to S3', error);
    throw new Error('Error uploading to S3');
  }
};
const uploadToStoryS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.S3_STORIES_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    const response = await upload.done();
    return { Key: fileName, Location: `https://${process.env.S3_STORIES_BUCKET_NAME}.s3.amazonaws.com/${fileName}` };
  } catch (error) {
    console.error('Error uploading to S3', error);
    throw new Error('Error uploading to S3');
  }
};

module.exports = {uploadToS3,uploadToStoryS3};