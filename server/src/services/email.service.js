const Mailgen = require('mailgen');
const clientUrl = (process.env.CLIENT_URL || 'https://bus-book-blue.vercel.app').replace(/\/+$/, '');

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
    const proxySecret = process.env.EMAIL_PROXY_SECRET;
    if (!proxySecret) {
      console.error('Ticket email skipped: EMAIL_PROXY_SECRET is missing on the backend.');
      return;
    }

    // Use Vercel Serverless Function Proxy because Render's free tier blocks all outbound SMTP
    const proxyUrl = `${clientUrl}/api/send-email`;
    
    console.log(`Sending email request to Vercel proxy: ${proxyUrl}...`);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${proxySecret}`
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
        attachments: (options.attachments || []).map(({ filename, content, contentType }) => ({
          filename,
          content: content.toString('base64'),
          contentType
        }))
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success !== true) {
      throw new Error(`Email proxy returned HTTP ${response.status}`);
    }

    console.log('Ticket email accepted by SMTP via Vercel proxy.');
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
          link: `${clientUrl}/bookings`,
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
