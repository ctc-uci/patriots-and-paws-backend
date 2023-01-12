const { db } = require('../server/db');

// furniture helper function
const insertFurniture = async (donationId, name) => {
  return db.query(
    `INSERT INTO furniture ( donation_id, name)
      VALUES (
        $(donationId), $(name)
        )
      RETURNING *;`,
    {
      donationId,
      name,
    },
  );
};

module.exports = { insertFurniture };
