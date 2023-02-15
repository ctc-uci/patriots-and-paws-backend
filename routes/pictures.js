const express = require('express');

const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pictures = await db.query('SELECT * FROM pictures');
    res.status(200).json(keysToCamel(pictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { donationId, imageUrl, notes } = req.body;
    const pictures = await db.query(
      `INSERT INTO pictures (
        donation_id, ${notes ? 'notes, ' : ''} image_url
        )
      VALUES (
        $(donationId), ${notes ? '$(notes), ' : ''} $(imageURL)
        )
      RETURNING *;`,
      {
        donationId,
        notes,
        imageUrl,
      },
    );
    res.status(200).json(keysToCamel(pictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:picturesId', async (req, res) => {
  try {
    const { picturesId } = req.params;
    const { imageUrl, notes } = req.body;
    const updatedPictures = await db.query(
      `UPDATE pictures
      SET
        ${notes ? 'notes = $(notes), ' : ''}
        ${imageUrl ? 'image_url = $(imageUrl), ' : ''}
        id = $(picturesId)
      WHERE id = $(picturesId)
      RETURNING *;`,
      {
        imageUrl,
        notes,
        picturesId,
      },
    );
    res.status(200).json(keysToCamel(updatedPictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:picturesId', async (req, res) => {
  try {
    const { picturesID } = req.params;
    const deletedPictures = await db.query(
      `DELETE FROM pictures
        WHERE id = $(picturesID)
        RETURNING *`,
      {
        picturesID,
      },
    );
    res.status(200).json(keysToCamel(deletedPictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
