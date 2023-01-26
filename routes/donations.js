const express = require('express');
const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');
const { insertPicture } = require('../common/pictureUtils');
const { insertFurniture } = require('../common/furnitureUtils');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await db.query(
      `SELECT
        d.id, d.route_id, d.order_num, d.status,
        d.address_street, d.address_city, d.address_unit,
        d.address_zip, d.first_name, d.last_name, d.email,
        d.phone_num, d.notes, d.submitted_date,
        COALESCE(relation1.furniture, '{}') AS furniture,
	      COALESCE(relation2.pictures, '{}') AS pictures
      FROM donations AS d
      LEFT JOIN (SELECT f.donation_id,
              array_agg(json_build_object('id', f.id, 'name', f.name)) AS furniture
              FROM furniture AS f
              GROUP BY f.donation_id
            ) AS relation1
        ON relation1.donation_id = d.id
      LEFT JOIN (SELECT pics.donation_id,
              array_agg(json_build_object('id', pics.id, 'image_url', pics.image_url, 'notes', pics.notes)) AS pictures
              FROM pictures AS pics
              GROUP BY pics.donation_id
            ) AS relation2
        ON relation2.donation_id = d.id;`,
    );

    res.status(200).json(keysToCamel(allDonations));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get specific donation
router.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await db.query(
      `SELECT
        id,
        route_id,
        order_num,
        status,
        address_street,
        address_unit,
        address_city,
        address_zip,
        first_name,
        last_name,
        email,
        phone_num,
        notes,
        submitted_date
      FROM donations WHERE id = $(donationId);`,
      {
        donationId,
      },
    );
    const pictureRes = await db.query(`SELECT * FROM pictures WHERE donation_id = $(donationId);`, {
      donationId,
    });
    donation[0].pictures = pictureRes;

    const furnitureRes = await db.query(
      `SELECT * FROM furniture WHERE donation_id = $(donationId);`,
      { donationId },
    );
    donation[0].furniture = furnitureRes;
    res.status(200).json(keysToCamel(donation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create new donation
router.post('/', async (req, res) => {
  try {
    const {
      routeId,
      orderNum,
      status,
      addressStreet,
      addressUnit,
      addressCity,
      addressZip,
      firstName,
      lastName,
      email,
      phoneNum,
      notes,
      furniture,
      pictures,
    } = req.body;
    const submittedDate = new Date();
    const donation = await db.query(
      `INSERT INTO donations (
        ${routeId ? 'route_id, ' : ''}
        ${orderNum ? 'order_num, ' : ''}
        address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        submitted_date, last_edited_date, status
        )
      VALUES (
        ${routeId ? '$(routeId), ' : ''}
        ${orderNum ? '$(orderNum), ' : ''}
        $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        $(submittedDate), $(submittedDate), $(status)
      )
      RETURNING *;`,
      {
        routeId,
        orderNum,
        status,
        addressStreet,
        addressUnit,
        addressCity,
        addressZip,
        firstName,
        lastName,
        email,
        phoneNum,
        notes,
        submittedDate,
      },
    );
    pictures.forEach(async ({ imageUrl, notes: picNotes }) => {
      await insertPicture(donation[0].id, imageUrl, picNotes);
    });
    furniture.forEach(async ({ name }) => {
      await insertFurniture(donation[0].id, name);
    });

    res.status(200).send(keysToCamel(donation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update info for a specific donation
router.put('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const {
      routeId,
      orderNum,
      status,
      addressStreet,
      addressUnit,
      addressCity,
      addressZip,
      firstName,
      lastName,
      email,
      phoneNum,
      notes,
    } = req.body;
    const currDate = new Date();
    const donation = await db.query(
      `UPDATE donations
      SET
        ${routeId ? 'route_id = $(routeId), ' : ''}
        ${orderNum ? 'order_num = $(orderNum), ' : ''}
        ${status ? 'status = $(status), ' : ''}
        ${addressStreet ? 'address_street = $(addressStreet), ' : ''}
        ${addressUnit ? 'address_unit = $(addressUnit), ' : ''}
        ${addressCity ? 'address_city = $(addressCity), ' : ''}
        ${addressZip ? 'address_zip = $(addressZip), ' : ''}
        ${firstName ? 'first_name = $(firstName), ' : ''}
        ${lastName ? 'last_name = $(lastName), ' : ''}
        ${email ? 'email = $(email), ' : ''}
        ${phoneNum ? 'phone_num = $(phoneNum), ' : ''}
        ${notes ? 'notes = $(notes), ' : ''}
        last_edited_date = $(currDate)
      WHERE id = $(donationId)
      RETURNING *;`,
      {
        donationId,
        routeId,
        orderNum,
        status,
        addressStreet,
        addressUnit,
        addressCity,
        addressZip,
        firstName,
        lastName,
        email,
        phoneNum,
        notes,
        currDate,
      },
    );
    res.status(200).send(keysToCamel(donation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// delete specified donation
router.delete('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const deletedDonation = await db.query(
      `DELETE from donations WHERE id = $(donationId) RETURNING *;`,
      { donationId },
    );
    res.status(200).send(keysToCamel(deletedDonation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
