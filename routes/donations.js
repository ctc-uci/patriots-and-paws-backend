const express = require('express');
const { customAlphabet } = require('nanoid');
const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await db.query(`SELECT * FROM donations;`);
    res.status(200).json(keysToCamel(allDonations));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get specific donation
router.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await db.query(`SELECT * from donations WHERE id = $(donationId);`, {
      donationId,
    });
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
      date,
    } = req.body;
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6);
    const id = nanoid();
    const donation = await db.query(
      `INSERT INTO donations (
        id,
        ${routeId ? 'route_id, ' : ''}
        ${orderNum ? 'order_num, ' : ''}
        address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        ${date ? 'date, ' : ''}
        status
        )
      VALUES (
        $(id),
        ${routeId ? '$(routeId), ' : ''}
        ${orderNum ? '$(orderNum), ' : ''}
        $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        ${date ? '$(date), ' : ''}
        $(status)
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
    res.status(200).send(keysToCamel(donation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, donationId } = req.body;
    const donation = await db.query(`SELECT email FROM donations WHERE id = $(donationId);`, {
      donationId,
    });

    if (donation.length !== 0 && donation[0].email === email) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
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
