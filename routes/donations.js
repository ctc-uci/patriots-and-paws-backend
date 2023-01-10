const express = require('express');
const { keysToCamel } = require('../common/utils');
const { db } = require('../server/db');

const router = express.Router();

// get all donation rows
router.get('/', async (req, res) => {
  try {
    const allDonations = await db.query(
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
      FROM donations;`,
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
      submittedDate,
    } = req.body;
    const donation = await db.query(
      `INSERT INTO donations (
        ${routeId ? 'route_id, ' : ''}
        ${orderNum ? 'order_num, ' : ''}
        address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        ${submittedDate ? 'submitted_date, ' : ''}
        ${submittedDate ? 'last_edited_date, ' : ''}
        status
        )
      VALUES (
        ${routeId ? '$(routeId), ' : ''}
        ${orderNum ? '$(orderNum), ' : ''}
        $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        ${submittedDate ? '$(submittedDate), ' : ''}
        ${submittedDate ? '$(submittedDate), ' : ''}
        $(status)
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
      submittedDate,
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
        ${submittedDate ? 'submitted_date = $(submittedDate), ' : ''}
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
        submittedDate,
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
