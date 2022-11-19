// Routes relating to accounts here
const express = require('express');

const userRouter = express();
const admin = require('../firebase');
const { db } = require('../server/db');

userRouter.use(express.json());

const isAlphaNumeric = (value) => {
  if (!/^[0-9a-zA-Z]+$/.test(value)) {
    throw new Error('User ID must be alphanumeric');
  }
};

// Get all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);
    res.send({
      accounts: users,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a specific user by ID
userRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    res.send({
      user: user[0],
    });
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
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Add user to database
userRouter.post('/create', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, role, userId } = req.body;
    isAlphaNumeric(userId); // ID must be alphanumeric

    const newUser = await db.query(
      'INSERT INTO users (id, role, first_name, last_name, phone_number, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, role, firstName, lastName, phoneNumber, email],
    );

    res.status(200).send({
      newUser: newUser[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Edit basic information for a specific user
userRouter.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    isAlphaNumeric(userId); // ID must be alphanumeric
    const { firstName, lastName, email, phoneNumber } = req.body;

    const user = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, email = $4 WHERE id = $5 RETURNING *',
      [firstName, lastName, phoneNumber, email, userId],
    );
    res.send({
      user: user[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
