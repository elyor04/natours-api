const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = (email, subject, message) => {
  const mailOptions = {
    from: "Elyor Tukhtamuratov <hello@elyor.com>",
    to: email,
    subject,
    text: message,
  };
  return transport.sendMail(mailOptions);
};

module.exports = sendEmail;
