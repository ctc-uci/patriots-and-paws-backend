const { db } = require('../server/db');

// put picture helper function here
const insertPicture = async (donationId, imageURL, notes) => {
  return db.query(
    `INSERT INTO pictures (
      donation_id, image_url, notes
      )
    VALUES (
      $(donationId), $(imageURL), $(notes)
      )
    RETURNING *;`,
    {
      donationId,
      imageURL,
      notes,
    },
  );
};

module.exports = { insertPicture };
