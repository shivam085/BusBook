import nodemailer from 'nodemailer';

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
    const authHeader = req.headers.authorization;
    const proxySecret = process.env.EMAIL_PROXY_SECRET;

    if (!proxySecret || authHeader !== `Bearer ${proxySecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { to, subject, html, text, attachments = [] } = req.body;

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

    const result = await transporter.sendMail({
      from: '"BusBook Tickets" <' + process.env.EMAIL_USER + '>',
      to,
      subject,
      text,
      html,
      attachments: attachments.map(({ filename, content, contentType }) => ({
        filename,
        content: Buffer.from(content, 'base64'),
        contentType
      }))
    });

    if (!result.accepted.length) {
      return res.status(502).json({ error: 'SMTP rejected the recipient' });
    }

    res.status(200).json({ success: true, message: 'Email sent successfully via Vercel Proxy' });
  } catch (error) {
    console.error('Email Proxy Error:', error.code || error.name, error.responseCode || '');
    res.status(500).json({ error: 'Email delivery failed' });
  }
}
