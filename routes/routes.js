const express = require('express');
const { keysToCamel, donationsQuery } = require('../common/utils');

const routesRouter = express.Router();
const { db } = require('../server/db');

routesRouter.use(express.json());

routesRouter.post('/', async (req, res) => {
  try {
    const { driverId, name, date } = req.body;
    const newRoute = await db.query(
      `INSERT INTO routes (name, ${driverId ? 'driver_id,' : ''} date)
      VALUES($(name), ${driverId ? '$(driverId),' : ''} $(date)) RETURNING *;`,
      { driverId, name, date },
    );
    res.status(200).json(keysToCamel(newRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/', async (req, res) => {
  try {
    const allRoutes = await db.query(
      `SELECT
        routes.id, routes.driver_id, routes.name,
        routes.date, route_donations.donations,
        users.role, users.first_name, users.last_name,
        users.phone_number, users.email
      FROM routes
      LEFT JOIN (SELECT
          dd.route_id,
          array_agg(json_build_object('id', dd.id, 'route_id', dd.route_id,
            'order_num', dd.order_num, 'status', dd.status,
            'address_street', dd.address_street, 'address_city', dd.address_city,
            'address_unit', dd.address_unit, 'address_zip', dd.address_zip,
            'first_name', dd.first_name, 'last_name', dd.last_name, 'email', dd.email,
            'phone_num', dd.phone_num, 'notes', dd.notes, 'submitted_date', dd.submitted_date,
            'pickup_date', dd.pickup_date, 'furniture', dd.furniture,
            'pictures', dd.pictures)) as donations
        FROM (${donationsQuery}) as dd
        GROUP BY dd.route_id) as route_donations
      ON route_donations.route_id = routes.id
      LEFT JOIN users ON routes.driver_id = users.id;`,
    );
    const nonRescheduledRoutes = allRoutes.map((cell) => {
      if (!cell.donations) {
        return { ...cell };
      }
      const donations = cell.donations.filter((d) => d.status !== 'reschedule');
      return { ...cell, donations: donations.length > 0 ? donations : null };
    });
    res.status(200).json(keysToCamel(nonRescheduledRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const driverRoutes = await db.query(
      `
      WITH routes(id, driver_id, name, date) AS
        (SELECT * FROM routes WHERE driver_id = $(driverId))
      SELECT
        routes.id, routes.driver_id, routes.name,
        routes.date, route_donations.donations,
        users.role, users.first_name, users.last_name,
        users.phone_number, users.email
      FROM routes
      LEFT JOIN (SELECT
          dd.route_id,
          array_agg(json_build_object('id', dd.id, 'route_id', dd.route_id,
            'order_num', dd.order_num, 'status', dd.status,
            'address_street', dd.address_street, 'address_city', dd.address_city,
            'address_unit', dd.address_unit, 'address_zip', dd.address_zip,
            'first_name', dd.first_name, 'last_name', dd.last_name, 'email', dd.email,
            'phone_num', dd.phone_num, 'notes', dd.notes, 'submitted_date', dd.submitted_date,
            'pickup_date', dd.pickup_date, 'furniture', dd.furniture,
            'pictures', dd.pictures)) as donations
        FROM (SELECT
          d.id, d.route_id, d.order_num, d.status,
          d.address_street, d.address_city, d.address_unit,
          d.address_zip, d.first_name, d.last_name, d.email,
          d.phone_num, d.notes, d.submitted_date, relation3.pickup_date,
          COALESCE(relation1.furniture, '{}') AS furniture,
          COALESCE(relation2.pictures, '{}') AS pictures
          FROM (SELECT * FROM donations
            WHERE route_id IN
            (SELECT id FROM routes WHERE driver_id = $(driverId))
          ) AS d
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
          ORDER BY d.order_num) as dd
        GROUP BY dd.route_id) as route_donations
      ON route_donations.route_id = routes.id
      LEFT JOIN users ON routes.driver_id = users.id
      WHERE driver_id = $(driverId);`,
      {
        driverId,
      },
    );
    const nonRescheduledRoutes = driverRoutes.map((cell) => {
      if (!cell.donations) {
        return cell;
      }
      const donations = cell.donations.filter((d) => d.status !== 'reschedule');
      return { ...cell, donations: donations.length > 0 ? donations : null };
    });
    res.status(200).json(keysToCamel(nonRescheduledRoutes));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeInfo = await db.query(
      `
      SELECT
        routes.id, routes.driver_id, routes.name,
        routes.date, route_donations.donations,
        users.role, users.first_name, users.last_name,
        users.phone_number, users.email
      FROM (SELECT * FROM routes WHERE id = $(routeId)) AS routes
      LEFT JOIN (SELECT
          dd.route_id,
          array_agg(json_build_object('id', dd.id, 'route_id', dd.route_id,
            'order_num', dd.order_num, 'status', dd.status,
            'address_street', dd.address_street, 'address_city', dd.address_city,
            'address_unit', dd.address_unit, 'address_zip', dd.address_zip,
            'first_name', dd.first_name, 'last_name', dd.last_name, 'email', dd.email,
            'phone_num', dd.phone_num, 'notes', dd.notes, 'submitted_date', dd.submitted_date,
            'pickup_date', dd.pickup_date, 'furniture', dd.furniture,
            'pictures', dd.pictures)) as donations
        FROM (SELECT
          d.id, d.route_id, d.order_num, d.status,
          d.address_street, d.address_city, d.address_unit,
          d.address_zip, d.first_name, d.last_name, d.email,
          d.phone_num, d.notes, d.submitted_date, relation3.pickup_date,
          COALESCE(relation1.furniture, '{}') AS furniture,
          COALESCE(relation2.pictures, '{}') AS pictures
          FROM (SELECT * FROM donations WHERE route_id = $(routeId)) AS d
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
          ORDER BY d.order_num) as dd
        GROUP BY dd.route_id) as route_donations
      ON route_donations.route_id = routes.id
      LEFT JOIN users ON routes.driver_id = users.id;`,
      { routeId },
    );
    if (routeInfo[0].donations) {
      const filteredDonations = routeInfo[0].donations.filter((d) => d.status !== 'reschedule');
      const filteredRouteInfo = { ...routeInfo[0], donations: filteredDonations };
      res.status(200).json(keysToCamel([filteredRouteInfo]));
    } else {
      res.status(200).json(keysToCamel(routeInfo));
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { driverId, name, date } = req.body;
    const updatedRoute = await db.query(
      `UPDATE routes SET
    ${driverId ? 'driver_id = $(driverId), ' : ''}
    ${name ? 'name = $(name), ' : ''}
    ${date ? 'date = $(date), ' : ''}
    id = $(routeId)
     WHERE id = $(routeId) RETURNING *;`,
      { driverId, routeId, name, date },
    );
    res.status(200).json(keysToCamel(updatedRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

routesRouter.delete('/:routeId', async (req, res) => {
  // double check if this recursively deletes in donations (or if it even allows you to delete without CASCADE keyword)
  try {
    const { routeId } = req.params;
    const deletedRoute = await db.query(`DELETE FROM routes WHERE id = $(routeId) RETURNING *;`, {
      routeId,
    });

    res.status(200).json(keysToCamel(deletedRoute));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = routesRouter;
