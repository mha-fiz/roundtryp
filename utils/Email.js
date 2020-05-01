const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  //a. create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  //b. config the email
  const emailConfig = {
    from: 'Muhamad Hafiz <hafizmhmh9@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  //c. send the email
  await transporter.sendMail(emailConfig)
}

module.exports = sendEmail
