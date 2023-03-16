const aws = require('aws-sdk');
const path = require('path');
const { db } = require('./server/db');

const s3 = new aws.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const DeleteS3Object = async (imageUrl) => {
  try {
    const imageName = path.basename(imageUrl);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageName,
    };
    await s3.deleteObject(params).promise();
  } catch (error) {
    // console.log('Error deleting s3 object: ', error);
  }
};

const deleteRoutes = async () => {
  try {
    await db.query(
      `DELETE FROM routes AS r WHERE (r.date < CURRENT_DATE - 15) AND NOT EXISTS (SELECT * FROM donations AS d WHERE d.route_id = r.id AND d.status != 'archived')`,
    );
  } catch (err) {
    // console.error('Error deleting routes: ', err);
  }
};

const deletePictures = async () => {
  try {
    const pictures = await db.query(
      `SELECT image_url FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
    );
    pictures.forEach((picture) => {
      // delete corresponding s3 object
      DeleteS3Object(picture.image_url);
    });
    // deletes the pictures from PNP database
    await db.query(
      `DELETE FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
    );
  } catch (err) {
    // console.error('Error deleting pictures: ', err);
  }
};

module.exports = { deleteRoutes, deletePictures, DeleteS3Object };
