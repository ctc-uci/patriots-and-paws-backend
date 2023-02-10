const express = require('express');
const { db } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const furniture = await db.query('SELECT * FROM furnitureOptions');
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, accepted } = req.body;
    const furniture = await db.query(
      `INSERT INTO furnitureOptions (id, name, accepted
        VALUES (
            $(id), $(name), $(accepted)
        )
        RETURNING *;`,
      {
        id,
        name,
        accepted,
      },
    );
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:furnitureOptionsId', async (req, res) => {
  try {
    const { furnitureOptionsId } = req.params;
    const { id, name, accepted } = req.body;
    const updatedFurniture = await db.query(
      `UPDATE furnitureOptions
         SET
            id = $(id),
            name = $(name)
            accepted = $(accepted)
        WHERE id = $(furnitureOptionsId)
        RETURNING *`,
      {
        id,
        name,
        accepted,
        furnitureOptionsId,
      },
    );
    res.status(200).json(keysToCamel(updatedFurniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:furnitureOptionsId', async (req, res) => {
  try {
    const { furnitureOptionsId } = req.params;
    const deletedFurniture = await db.query(
      `DELETE FROM furnitureOptions
            WHERE id = $(furnitureOptionsId)
            RETURNING *`,
      {
        furnitureOptionsId,
      },
    );
    res.status(200).json(keysToCamel(deletedFurniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
