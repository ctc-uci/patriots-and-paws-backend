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
        donation_id,
        ${notes ? 'notes, ' : ''}
        image_url
        )
      VALUES (
        $(donationId),
        ${notes ? '$(notes), ' : ''}
        $(imageUrl)
        )
      RETURNING *;`,
      {
        donationId,
        imageUrl,
        notes,
      },
    );
    res.status(200).json(keysToCamel(pictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:picturesId', async (req, res) => {
  try {
    const { picturesID } = req.params;
    const { donationId, imageUrl, notes } = req.body;
    const updatedPictures = await db.query(
      `UPDATE pictures
      SET
        donation_id = $(donationId),
        ${notes ? 'notes = $(notes), ' : ''}
        image_url = $(imageUrl)
      WHERE id = $(picturesID)
      RETURNING *;`,
      {
        donationId,
        imageUrl,
        notes,
        picturesID,
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
