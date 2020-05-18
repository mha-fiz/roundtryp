const pug = require('pug')
const htmlToText = require('html-to-text')
const nodemailer = require('nodemailer')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.url = url
    this.firstName = user.name.split(' ')[0]
    this.from = `${process.env.EMAIL_FROM}`
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   return nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD,
    //     },
    //   })
    // }
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.SENDGRID_HOST,
        port: process.env.SENDGRID_PORT,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      })
    }
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    })
  }

  async send(template, subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    })

    //Create email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    }

    //Create a transporter & send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Thank you for joining with us. Lets starts your adventure!'
    )
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    )
  }
}
