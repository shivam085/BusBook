const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const { errorHandler } = require('./middlewares');

const app = express();

// Dynamic CORS: allow production URL + all Vercel preview URLs
const allowedOrigin = (origin, callback) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  if (!origin || origin === clientUrl || origin.endsWith('.vercel.app')) {
    callback(null, origin);
  } else {
    callback(null, clientUrl);
  }
};

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

module.exports = app;
