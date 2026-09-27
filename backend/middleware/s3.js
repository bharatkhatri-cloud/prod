// s3.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Replace with your AWS access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Replace with your AWS secret key
    region: process.env.AWS_REGION  // Replace with your AWS region
});

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,  
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
        limits: { fileSize: '50mb' }
    })
});

module.exports = upload;
