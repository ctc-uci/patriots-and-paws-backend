const express = require('express');

const router = express.Router();

const { pool } = require('../server/db');

const { keysToCamel } = require('../common/utils');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newUser = await pool.query(
      `INSERT INTO users VALUES('${data.id}', '${data.role}', '${data.firstName}' , '${data.lastName}', '${data.phoneNumber}', '${data.email}') RETURNING *;`,
    );
    res.status(200).json(keysToCamel(newUser.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const allUsers = await pool.query(`SELECT * FROM users;`);
    res.status(200).json(keysToCamel(allUsers.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    res.status(200).json(keysToCamel(userInfo.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const updateUser = await pool.query(`UPDATE users SET 
    ${data.id ? `id = '${data.id}', ` : ''}
    ${data.role ? `role = '${data.role}', ` : ''}
    ${data.firstName ? `first_name = '${data.firstName}', ` : ''}
    ${data.lastName ? `last_name = '${data.lastName}', ` : ''}
    ${data.phoneNumber ? `phone_number = '${data.phoneNumber}', ` : ''}
    ${data.email ? `email = '${data.email}' ` : ''}
     WHERE id = '${userId}' RETURNING *;`);
    res.status(200).json(keysToCamel(updateUser.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deleteUser = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [userId]);
    res.status(200).json(keysToCamel(deleteUser.rows[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
