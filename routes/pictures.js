import { keysToCamel } from '../common/utils';

const express = require('express');
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
    const { id, furnitureId, imageURL } = req.body;
    const pictures = await db.query(
      `INSERT INTO pictures (
        id, furnitureId, imageURL,
        )
      VALUES (
        $(id), $(furnitureId), $(imageURL)
        )
      RETURNING *;`,
      {
        id,
        furnitureId,
        imageURL,
      },
    );
    res.status(200).json(keysToCamel(pictures));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:picturesId', async (req, res) => {
  const { picturesID } = req.params;
  try {
    const { id, furnitureId, imageURL } = req.body;
    const updatedPictures = await db.query(
      `UPDATE pictures (
        id, furnitureId, imageURL,
        )
      SET
        id = $(id),
        furnitureId = $(furnitureId),
        imageURL = $(imageURL)
      WHERE id = $(picturesID)
      RETURNING *;`,
      {
        id,
        furnitureId,
        imageURL,
        picturesID,
      },
    );
    res.status(200).json(updatedPictures);
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
