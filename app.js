const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Routes
const { authRouter, verifyToken } = require('./routes/auth');
const users = require('./routes/users');
const routes = require('./routes/routes');
const donations = require('./routes/donations');
const s3UploadRouter = require('./routes/s3upload');
const nodemailer = require('./routes/nodeMailer');
const pictures = require('./routes/pictures');
const furniture = require('./routes/furniture');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json()); // for req.body
app.use('/auth', [verifyToken, authRouter]);
app.use('/users', users);
app.use('/routes', routes);
app.use('/donations', donations);
app.use('/s3Upload', s3UploadRouter);
app.use('/nodemailer', nodemailer);
app.use('/pictures', pictures);
app.use('/furniture', furniture);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
