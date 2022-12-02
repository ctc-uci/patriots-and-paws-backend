const express = require('express');
const cors = require('cors');

const users = require('./routes/users');
const routes = require('./routes/routes');
const donations = require('./routes/donations');

require('dotenv').config();

const s3UploadRouter = require('./routes/s3upload');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use(express.json()); // for req.body
app.use('/users', users);
app.use('/routes', routes);
app.use('/donations', donations);
app.use('/s3Upload', s3UploadRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
