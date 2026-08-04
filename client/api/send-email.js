const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, attachments } = req.body;
    const authHeader = req.headers.authorization;

    // Use a simple secret key to prevent unauthorized usage
    if (authHeader !== `Bearer ${process.env.EMAIL_PROXY_SECRET || 'busbook-secret-key-123'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Server email credentials missing' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"BusBook Tickets" <' + process.env.EMAIL_USER + '>',
      to,
      subject,
      text,
      html,
      attachments
    });

    res.status(200).json({ success: true, message: 'Email sent successfully via Vercel Proxy' });
  } catch (error) {
    console.error('Email Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
}
