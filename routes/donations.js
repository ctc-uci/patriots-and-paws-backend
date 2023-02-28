const express = require('express');
const { keysToCamel, donationsQuery } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await db.query(`${donationsQuery};`);

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
      `SELECT id,
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
        submitted_date,
        COALESCE(relation1.furniture, '{}') AS furniture,
        COALESCE(relation2.pictures, '{}') AS pictures
      FROM (SELECT * FROM donations WHERE id = $(donationId)) as donation
      LEFT JOIN (SELECT f.donation_id,
              array_agg(json_build_object('id', f.id, 'name', f.name, 'count', f.count)) AS furniture
              FROM furniture AS f
              GROUP BY f.donation_id
            ) AS relation1
        ON relation1.donation_id = donation.id
      LEFT JOIN (SELECT pics.donation_id,
              array_agg(json_build_object('id', pics.id, 'image_url', pics.image_url, 'notes', pics.notes)) AS pictures
              FROM pictures AS pics
              GROUP BY pics.donation_id
            ) AS relation2
        ON relation2.donation_id = donation.id;`,
      {
        donationId,
      },
    );
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
  // add update furniture & pictures (can do this in multiple queries, not super inefficient as we won't be updating more than a certain number of rows at a time)
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
