const express = require('express');
const { pool, db } = require('../server/db');
const router = express.Router();

// await pool.query('query')


router.get('/', async (req, res) => {
  try {
    const pictures = await pool.query('SELECT * FROM pictures');
    res.status(200).json(pictures.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      id,
      furniture_id,
      image_url,
    } = req.body;
    const pictures = await pool.query(
      `INSERT INTO pictures (
        id, furniture_id, image_url,
        )
      VALUES (
        $(id), $(furniture_id), $(image_url)
        )
      RETURNING *;`,
      {
        id,
        furniture_id,
        image_url,
      }
    );
    res.status(200).json(pictures.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:picturesId', async (req, res) => {
  const { picturesId } = req.params;
  try {
    const {
      id,
      furniture_id,
      image_url,
    } = req.body;
    const updatedPictures = await pool.query(
      `UPDATE pictures (
        id, furniture_id, image_url,
        )
      SET
        id = $(id),
        furniture_id = $(furniture_id),
        image_url = $(image_url)
      WHERE id = $(picturesID)
      RETURNING *;`,
      {
        id,
        furniture_id,
        image_url,
        picturesId,
      }
    );
    res.status(200).json(updatedPictures.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete('/:picturesId', async (req, res) => {
  try {
    const { picturesID } = req.params;
    const deletedPictures = await pool.query(
        `DELETE FROM pictures
        WHERE id = $(picturesID)
        RETURNING *`,
        {
            picturesID,
        },
    );
    res.status(200).json(deletedPictures.rows);
} catch (err) {
    res.status(400).send(err.message);
}
});

module.exports = router;
