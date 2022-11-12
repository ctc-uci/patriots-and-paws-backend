const express = require('express');
const { pool, db } = require('../server/db');

const router = express.Router();
// await pool.query('query')


router.get('/', async (req, res) => {
  try {
    const furniture = await pool.query('SELECT * FROM furniture');
    res.status(200).json(furniture.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/', async (req, res) => {
try {
    const {
        id,
        donation_id,
        name,
        description,
        notes,
        } = req.body;
    const furniture = await pool.query(
        `INSERT INTO furniture (id, donation_id, name,
            ${description ? ', description' : ''}
            ${notes ? ', notes' : ''})
        VALUES (
            $(id), $(donation_id), $(name),
            ${description ? '$(description) ' : ''}
            ${notes ? '$(notes) ' : ''})
        RETURNING *;`,
    {
        id,
        donation_id,
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

router.put('/:furnitureID', async (req, res) => {
try {
    const { furnitureID } = req.params;
    const {
        id,
        donation_id,
        name,
        description,
        notes,
        } = req.body;
    const updatedFurniture = await pool.query(
        `UPDATE furniture
         SET
            id = $(id),
            donation_id = $(donation_id),
            name = $(name)
            ${description ? ', description = $(description)' : ''}
            ${notes ? ', notes = $(notes)' : ''}
        WHERE id = $(furnitureID)
        RETURNING *`,
        {
            id,
            donation_id,
            name,
            description,
            notes,
            furnitureID,
        },
        );
    res.status(200).json(updatedFurniture.rows);
    } catch (err) {
    res.status(400).send(err.message);
    }
});

router.delete('/:furnitureID', async (req, res) => {
    try {
        const { furnitureID } = req.params;
        const deletedFurniture = await pool.query(
            `DELETE FROM furniture
            WHERE id = $(furnitureID)
            RETURNING *`,
            {
                furnitureID,
            },
        );
        res.status(200).json(deletedFurniture.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;
