const mongoose = require('mongoose')
const dotenv = require('dotenv')

//Subscribing to an error event that emitted outside express (Synchronously)
//Should be put before any code running, that's why its on top
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('UNCAUGHT EXCEPTION OCCURED! Shutting down...')
  process.exit(1)
})

dotenv.config({ path: './config.env' })
const app = require('./app')

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
