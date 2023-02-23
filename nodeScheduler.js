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
      Expires: 60,
    };
    await s3.deleteObject(params);
    console.log('Deleted: ', params);
  } catch (error) {
    console.log('Error deleting s3 object');
  }
};

const deleteRoutes = async () => {
  try {
    await db.query(
      `DELETE FROM routes WHERE (date < CURRENT_DATE - 15) AND (id IN (SELECT route_id FROM donations WHERE status = 'archived'))`,
    );
  } catch (err) {
    console.error('Error deleting routes: ', err);
  }
};

const deletePictures = async () => {
  try {
    await db
      .query(
        `SELECT image_url FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
      )
      .forEach((picture) => {
        // delete corresponding s3 object
        DeleteS3Object(picture.image_url);
      });
    // deletes the pictures
    await db.query(
      `DELETE FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
    );
  } catch (err) {
    console.error('Error deleting pictures: ', err);
  }
};

// TODO: delete test code later
const testFunction = async () => {
  try {
    const test = await db.query(
      `SELECT image_url FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
    );
    test.forEach((picture) => {
      // delete corresponding s3 object
      DeleteS3Object(picture.image_url);
    });
    // deletes the pictures
    // await db.query(
    //   `DELETE FROM pictures WHERE ( donation_id IN (SELECT id FROM donations WHERE status = 'archived' AND last_edited_date < CURRENT_DATE - 30))`,
    // );
  } catch (err) {
    console.error('Error deleting pictures: ', err);
  }
};

module.exports = { deleteRoutes, testFunction, deletePictures };
