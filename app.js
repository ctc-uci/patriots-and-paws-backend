const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const schedule = require('node-schedule');

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
const furnitureOptions = require('./routes/furnitureOptions');

// Node Schedule jobs
const { deleteRoutes, deletePictures, updateSchedulingStatus } = require('./nodeScheduler');

// delete routes at 12 AM on the 1st and 15th of every month
schedule.scheduleJob('0 0 1,15 * *', deleteRoutes);
// delete pictures at 12 AM on the 1st of every month
schedule.scheduleJob('0 0 1 * *', deletePictures);
// update scheduling status to reschedule at 12 AM every day
schedule.scheduleJob('0 0 * * *', updateSchedulingStatus);

const app = express();

const PORT =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 3001
    : process.env.REACT_APP_PROD_PORT;

app.use(
  cors({
    origin: `${
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_HOST
        : process.env.REACT_APP_PROD_HOST
    }`,
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
app.use('/furnitureOptions', furnitureOptions);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
