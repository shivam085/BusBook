const Mailgen = require('mailgen');
const dns = require('dns');

// Force IPv4 for DNS resolution. Fixes "connect ENETUNREACH" IPv6 errors on Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'BusBook System',
      link: 'https://busbook.com',
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Skipping email: No SMTP credentials configured.');
      return;
    }

    // Use Vercel Serverless Function Proxy because Render's free tier blocks all outbound SMTP
    const proxyUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/api/send-email` : 'https://bus-book-blue.vercel.app/api/send-email';
    
    console.log(`Sending email request to Vercel proxy: ${proxyUrl}...`);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_PROXY_SECRET || 'busbook-secret-key-123'}`
      },
      body: JSON.stringify({
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
        attachments: options.attachments || []
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unknown proxy error');
    }

    console.log(`Email successfully sent to ${options.email} via Vercel proxy!`);
  } catch (error) {
    console.error('Email service failed via Vercel Proxy:', error);
  }
};

const ticketConfirmationMailgenContent = (username) => {
  return {
    body: {
      name: username,
      intro: "Your payment was successful and your bus seats have been securely reserved. Please find your E-Ticket attached as a PDF document.",
      action: {
        instructions: "You can view or download your ticket anytime from your 'My Bookings' dashboard.",
        button: {
          color: "#22BC66",
          text: "View My Bookings",
          link: process.env.CLIENT_URL || "http://localhost:5173/bookings",
        },
      },
      outro: "You must present this ticket (digitally or printed) along with a valid Government ID while boarding. Have a safe trip!",
    },
  };
};

module.exports = {
  sendEmail,
  ticketConfirmationMailgenContent,
};
