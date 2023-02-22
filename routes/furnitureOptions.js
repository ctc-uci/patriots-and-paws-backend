const express = require('express');
const { db } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const furnitureOptionsRouter = express.Router();

furnitureOptionsRouter.get('/', async (req, res) => {
  try {
    const furniture = await db.query('SELECT * FROM furniture_options');
    res.status(200).json(keysToCamel(furniture));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/*
req.body = {
  ...,
  furniture: [{furniture obj 1}, ...]
}

furniture = [
  {
    name: chair,
    accepted: false
  },
  ...
]
nameArray = furniture.map { name:  } => name
*/

furnitureOptionsRouter.post('/', async (req, res) => {
  try {
    const { options, deleted } = req.body;
    console.log(deleted);

    const furnitureOptions = await db.query(
      `INSERT INTO furniture_options(name, accepted)
        SELECT "name", accepted
        FROM
            json_to_recordset($(options:json))
        AS data("name" text, accepted boolean)
        RETURNING *;`,
      {
        options,
      },
    );
    const deletedOptions = await db.query(
      `
      DELETE FROM furniture_options
      WHERE name IN $(deleted:csv)
      RETURNING *;
      `,
      {
        deleted,
      },
    );

    res.status(200).json(keysToCamel({ options: furnitureOptions, deleted: deletedOptions }));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

furnitureOptionsRouter.delete('/:name', async (req, res) => {
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

module.exports = furnitureOptionsRouter;
