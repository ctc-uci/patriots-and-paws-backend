const express = require('express');
const { keysToCamel } = require('../common/utils');

const routesRouter = express.Router();
const { db } = require('../server/db');

routesRouter.use(express.json());

routesRouter.post('/', async (req, res) => {
  try {
    const { id, driverId, name, date } = req.body;
    const newRoute = await db.query(
      `INSERT INTO routes (id, driver_id, name, date)
      VALUES($(id), $(driverId), $(name), $(date)) RETURNING *;`,
      { id, driverId, name, date },
    );
    res.status(200).json(keysToCamel(newRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/', async (req, res) => {
  try {
    const allRoutes = await db.query(
      `SELECT
        routes.id, routes.driver_id, routes.name, routes.date,
        users.role, users.first_name, users.last_name,
        users.phone_number, users.email
      FROM routes
      LEFT JOIN users ON routes.driver_id = users.id;`,
    );
    res.status(200).json(keysToCamel(allRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const driverRoutes = await db.query(`SELECT * FROM routes WHERE driver_id = $(driverId);`, {
      driverId,
    });
    res.status(200).json(keysToCamel(driverRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeInfo = await db.query(`SELECT * FROM routes WHERE id = $(routeId);`, { routeId });

    const donationRes = await db.query(`SELECT * FROM donations WHERE routeId = $(routeId);`, {
      routeId,
    });
    routeInfo[0].pictures = donationRes;

    res.status(200).json(keysToCamel(routeInfo));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { driverId, name, date } = req.body;
    const updatedRoute = await db.query(
      `UPDATE routes SET
    ${driverId ? 'driver_id = $(driverId), ' : ''}
    ${name ? 'name = $(name), ' : ''}
    ${date ? 'date = $(date), ' : ''}
    id = $(routeId)
     WHERE id = $(routeId) RETURNING *;`,
      { driverId, routeId, name, date },
    );
    res.status(200).json(keysToCamel(updatedRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.delete('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const deletedRoute = await db.query(`DELETE FROM routes WHERE id = $(routeId) RETURNING *;`, {
      routeId,
    });

    res.status(200).json(keysToCamel(deletedRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = routesRouter;
