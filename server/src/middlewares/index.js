const authMiddleware = require('./auth.middleware');
const errorHandler = require('./error.middleware');

module.exports = {
  ...authMiddleware,
  errorHandler
};
