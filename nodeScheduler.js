const { db } = require('./server/db');

const deleteRoutes = async () => {
  try {
    await db.query(
      `DELETE FROM routes WHERE (date < CURRENT_DATE - 15) OR (id IN (SELECT route_id FROM donations WHERE status = 'archived'))`,
    );
  } catch (err) {
    console.error('Error deleting routes: ', err);
  }
};

// TODO: delete test code later
const testFunction = async () => {
  try {
    // await db.query(
    //   `DELETE FROM routes WHERE (date < CURRENT_DATE - 15) OR (id IN (SELECT route_id FROM donations WHERE status = 'archived'))`,
    // );
    console.log('Job has run');
  } catch (err) {
    console.error('Error deleting routes: ', err);
  }
};

module.exports = { deleteRoutes, testFunction };
