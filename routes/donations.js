const express = require('express');
const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await db.query(
      `SELECT
      d.id, d.route_id, d.order_num, d.status,
      d.address_street, d.address_city, d.address_unit,
      d.address_zip, d.first_name, d.last_name, d.email,
      d.phone_num, d.notes, d.submitted_date, relation3.pickup_date,
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
      ON relation2.donation_id = d.id
  LEFT JOIN (
        SELECT id AS route_id, date as pickup_date
        FROM routes
      ) AS relation3
    ON relation3.route_id = d.route_id;`,
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
    const status = 'pending';
    const submittedDate = new Date();
    const donation = await db.query(
      `INSERT INTO donations (
        address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        submitted_date, last_edited_date, status
        )
      VALUES (
        $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        $(submittedDate), $(submittedDate), $(status)
      )
      RETURNING *;`,
      {
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

    const donationId = donation[0].id;

    const picturesRes = await db.query(
      `INSERT INTO pictures(donation_id, image_url, notes)
      SELECT $(donationId), "imageUrl", notes
      FROM
          json_to_recordset($(pictures:json))
      AS data("imageUrl" text, notes text)
      RETURNING *;`,
      { donationId, pictures },
    );

    const furnitureRes = await db.query(
      `INSERT INTO furniture(donation_id, name, count)
      SELECT $(donationId), name, count
      FROM
          json_to_recordset($(furniture:json))
      AS data(name text, count integer)
      RETURNING *;`,
      { donationId, furniture },
    );

    donation[0].pictures = picturesRes;
    donation[0].furniture = furnitureRes;

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
