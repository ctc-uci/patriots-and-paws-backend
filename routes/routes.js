const express = require('express');
const { keysToCamel } = require('../common/utils');

const router = express.Router();
const { pool } = require('../server/db');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newRoute = await pool.query(
      `INSERT INTO routes (${data.driverId ? 'driver_id, ' : ''} id) 
      VALUES(${data.driverId ? `${data.driverId}, ` : ''} ${data.id}) RETURNING *;`,
    );
    res.status(200).json(keysToCamel(newRoute.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const allRoutes = await pool.query(`SELECT * FROM routes;`);
    res.status(200).json(keysToCamel(allRoutes.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeInfo = await pool.query(`SELECT * FROM routes WHERE id = $1;`, [routeId]);
    res.status(200).json(keysToCamel(routeInfo.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const data = req.body;
    const updateRoute = await pool.query(`UPDATE routes SET 
    ${data.id ? `id = ${data.id}, ` : ''}
    ${data.driverId ? `driver_id = '${data.driverId}' ` : ''}
     WHERE id = ${routeId} RETURNING *;`);
    res.status(200).json(keysToCamel(updateRoute.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const deleteRoute = await pool.query(`DELETE FROM routes WHERE id = $1 RETURNING *;`, [
      routeId,
    ]);
    res.status(200).json(keysToCamel(deleteRoute.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
