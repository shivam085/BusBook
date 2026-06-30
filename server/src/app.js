const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const { errorHandler } = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

module.exports = app;
