const nodemailer = require('nodemailer');

require('dotenv').config();

// sender information
const transport = {
  host: 'smtp.gmail.com', // e.g. smtp.gmail.com
  auth: {
    user: process.env.REACT_APP_EMAIL_USERNAME,
    pass: process.env.REACT_APP_EMAIL_PASSWORD,
  },
  from: process.env.REACT_APP_EMAIL_USERNAME,
  secure: true,
};

const transporter = nodemailer.createTransport(transport);

module.exports = transporter;
