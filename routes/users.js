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
    res.status(200).send(keysToCamel(users));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a specific user by ID
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const user = await db.query('SELECT * FROM users WHERE id = $(userId)', { userId });
    res.status(200).send(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a specific user by ID, both in Firebase and PNP DB
userRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    // Firebase delete
    await admin.auth().deleteUser(userId);
    // DB delete
    await db.query('DELETE FROM users WHERE id = $(userId)', { userId });

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Add user to database
userRouter.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, role, userId } = req.body;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const newUser = await db.query(
      'INSERT INTO users ($(id), $(role), $(firstName), $(lastName), $(phoneNumber), $(email)) RETURNING *;',
      { userId, role, firstName, lastName, phoneNumber, email },
    );

    res.status(200).send(keysToCamel(newUser));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Edit basic information for a specific user
userRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric
    const { firstName, lastName, email, phoneNumber } = req.body;

    const user = await db.query(
      'UPDATE users SET first_name = $(firstName), last_name = $(lastName), phone_number = $(phoneNumber), email = $(email) WHERE id = $(userId) RETURNING *',
      { firstName, lastName, phoneNumber, email, userId },
    );
    res.send(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
