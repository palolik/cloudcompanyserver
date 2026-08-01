const { CORS_ORIGINS } = require('./env');

module.exports = {
  origin: CORS_ORIGINS,
  credentials: true,
};
