const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mail = {
    from: '"BusBook Tickets" <' + process.env.EMAIL_USER + '>',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
    attachments: options.attachments || [],
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Skipping email: No SMTP credentials configured.');
      return;
    }
    await transporter.sendMail(mail);
    console.log(`Email successfully sent to ${options.email}`);
  } catch (error) {
    console.error(
      'Email service failed silently. Make sure that you have provided your SMTP credentials in the .env file'
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
