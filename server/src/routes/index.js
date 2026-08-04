const express = require('express');
const authRoutes = require('./auth.routes');
const busRoutes = require('./bus.routes');
const tripRoutes = require('./trip.routes');
const bookingRoutes = require('./booking.routes');
const walletRoutes = require('./wallet.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busRoutes);
router.use('/trips', tripRoutes);
router.use('/bookings', bookingRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);

router.get('/test-email-live', async (req, res) => {
  const nodemailer = require('nodemailer');
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Missing EMAIL_USER or EMAIL_PASS in Render env variables' });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.verify();
    await transporter.sendMail({
      from: '"BusBook Live Test" <' + process.env.EMAIL_USER + '>',
      to: 'bbllive101@gmail.com',
      subject: 'Live Server Email Test',
      text: 'This email was sent from the Render server directly!'
    });
    res.json({ success: true, message: 'Email sent successfully from Render!' });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack, code: error.code });
  }
});

module.exports = router;
