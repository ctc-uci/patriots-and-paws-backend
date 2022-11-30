// Routes relating to accounts here
const express = require('express');

const userRouter = express();
const admin = require('../firebase');
const { db } = require('../server/db');
const { isAlphaNumeric, keysToCamel } = require('../common/utils');

userRouter.use(express.json());

// Get all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);
    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a specific user by ID
userRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    isAlphaNumeric(id); // ID must be alphanumeric

    const user = await db.query('SELECT * FROM users WHERE id = $(id)', { id });
    res.status(200).json(keysToCamel(user) ?? []);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a specific user by ID, both in Firebase and PNP DB
userRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    isAlphaNumeric(id); // ID must be alphanumeric

    // Firebase delete
    await admin.auth().deleteUser(id);
    // DB delete
    await db.query('DELETE FROM users WHERE id = $(id)', { id });

    res.status(200).send(`Deleted user with ID: ${id}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Add user to database
userRouter.post('/', async (req, res) => {
  try {
    const { id, role, firstName, lastName, email, phoneNumber } = req.body;
    isAlphaNumeric(id); // ID must be alphanumeric

    const newUser = await db.query(
      'INSERT INTO users VALUES ($(id), $(role), $(firstName), $(lastName), $(phoneNumber), $(email)) RETURNING *;',
      { id, role, firstName, lastName, phoneNumber, email },
    );

    res.status(200).json(keysToCamel(newUser) ?? []);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Edit basic information for a specific user
userRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    isAlphaNumeric(id); // ID must be alphanumeric
    const { firstName, lastName, email, phoneNumber } = req.body;

    const user = await db.query(
      'UPDATE users SET first_name = $(firstName), last_name = $(lastName), phone_number = $(phoneNumber), email = $(email) WHERE id = $(id) RETURNING *',
      { firstName, lastName, phoneNumber, email, id },
    );
    res.status(200).json(keysToCamel(user) ?? []);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
