const express = require('express');

const router = express.Router();

const { db } = require('../server/db');

const { keysToCamel } = require('../common/utils');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const { id, role, firstName, lastName, phoneNumber, email } = req.body;
    const newUser = await db.query(
      `INSERT INTO users VALUES('${id}', '${role}', '${firstName}' , '${lastName}', '${phoneNumber}', '${email}') RETURNING *;`,
    );
    res.status(200).json(keysToCamel(newUser[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const allUsers = await db.query(`SELECT * FROM users;`);
    res.status(200).json(keysToCamel(allUsers));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
    res.status(200).json(keysToCamel(userInfo[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { body: data } = req;
    const updatedUser = await db.query(`UPDATE users SET 
    ${data.id ? `id = '${data.id}', ` : ''}
    ${data.role ? `role = '${data.role}', ` : ''}
    ${data.firstName ? `first_name = '${data.firstName}', ` : ''}
    ${data.lastName ? `last_name = '${data.lastName}', ` : ''}
    ${data.phoneNumber ? `phone_number = '${data.phoneNumber}', ` : ''}
    ${data.email ? `email = '${data.email}' ` : ''}
     WHERE id = '${userId}' RETURNING *;`);
    res.status(200).json(keysToCamel(updatedUser[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await db.query(`DELETE FROM users WHERE id = ${userId} RETURNING *;`);
    res.status(200).json(deletedUser ? keysToCamel(deletedUser[0]) : []);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
