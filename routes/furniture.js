const express = require('express');

const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const furniture = await db.query('SELECT * FROM furniture');
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { donationId, name, count } = req.body;
    const furniture = await db.query(
      `INSERT INTO furniture ( donation_id, name, count)
        VALUES (
          $(donationId), $(name), $(count)
          )
        RETURNING *;`,
      {
        donationId,
        name,
        count,
      },
    );
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:furnitureId', async (req, res) => {
  try {
    const { furnitureId } = req.params;
    const { donationId, name, count } = req.body;
    const updatedFurniture = await db.query(
      `UPDATE furniture
         SET
            ${donationId ? 'donation_id = $(donationId), ' : ''}
            ${name ? 'name = $(name),' : ''}
            ${count ? 'count = $(count),' : ''}
            id = $(furnitureId)
        WHERE id = $(furnitureId)
        RETURNING *`,
      {
        donationId,
        name,
        count,
        furnitureId,
      },
    );
    res.status(200).json(keysToCamel(updatedFurniture));
  } catch (err) {
    res.status(500).send(err.message);
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
    res.status(200).json(keysToCamel(deletedFurniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
