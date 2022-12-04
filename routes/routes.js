const express = require('express');
const { keysToCamel } = require('../common/utils');

const routesRouter = express.Router();
const { db } = require('../server/db');

routesRouter.use(express.json());

routesRouter.post('/', async (req, res) => {
  try {
    const { id, driverId } = req.body;
    const newRoute = await db.query(
      `INSERT INTO routes (${driverId ? 'driver_id, ' : ''} id) 
      VALUES(${driverId ? '$(driverId), ' : ''} $(id)) RETURNING *;`,
      { driverId, id },
    );
    res.status(200).json(keysToCamel(newRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/', async (req, res) => {
  try {
    const allRoutes = await db.query(`SELECT * FROM routes;`);
    res.status(200).json(keysToCamel(allRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeInfo = await db.query(`SELECT * FROM routes WHERE id = $(routeId);`, { routeId });
    res.status(200).json(keysToCamel(routeInfo));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { driverId } = req.body;
    const updatedRoute = await db.query(
      `UPDATE routes SET 
    ${driverId ? 'driver_id = $(driverId) ' : ''}
     WHERE id = $(routeId) RETURNING *;`,
      { driverId, routeId },
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
