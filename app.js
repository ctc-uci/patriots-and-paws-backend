const express = require('express');
const cors = require('cors');

const users = require('./routes/users');
const routes = require('./routes/routes');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use('/users', users);
app.use('/routes', routes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
