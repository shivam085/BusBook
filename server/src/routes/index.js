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
  const dns = require('dns');
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Missing EMAIL_USER or EMAIL_PASS in Render env variables' });
    }
    
    // Manually force IPv4 resolution
    const ipv4 = await new Promise((resolve, reject) => {
      dns.lookup('smtp.gmail.com', 4, (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });

    const transporter = nodemailer.createTransport({
      host: ipv4,
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: {
        servername: 'smtp.gmail.com', // Required when connecting via IP
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    await transporter.sendMail({
      from: '"BusBook Live Test" <' + process.env.EMAIL_USER + '>',
      to: 'bbllive101@gmail.com',
      subject: 'Live Server Email Test (IPv4 Forced)',
      text: 'This email was sent from the Render server directly using forced IPv4!'
    });
    res.json({ success: true, message: `Email sent successfully from Render via IPv4: ${ipv4}` });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack, code: error.code });
  }
});

module.exports = router;
