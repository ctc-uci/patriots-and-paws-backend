const express = require('express');
const { keysToCamel } = require('../common/utils');
const { pool, db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await pool.query(`SELECT * FROM donations`);
    res.status(200).json(keysToCamel(allDonations.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get specific donation
router.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await pool.query(`SELECT * from donations WHERE id = $1`, [donationId]);
    res.status(200).json(keysToCamel(donation.rows));
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
        ${routeId ? 'route_id, ' : ''}
        ${orderNum ? 'order_num, ' : ''}
        status, address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        ${date ? 'date, ' : ''}
        id
        )
      VALUES (
        ${routeId ? '$(routeId), ' : ''}
        ${orderNum ? '$(orderNum), ' : ''}
        $(status), $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        ${date ? '$(date), ' : ''}
        $(id)
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
    res.status(200).send(keysToCamel(donation[0]));
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
        ${date ? 'date = $(date), ' : ''}
        id = $(donationId)
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
    res.status(200).send(keysToCamel(donation[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete specified donation
router.delete('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const deletedDonation = await pool.query(`DELETE from donations WHERE id = $1 RETURNING *`, [
      donationId,
    ]);
    res.status(200).send(keysToCamel(deletedDonation.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
