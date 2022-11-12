const express = require('express');

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
    res.status(200).json(newRoute.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const getRoutes = await pool.query(`SELECT * FROM routes;`);
    res.status(200).json(getRoutes.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const getRoute = await pool.query(`SELECT * FROM routes WHERE id = ${routeId};`);
    res.status(200).json(getRoute.rows[0]);
  } catch (err) {
    console.log(err);
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
    res.status(200).json(updateRoute.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.delete('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const deleteRoute = await pool.query(`DELETE FROM routes WHERE id = ${routeId} RETURNING *;`);
    res.status(200).json(deleteRoute.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

module.exports = router;
