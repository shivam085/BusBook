const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');
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

    // Force IPv4 lookup for Render compatibility
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
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        servername: 'smtp.gmail.com', // Required when connecting via IP address
        rejectUnauthorized: false
      }
    });

    const mail = {
      from: '"BusBook Tickets" <' + process.env.EMAIL_USER + '>',
      to: options.email,
      subject: options.subject,
      text: emailTextual,
      html: emailHtml,
      attachments: options.attachments || [],
    };

    await transporter.sendMail(mail);
    console.log(`Email successfully sent to ${options.email} via IPv4: ${ipv4}`);
  } catch (error) {
    console.error(
      'Email service failed. Make sure that you have provided your SMTP credentials in the .env file'
    );
    console.error('Error: ', error);
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
