const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Tour = require('../../models/TourModel')

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

//  #1 Read the JSON file
const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'))

//  #2 Import data to DB
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data successfully loaded!')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}

//  #3 Delete existing document in DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data are deleted!')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}

//  #4 Set wether to import or delete by running this line in terminal:
//  node dev-data/data/import-dev-data.js --import || --delete
if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
}
