const mongoose = require('mongoose')
const dotenv = require('dotenv')

//Subscribing to an error event that emitted outside express (Synchronously)
//Should be put before any code running, that's why its on top
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('UNCAUGHT EXCEPTION OCCURED! Shutting down...')
  process.exit(1)
})

const app = require('./app')

/*
MAILTRAP_USERNAME=c311cff290b08c
MAILTRAP_PASSWORD=c41cda4dd59f9c
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=25
EMAIL_FROM=hafizmhmd9@gmail.com
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=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
SENDGRID_HOST=smtp.sendgrid.net
SENDGRID_PORT=25
STRIPE_SECRET_KEY=sk_test_4MP3bBTU497ZnOEpT8XMbwnw00D3iBHwwH
*/

dotenv.config({ path: './config.env' })


const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connection to DB successful!'))

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`)
})

//Subscribing to an error event that emitted outside express (async)
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION OCCURED! Shutting down...')
  server.close(() => process.exit(1))
})
