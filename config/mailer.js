const nodemailer = require('nodemailer');

const transporters = {
  'prottoy.ceo@cloudcompany.cc': nodemailer.createTransport({
    host: 'cloudcompany.cc',
    port: 587,
    secure: false,
    auth: {
      user: 'prottoy.ceo@cloudcompany.cc',
      pass: 'prottoylovessamia2441139',
    },
  }),
  'info@cloudcompany.cc': nodemailer.createTransport({
    host: 'cloudcompany.cc',
    port: 465,
    secure: true,
    auth: {
      user: 'info@cloudcompany.cc',
      pass: 'prottoysamia2441139',
    },
  }),
  'support@cloudcompany.cc': nodemailer.createTransport({
    host: 'cloudcompany.cc',
    port: 465,
    secure: true,
    auth: {
      user: 'support@cloudcompany.cc',
      pass: 'prottoyprottoy',
    },
  }),
};

const infoTransporter = nodemailer.createTransport({
  host: 'cloudcompany.cc',
  port: 465,
  secure: true,
  auth: {
    user: 'info@cloudcompany.cc',
    pass: 'prottoysamia2441139',
  },
});

module.exports = { transporters, infoTransporter };
