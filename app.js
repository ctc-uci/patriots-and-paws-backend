const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Routes
const userRouter = require('./routes/users');
const { authRouter, verifyToken } = require('./routes/auth');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use('/users', userRouter);
app.use('/auth', [verifyToken, authRouter]);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
