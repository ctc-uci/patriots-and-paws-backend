const express = require('express');

const router = express.Router();
const { pool } = require('../server/db');

router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newUser = await pool.query(
      `INSERT INTO users VALUES('${data.id}', '${data.role}', '${data.firstName}' , '${data.lastName}', '${data.phoneNumber}', '${data.email}') RETURNING *;`,
    );
    res.status(200).json(newUser.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const getUser = await pool.query(`SELECT * FROM users WHERE id = '${userId}'`);
    res.status(200).json(getUser.rows[0]);
  } catch (err) {
    console.log(err);
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
    res.status(200).json(updateUser.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deleteUser = await pool.query(`DELETE FROM users WHERE id = '${userId}' RETURNING *;`);
    res.status(200).json(deleteUser.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

module.exports = router;
