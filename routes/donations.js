const express = require('express');
const { customAlphabet } = require('nanoid');
const { keysToCamel, updatePictures, updateFurniture } = require('../common/utils');
const { DeleteS3Object } = require('../nodeScheduler');
const { db } = require('../server/db');

const donationsRouter = express.Router();

// define donation statuses
const {
  PENDING,
  APPROVAL_REQUESTED,
  CHANGES_REQUESTED,
  SCHEDULING,
  SCHEDULED,
  PICKED_UP,
  RESCHEDULE,
} = {
  PENDING: 'pending',
  APPROVAL_REQUESTED: 'approval requested',
  CHANGES_REQUESTED: 'changes requested',
  SCHEDULING: 'scheduling',
  SCHEDULED: 'scheduled',
  PICKED_UP: 'picked up',
  RESCHEDULE: 'reschedule',
};

const tabStatuses = [
  {
    tab: 'admin',
    statuses: [PENDING, CHANGES_REQUESTED, RESCHEDULE, APPROVAL_REQUESTED],
  },
  { tab: 'donor', statuses: [SCHEDULING] },
  { tab: 'pickup', statuses: [SCHEDULED] },
  { tab: 'archive', statuses: [PICKED_UP] },
];

// get all donation rows
donationsRouter.get('/', async (req, res) => {
  const { numDonations, pageNum, statusGroup } = req.query;

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
            array_agg(json_build_object('id', f.id, 'name', f.name, 'count', f.count)) AS furniture
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
      ON relation3.route_id = d.route_id
    ${statusGroup ? `WHERE d.status in $(statusGroup)` : ''}
    ${numDonations ? `ORDER BY id` : ''}
    ${numDonations ? `LIMIT ${numDonations}` : ''}
    ${pageNum ? `OFFSET ${(pageNum - 1) * numDonations}` : ''}
    ;`,
      { numDonations, pageNum, statusGroup },
    );

    res.status(200).json(keysToCamel(allDonations));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get total number of donations for specific tab
donationsRouter.get('/total', async (req, res) => {
  try {
    const { tab } = req.query;
    // find right statuses for tab or have empty array of statuses if not found
    const { statuses } = tabStatuses.find((tabStatus) => tabStatus.tab === tab) || { statuses: [] };
    const tabTotalDonations = await db.query(
      `SELECT COUNT(DISTINCT id) FROM donations WHERE status in (${statuses
        .map((status) => `'${status}'`)
        .join(',')})`,
    );
    res.status(200).json(keysToCamel(tabTotalDonations));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get specific donation
donationsRouter.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await db.query(
      `SELECT id,
        donation.route_id,
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
        relation3.pickup_date,
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
        ON relation2.donation_id = donation.id
        LEFT JOIN (
          SELECT id AS route_id, date as pickup_date
          FROM routes
        ) AS relation3
        ON relation3.route_id = donation.route_id;`,
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
donationsRouter.post('/', async (req, res) => {
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
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6);
    const id = nanoid();
    const status = 'pending';
    const submittedDate = new Date();
    const donation = await db.query(
      `INSERT INTO donations (
        id, address_street,
        ${addressUnit ? 'address_unit, ' : ''}
        address_city, address_zip, first_name,
        last_name, email, phone_num,
        ${notes ? 'notes, ' : ''}
        submitted_date, last_edited_date, status
        )
      VALUES (
        $(id), $(addressStreet),
        ${addressUnit ? '$(addressUnit), ' : ''}
        $(addressCity), $(addressZip), $(firstName),
        $(lastName), $(email), $(phoneNum),
        ${notes ? '$(notes), ' : ''}
        $(submittedDate), $(submittedDate), $(status)
      )
      RETURNING *;`,
      {
        id,
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

donationsRouter.post('/verify', async (req, res) => {
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

donationsRouter.post('/assign-route', async (req, res) => {
  try {
    const { donationId, routeId } = req.body;
    const donation = await db.query(
      `UPDATE donations
      SET order_num = (SELECT COUNT(*) FROM donations WHERE route_id = $(routeId)) + 1,
        route_id = $(routeId)
      where id = $(donationId)
      returning *;`,
      {
        donationId,
        routeId,
      },
    );
    res.status(200).send(keysToCamel(donation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update info for a specific donation
donationsRouter.put('/:donationId', async (req, res) => {
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
      pictures,
      furniture,
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

    if (pictures) {
      donation[0].pictures = await updatePictures(pictures, donationId);
    }

    if (furniture) {
      donation[0].furniture = await updateFurniture(furniture, donationId);
    }

    res.status(200).send(keysToCamel(donation));
  } catch (err) {
    // console.log(err.message);
    res.status(500).send(err.message);
  }
});

// delete specified donation
donationsRouter.delete('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const pictures = await db.query(
      `SELECT image_url FROM pictures WHERE donation_id = $(donationId)`,
      { donationId },
    );
    pictures.map((picture) => DeleteS3Object(picture.image_url));
    const deletedDonation = await db.query(
      `DELETE from donations WHERE id = $(donationId) RETURNING *;`,
      { donationId },
    );
    res.status(200).send(keysToCamel(deletedDonation));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = donationsRouter;
