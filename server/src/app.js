const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const { errorHandler } = require('./middlewares');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // or your frontend url
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

module.exports = app;
