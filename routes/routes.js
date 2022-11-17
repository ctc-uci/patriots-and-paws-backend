const express = require('express');
const { keysToCamel } = require('../common/utils');

const router = express.Router();
const {db} = require('../server/db');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newRoute = await db.query(
      `INSERT INTO routes (${data.driverId ? 'driver_id, ' : ''} id) 
      VALUES(${data.driverId ? `${data.driverId}, ` : ''} ${data.id}) RETURNING *;`,
    );
    res.status(200).json(keysToCamel(newRoute[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const allRoutes = await db.query(`SELECT * FROM routes;`);
    res.status(200).json(keysToCamel(allRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeInfo = await db.query(`SELECT * FROM routes WHERE id = $1;`, [routeId]);
    res.status(200).json(keysToCamel(routeInfo[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const {id ,driverId} = req.body;
    const updatedRoute = await db.query(`UPDATE routes SET 
    ${id ? `id = ${id}, ` : ''}
    ${driverId ? `driver_id = '${driverId}' ` : ''}
     WHERE id = ${routeId} RETURNING *;`);
    res.status(200).json(keysToCamel(updatedRoute[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const deletedRoute = await db.query(`DELETE FROM routes WHERE id = $1 RETURNING *;`, [
      routeId,
    ]);
    res.status(200).json(deletedRoute? keysToCamel(deletedRoute[0]) : []);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
