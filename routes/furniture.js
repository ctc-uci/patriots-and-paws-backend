const express = require('express');
const { db } = require('../server/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const furniture = await db.query('SELECT * FROM furniture');
    res.status(200).json(furniture.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, donationId, name, description, notes } = req.body;
    const furniture = await db.query(
      `INSERT INTO furniture (id, donationId, name,
            ${description ? ', description' : ''}
            ${notes ? ', notes' : ''})
        VALUES (
            $(id), $(donationId), $(name),
            ${description ? '$(description) ' : ''}
            ${notes ? '$(notes) ' : ''})
        RETURNING *;`,
      {
        id,
        donationId,
        name,
        description,
        notes,
      },
    );
    res.status(200).json(furniture.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:furnitureId', async (req, res) => {
  try {
    const { furnitureId } = req.params;
    const { id, donationId, name, description, notes } = req.body;
    const updatedFurniture = await db.query(
      `UPDATE furniture
         SET
            id = $(id),
            donationId = $(donationId),
            name = $(name)
            ${description ? ', description = $(description)' : ''}
            ${notes ? ', notes = $(notes)' : ''}
        WHERE id = $(furnitureId)
        RETURNING *`,
      {
        id,
        donationId,
        name,
        description,
        notes,
        furnitureId,
      },
    );
    res.status(200).json(updatedFurniture.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete('/:furnitureId', async (req, res) => {
  try {
    const { furnitureId } = req.params;
    const deletedFurniture = await db.query(
      `DELETE FROM furniture
            WHERE id = $(furnitureId)
            RETURNING *`,
      {
        furnitureId,
      },
    );
    res.status(200).json(deletedFurniture.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
