const express = require('express');

const usersRouter = express.Router();

const admin = require('../firebase');
const { db } = require('../server/db');

const { keysToCamel } = require('../common/utils');

usersRouter.use(express.json());

usersRouter.post('/', async (req, res) => {
  try {
    const { id, role, firstName, lastName, phoneNumber, email } = req.body;
    const newUser = await db.query(
      `INSERT INTO users VALUES($(id), $(role), $(firstName) , $(lastName), $(phoneNumber), $(email)) RETURNING *;`,
      { id, role, firstName, lastName, phoneNumber, email },
    );
    res.status(200).json(keysToCamel(newUser));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

usersRouter.get('/', async (req, res) => {
  try {
    const allUsers = await db.query(`SELECT * FROM users;`);
    res.status(200).json(keysToCamel(allUsers));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

usersRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await db.query(`SELECT * FROM users WHERE id = $(userId)`, { userId });
    res.status(200).json(keysToCamel(userInfo));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

usersRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, firstName, lastName, phoneNumber, email, newPassword } = req.body;
    const updatedUser = await db.query(
      `UPDATE users SET 
    ${role ? 'role = $(role), ' : ''}
    ${firstName ? 'first_name = $(firstName), ' : ''}
    ${lastName ? 'last_name = $(lastName), ' : ''}
    ${phoneNumber ? 'phone_number = $(phoneNumber), ' : ''}
    ${email ? 'email = $(email), ' : ''}
    id = $(userId)
     WHERE id = $(userId) RETURNING *;`,
      { role, firstName, lastName, phoneNumber, email, userId },
    );
    if (newPassword) {
      await admin.auth().updateUser(userId, { password: newPassword });
    }
    res.status(200).json(keysToCamel(updatedUser));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

usersRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Firebase delete
    await admin.auth().deleteUser(userId);

    const deletedUser = await db.query(`DELETE FROM users WHERE id = $(userId) RETURNING *;`, {
      userId,
    });
    res.status(200).json(keysToCamel(deletedUser));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = usersRouter;
