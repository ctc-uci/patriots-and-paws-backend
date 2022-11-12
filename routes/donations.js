const express = require('express');

const { pool, db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await pool.query(`SELECT * FROM Donations`);
    res.status(200).json(allDonations.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get specific donation
router.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await pool.query(`SELECT * FROM Donations WHERE id = ${donationId}`);
    res.status(200).json(donation.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create new donation
router.post('/', async (req, res) => {
  try {
    const {
      id,
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
      date,
    } = req.body;
    const donation = await db.query(
      `INSERT INTO donations (
        id,
        ${routeId ? 'route_id, ' : ''}
        ${orderNum ? 'order_num, ' : ''}
        status, address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        ${date ? 'date ' : ''}
        )
      VALUES ($(id),
        ${routeId ? '$(routeId), ' : ''}
        ${orderNum ? '$(orderNum), ' : ''}
        $(status), $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        ${date ? '$(date) ' : ''}
      )
      RETURNING *;`,
      {
        id,
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
        date,
      },
    );
    res.status(200).send(donation[0]);
  } catch (err) {
    res.status(400).send(err.message);
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
      date,
    } = req.body;
    const donation = await db.query(
      `UPDATE Donations
      SET
        ${routeId ? 'route_id = $(routeId), ' : ''}
        ${orderNum ? 'order_num = $(orderNum), ' : ''}
        status = $(status),
        address_street = $(addressStreet),
        ${addressUnit ? 'address_unit = $(addressUnit), ' : ''}
        address_city = $(addressCity),
        address_zip = $(addressZip),
        first_name = $(firstName),
        last_name = $(lastName),
        email = $(email),
        phone_num = $(phoneNum),
        ${notes ? 'notes = $(notes), ' : ''}
        ${date ? 'date = $(date) ' : ''}
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
        date,
      },
    );
    res.status(200).send(donation[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete specified donation
router.delete('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const deletedDonation = await pool.query(
      `DELETE FROM Donations WHERE id = ${donationId} RETURNING *`,
    );
    res.status(200).send(deletedDonation.rows[0]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
