const express = require('express');
const { db } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const furniture = await db.query('SELECT * FROM furniture_options');
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, accepted } = req.body;
    const furniture = await db.query(
      `INSERT INTO furniture_options (name, accepted)
        VALUES (
            $(name), $(accepted)
        )
        RETURNING *;`,
      {
        name,
        accepted,
      },
    );
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const deletedFurniture = await db.query(
      `DELETE FROM furniture_options
            WHERE name = $(name)
            RETURNING *`,
      {
        name,
      },
    );
    res.status(200).json(keysToCamel(deletedFurniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
